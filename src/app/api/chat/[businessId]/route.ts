/**
 * File: src/app/api/chat/[businessId]/route.ts
 * 
 * Type-safe chat API with proper error handling
 */
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import {
  getOrCreateChatSession,
  getChatMessages,
  saveChatMessage,
  isValidUUID,
  ChatMessage
} from '@/lib/utils/chat-helpers'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const runtime = 'edge'

interface Business {
  id: string
  name: string
  description: string | null
  category: string
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  hours: any
  ai_prompt: string | null
}

// Generate business-specific system prompt
function generateSystemPrompt(business: Business): string {
  const businessInfo = `
Business Name: ${business.name}
Category: ${business.category}
Description: ${business.description || 'N/A'}
Location: ${[business.address, business.city, business.state].filter(Boolean).join(', ')}
Phone: ${business.phone || 'N/A'}
Email: ${business.email || 'N/A'}
Website: ${business.website || 'N/A'}
Business Hours: ${business.hours ? JSON.stringify(business.hours) : 'Not specified'}
  `.trim()

  const systemPrompt = `You are a helpful and knowledgeable employee at ${business.name}, a ${business.category} business. Your role is to assist customers by providing information about our business, answering questions, and helping them with their needs.

IMPORTANT INSTRUCTIONS:
- Always identify yourself as an employee of ${business.name}, never as an AI assistant or virtual assistant
- Provide accurate information about our business using the context below
- If asked about something outside our business scope, politely redirect to business-related topics
- Be friendly, professional, and helpful
- Use first person when referring to the business (e.g., "We are located at..." instead of "They are located at...")
- Focus on helping customers with information about hours, services, location, contact info, and general business questions

BUSINESS INFORMATION:
${businessInfo}

${business.ai_prompt ? `\nADDITIONAL INSTRUCTIONS:\n${business.ai_prompt}` : ''}

Remember to always stay in character as an employee of ${business.name} and focus on helping customers with information about our business.`

  return systemPrompt
}

// GET: Retrieve chat history
export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('sessionToken')
    
    if (!sessionToken) {
      return NextResponse.json({ messages: [] })
    }
    
    // Validate businessId
    if (!isValidUUID(params.businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 })
    }
    
    // Get session and verify it belongs to this business
    try {
      const { session } = await getOrCreateChatSession(params.businessId, sessionToken)
      const messages = await getChatMessages(session.id)
      
      return NextResponse.json({ messages })
    } catch (error) {
      console.error('Error fetching chat history:', error)
      return NextResponse.json({ messages: [] })
    }
  } catch (error) {
    console.error('Error in GET /api/chat/[businessId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Send message and get AI response
export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { message, sessionToken } = await request.json()
    
    // Validate input
    if (!message?.trim()) {
      return new Response('Message is required', { status: 400 })
    }
    
    if (!isValidUUID(params.businessId)) {
      return new Response('Invalid business ID', { status: 400 })
    }
    
    const supabase = createSupabaseAdmin()
    
    // Get business information
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', params.businessId)
      .single()
    
    if (businessError || !business) {
      console.error('Business not found:', businessError)
      return new Response('Business not found', { status: 404 })
    }
    
    if (!business.ai_enabled) {
      return new Response('AI chat is not enabled for this business', { status: 403 })
    }
    
    // Get or create session
    const { session, isNewSession } = await getOrCreateChatSession(params.businessId, sessionToken)
    const currentSessionToken = session.session_token
    
    // Generate system prompt with business context
    const systemPrompt = generateSystemPrompt(business)
    
    // Get previous messages for context (last 10 messages)
    const previousMessages = await getChatMessages(session.id)
    const recentMessages = previousMessages.slice(-10)
    
    // Prepare messages for OpenAI
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]
    
    // Add previous messages from this session
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: message
    })
    
    // Save user message to database
    await saveChatMessage(session.id, 'user', message)
    
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get AI response
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            stream: true,
            max_tokens: 500,
            temperature: 0.7,
          })
          
          let assistantMessage = ''
          
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta
            if (delta?.content) {
              assistantMessage += delta.content
              
              // Send chunk to client
              const encoder = new TextEncoder()
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                content: delta.content,
                done: false
              })}\n\n`))
            }
          }
          
          // Save assistant message to database
          await saveChatMessage(session.id, 'assistant', assistantMessage)
          
          // Send completion signal
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            content: '',
            done: true
          })}\n\n`))
          
          controller.close()
        } catch (error) {
          console.error('Error in streaming:', error)
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            error: 'Failed to generate response'
          })}\n\n`))
          controller.close()
        }
      }
    })
    
    // Return streaming response with session token
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Token': currentSessionToken,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error in POST /api/chat/[businessId]:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}