/**
 * File: src/lib/ai/openai.ts
 * 
 * OpenAI service with streaming support and error handling
 */
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

// Initialize OpenAI client with configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Use edge runtime compatible configuration
  maxRetries: 3,
  timeout: 30000, // 30 seconds timeout
})

// Default AI configuration
export const AI_CONFIG = {
  model: 'gpt-3.5-turbo', // Fast and cost-effective
  temperature: 0.7, // Balanced creativity
  maxTokens: 300, // Reasonable response length
  streamingChunkSize: 64, // Size of streaming chunks
}

// Business category specific prompts for better performance
export const CATEGORY_PROMPTS: Record<string, string> = {
  'Restaurant': `You are a helpful assistant for this restaurant. You can help with menu questions, hours, reservations, and dining recommendations. Be friendly and informative about the food and dining experience.`,
  
  'Retail': `You are a helpful assistant for this retail store. You can provide information about products, availability, store hours, return policies, and help customers find what they're looking for.`,
  
  'Healthcare': `You are a professional assistant for this healthcare practice. You can help with general office information, hours, services offered, and appointment scheduling. Always remind users to contact the office directly for specific medical questions.`,
  
  'Professional Services': `You are a helpful assistant for this professional service business. You can provide information about services offered, pricing, availability, and how to get started as a client.`,
  
  'Beauty & Wellness': `You are a helpful assistant for this beauty and wellness business. You can answer questions about services, pricing, products, booking appointments, and aftercare recommendations.`,
  
  'Automotive': `You are a helpful assistant for this automotive business. You can help with service information, hours, pricing, types of repairs, and general automotive advice.`,
  
  'Other': `You are a helpful assistant for this business. You can provide information about their services, hours, contact details, and help answer questions about what they offer.`
}

// Get business-specific prompt
export function getBusinessPrompt(business: {
  name: string
  category: string
  description?: string | null
  ai_prompt?: string | null
  phone?: string | null
  hours?: any
}): string {
  // Use custom prompt if available
  if (business.ai_prompt) {
    return business.ai_prompt
  }
  
  // Get category-specific base prompt
  const basePrompt = CATEGORY_PROMPTS[business.category] || CATEGORY_PROMPTS['Other']
  
  // Build enhanced prompt with business context
  let prompt = `${basePrompt}\n\n`
  prompt += `Business: ${business.name}\n`
  
  if (business.description) {
    prompt += `Description: ${business.description}\n`
  }
  
  if (business.phone) {
    prompt += `Phone: ${business.phone}\n`
  }
  
  if (business.hours) {
    prompt += `Hours: ${JSON.stringify(business.hours)}\n`
  }
  
  prompt += `\nAlways encourage customers to contact the business directly for specific questions, bookings, or urgent matters. Be helpful, accurate, and represent the business professionally.`
  
  return prompt
}

// Create chat completion with streaming
export async function createAIChatStream(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  businessPrompt: string
): Promise<ReadableStream> {
  try {
    // Prepare messages with system prompt
    const fullMessages = [
      { role: 'system' as const, content: businessPrompt },
      ...messages
    ]
    
    console.log('Creating AI chat with messages:', fullMessages) // Debug log
    
    // Create streaming completion
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: fullMessages,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      stream: true,
    })
    
    console.log('OpenAI stream created successfully') // Debug log
    
    // Create readable stream
    return new ReadableStream({
      async start(controller) {
        try {
          let totalContent = ''
          
          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta?.content || ''
            
            if (delta) {
              totalContent += delta
              console.log('Received delta:', delta) // Debug log
              
              // Send chunk as Server-Sent Event format
              const data = `data: ${JSON.stringify({ content: delta })}\n\n`
              controller.enqueue(new TextEncoder().encode(data))
            }
          }
          
          console.log('Stream completed, total content:', totalContent) // Debug log
          
          // Signal completion
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Error in stream processing:', error)
          controller.error(error)
        }
      },
      
      cancel() {
        // Handle client disconnect
        console.log('Stream cancelled by client')
      }
    })
  } catch (error) {
    console.error('OpenAI streaming error:', error)
    
    // Create error stream
    return new ReadableStream({
      start(controller) {
        const errorData = `data: ${JSON.stringify({ 
          error: 'Failed to generate response. Please try again.' 
        })}\n\n`
        controller.enqueue(new TextEncoder().encode(errorData))
        controller.close()
      }
    })
  }
}

// Non-streaming fallback for better compatibility
export async function createAIChat(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  businessPrompt: string
): Promise<string> {
  try {
    const fullMessages = [
      { role: 'system' as const, content: businessPrompt },
      ...messages
    ]
    
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: fullMessages,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
    })
    
    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('OpenAI error:', error)
    return 'I apologize, but I cannot respond right now. Please contact the business directly for assistance.'
  }
}