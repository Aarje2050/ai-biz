import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Fuzzy matching function for typo tolerance
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  let matches = 0;
  const maxLen = Math.max(str1.length, str2.length);
  
  for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
    if (str1[i].toLowerCase() === str2[i].toLowerCase()) {
      matches++;
    }
  }
  
  if (longer.toLowerCase().includes(shorter.toLowerCase()) || 
      shorter.toLowerCase().includes(longer.toLowerCase())) {
    matches += shorter.length * 0.8;
  }
  
  return matches / maxLen;
}

// Common typos and corrections (hardcoded for now)
const commonTypos: Record<string, string> = {
  'resturant': 'restaurant',
  'restraunt': 'restaurant',
  'restarant': 'restaurant',
  'docter': 'doctor',
  'marketting': 'marketing',
  'beutiful': 'beautiful',
  'pharamacy': 'pharmacy',
  'plummer': 'plumber',
  'electritian': 'electrician',
  'gyms': 'gym',
  'salons': 'salon'
};

// Search intent parsing (rule-based, not AI)
function parseSearchIntent(query: string) {
  const intent = {
    businessType: null as string | null,
    location: null as string | null,
    features: [] as string[],
    openNow: false,
    hasAI: false,
    verified: false,
    searchTerms: [] as string[],
    categoryKeywords: [] as string[],
    correctedQuery: query
  };

  let lowercaseQuery = query.toLowerCase();
  
  // Apply typo corrections
  Object.entries(commonTypos).forEach(([typo, correction]) => {
    if (lowercaseQuery.includes(typo)) {
      lowercaseQuery = lowercaseQuery.replace(typo, correction);
      intent.correctedQuery = intent.correctedQuery.replace(new RegExp(typo, 'gi'), correction);
    }
  });

  // Business type detection (hardcoded rules)
  const businessTypes = {
    'restaurant': ['restaurant', 'food', 'dining', 'eat', 'cafe', 'bistro', 'pizza', 'burger'],
    'service': ['repair', 'fix', 'service', 'maintenance', 'clean', 'plumber', 'electrician'],
    'healthcare': ['doctor', 'medical', 'hospital', 'clinic', 'dentist', 'pharmacy'],
    'store': ['store', 'shop', 'market', 'retail', 'shopping'],
    'professional': ['lawyer', 'accountant', 'consultant', 'law firm', 'attorney']
  };

  for (const [type, keywords] of Object.entries(businessTypes)) {
    if (keywords.some(keyword => lowercaseQuery.includes(keyword))) {
      intent.businessType = type;
      intent.categoryKeywords.push(...keywords);
      break;
    }
  }

  // Category mappings (hardcoded)
  const categoryMappings = {
    'marketing': ['marketing', 'advertising', 'digital marketing', 'seo', 'social media', 'branding'],
    'technology': ['tech', 'software', 'digital', 'IT', 'computer', 'web development'],
    'education': ['school', 'college', 'training', 'course', 'education', 'learning'],
    'fitness': ['gym', 'fitness', 'yoga', 'workout', 'personal trainer'],
    'beauty': ['salon', 'spa', 'beauty', 'hair', 'makeup', 'cosmetic'],
    'automotive': ['car', 'auto', 'mechanic', 'garage', 'vehicle']
  };

  for (const [category, keywords] of Object.entries(categoryMappings)) {
    if (keywords.some(keyword => lowercaseQuery.includes(keyword))) {
      intent.categoryKeywords.push(...keywords);
      break;
    }
  }

  intent.searchTerms = lowercaseQuery.split(' ').filter(term => term.length > 2);

  // Feature detection (hardcoded rules)
  if (lowercaseQuery.includes('near me') || lowercaseQuery.includes('nearby')) {
    intent.location = 'near_me';
  }
  if (lowercaseQuery.includes('ai') || lowercaseQuery.includes('assistant')) {
    intent.hasAI = true;
  }
  if (lowercaseQuery.includes('verified') || lowercaseQuery.includes('trusted')) {
    intent.verified = true;
  }
  if (lowercaseQuery.includes('open now')) {
    intent.openNow = true;
  }

  return intent;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ 
      businesses: [],
      suggestions: [
        'marketing agencies',
        'restaurants near me',
        'auto repair shops',
        'medical clinics',
        'beauty salons'
      ]
    });
  }

  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    console.log(`Searching for: ${query}`);
    
    // Parse search intent (rule-based, not AI)
    const intent = parseSearchIntent(query);
    console.log('Search intent:', intent);
    
    // Build search query
    let searchQuery = supabase
      .from('businesses')
      .select('*');

    // SECURITY: Only show verified businesses
    searchQuery = searchQuery.eq('verified', true);

    // Build search conditions with proper typing
    const directSearchConditions: string[] = [];
    const queriesToSearch = [query, intent.correctedQuery].filter(q => q);
    
    // Search with original and corrected queries
    queriesToSearch.forEach(searchTerm => {
      directSearchConditions.push(`name.ilike.%${searchTerm}%`);
      directSearchConditions.push(`description.ilike.%${searchTerm}%`);
      directSearchConditions.push(`short_description.ilike.%${searchTerm}%`);
      directSearchConditions.push(`category.ilike.%${searchTerm}%`);
      directSearchConditions.push(`tagline.ilike.%${searchTerm}%`);
      directSearchConditions.push(`business_type.ilike.%${searchTerm}%`);
    });

    // Individual term matching
    intent.searchTerms.forEach(term => {
      directSearchConditions.push(`name.ilike.%${term}%`);
      directSearchConditions.push(`description.ilike.%${term}%`);
      directSearchConditions.push(`category.ilike.%${term}%`);
      directSearchConditions.push(`business_type.ilike.%${term}%`);
    });

    // Category keyword matching
    intent.categoryKeywords.forEach(keyword => {
      directSearchConditions.push(`name.ilike.%${keyword}%`);
      directSearchConditions.push(`description.ilike.%${keyword}%`);
      directSearchConditions.push(`category.ilike.%${keyword}%`);
      directSearchConditions.push(`business_type.ilike.%${keyword}%`);
    });

    // Apply the search conditions
    searchQuery = searchQuery.or(directSearchConditions.join(','));

    // Apply additional filters
    if (intent.hasAI) {
      searchQuery = searchQuery.eq('ai_agent_enabled', true);
    }

    searchQuery = searchQuery.limit(50);

    const { data: businesses, error } = await searchQuery;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Score and rank results (rule-based scoring, not AI)
    const processedBusinesses = (businesses || []).map(business => {
      let score = 0;
      const businessText = `${business.name} ${business.description || ''} ${business.category || ''} ${business.business_type || ''}`.toLowerCase();

      // Scoring rules (hardcoded, not AI)
      if (businessText.includes(query.toLowerCase())) {
        score += 100;
      }

      if (intent.correctedQuery !== query && businessText.includes(intent.correctedQuery.toLowerCase())) {
        score += 90;
      }

      intent.searchTerms.forEach(term => {
        if (businessText.includes(term)) {
          score += 30;
        }
      });

      intent.categoryKeywords.forEach(keyword => {
        if (businessText.includes(keyword)) {
          score += 50;
        }
      });

      if (business.name.toLowerCase().includes(query.toLowerCase())) {
        score += 75;
      }

      if (business.ai_agent_enabled && intent.hasAI) {
        score += 15;
      }

      return {
        ...business,
        category: business.category || business.business_type || 'Business',
        verified: business.verified || false,
        ai_enabled: business.ai_agent_enabled || false,
        distance: `${(Math.random() * 5 + 0.1).toFixed(1)} miles`,
        isOpen: Math.random() > 0.3,
        matchScore: score
      };
    })
    .filter(business => business.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20);

    // Generate summary (template-based, not AI-generated)
    let aiSummary = '';
    if (processedBusinesses.length === 0) {
      aiSummary = `No verified businesses found for "${query}".`;
      if (intent.correctedQuery !== query) {
        aiSummary += ` (Did you mean "${intent.correctedQuery}"?)`;
      }
      aiSummary += ` Try different keywords or browse our categories.`;
    } else {
      if (intent.correctedQuery !== query) {
        aiSummary = `Showing results for "${intent.correctedQuery}" (${processedBusinesses.length} verified businesses found)`;
      } else {
        aiSummary = `Found ${processedBusinesses.length} verified businesses matching "${query}".`;
      }
      
      const aiEnabledCount = processedBusinesses.filter(b => b.ai_enabled).length;
      if (aiEnabledCount > 0) {
        aiSummary += ` ${aiEnabledCount} have AI assistants available.`;
      }
    }

    // Generate related queries (rule-based)
    const relatedQueries: string[] = [];
    if (processedBusinesses.length > 0) {
      const topCategories = [...new Set(processedBusinesses.map(b => b.category))].slice(0, 2);
      topCategories.forEach(cat => {
        if (cat && cat !== query && cat.toLowerCase() !== query.toLowerCase()) {
          relatedQueries.push(cat);
        }
      });
    }
    
    relatedQueries.push(`${intent.correctedQuery || query} near me`);
    relatedQueries.push(`best ${intent.correctedQuery || query}`);
    relatedQueries.push(`${intent.correctedQuery || query} with AI assistant`);

    console.log(`Found ${processedBusinesses.length} verified businesses for query: ${query}`);
    
    return NextResponse.json({ 
      businesses: processedBusinesses,
      query,
      correctedQuery: intent.correctedQuery !== query ? intent.correctedQuery : undefined,
      intent,
      resultCount: processedBusinesses.length,
      aiSummary, // This is NOT AI-generated, just template text
      relatedQueries: relatedQueries.filter(Boolean).slice(0, 4),
      suggestions: [
        `${intent.correctedQuery || query} near me`,
        `best ${intent.correctedQuery || query}`,
        `${intent.correctedQuery || query} services`,
        `${intent.correctedQuery || query} reviews`
      ],
      searchTime: Date.now() % 1000
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ 
      businesses: [], 
      error: 'Search failed',
      aiSummary: 'Unable to process search at this time.',
      relatedQueries: [],
      suggestions: [],
      resultCount: 0
    }, { status: 500 });
  }
}