/**
 * File: src/lib/utils/chat-helpers.ts
 * 
 * Helper functions for chat functionality with proper type safety
 */
import { createSupabaseAdmin } from '@/lib/supabase/server'

export interface ChatSession {
  id: string
  business_id: string
  session_token: string
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata?: any
}

export interface CreateSessionResult {
  session: ChatSession
  isNewSession: boolean
}

/**
 * Get or create a chat session
 */
export async function getOrCreateChatSession(
  businessId: string,
  sessionToken?: string
): Promise<CreateSessionResult> {
  const supabase = createSupabaseAdmin()
  
  if (sessionToken) {
    // Try to get existing session
    const { data: existingSession, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('business_id', businessId)
      .eq('session_token', sessionToken)
      .single()
    
    if (existingSession && !error) {
      return {
        session: existingSession,
        isNewSession: false
      }
    }
  }
  
  // Create new session
  const newSessionToken = sessionToken || generateSessionToken()
  const { data: newSession, error: createError } = await supabase
    .from('chat_sessions')
    .insert({
      business_id: businessId,
      session_token: newSessionToken
    })
    .select('*')
    .single()
  
  if (createError || !newSession) {
    throw new Error(`Failed to create chat session: ${createError?.message}`)
  }
  
  return {
    session: newSession,
    isNewSession: true
  }
}

/**
 * Get chat messages for a session
 */
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const supabase = createSupabaseAdmin()
  
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to get chat messages: ${error.message}`)
  }
  
  return messages || []
}

/**
 * Save a chat message
 */
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: any
): Promise<ChatMessage> {
  const supabase = createSupabaseAdmin()
  
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
      metadata
    })
    .select('*')
    .single()
  
  if (error || !message) {
    throw new Error(`Failed to save chat message: ${error?.message}`)
  }
  
  return message
}

/**
 * Generate a unique session token
 */
export function generateSessionToken(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `session_${timestamp}_${random}`
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}