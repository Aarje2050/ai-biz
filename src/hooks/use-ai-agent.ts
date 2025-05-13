/**
 * File: src/hooks/use-ai-agent.ts
 * 
 * Custom hook for AI Agent state management and optimization
 */
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface AIAgentState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  sessionToken: string | null
}

export interface UseAIAgentOptions {
  businessId: string
  maxMessages?: number
  enablePersistence?: boolean
}

export function useAIAgent(options: UseAIAgentOptions) {
  const { businessId, maxMessages = 50, enablePersistence = true } = options
  
  const [state, setState] = useState<AIAgentState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionToken: null
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const persistenceKey = `ai-chat-${businessId}`
  
  // Load persisted state on mount
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        const persisted = localStorage.getItem(persistenceKey)
        if (persisted) {
          const parsed = JSON.parse(persisted)
          setState(prev => ({
            ...prev,
            messages: parsed.messages || [],
            sessionToken: parsed.sessionToken
          }))
        }
      } catch (error) {
        console.error('Error loading persisted chat:', error)
      }
    }
  }, [businessId, enablePersistence, persistenceKey])
  
  // Persist state when it changes
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        localStorage.setItem(persistenceKey, JSON.stringify({
          messages: state.messages,
          sessionToken: state.sessionToken
        }))
      } catch (error) {
        console.error('Error persisting chat:', error)
      }
    }
  }, [state.messages, state.sessionToken, enablePersistence, persistenceKey])
  
  const addMessage = useCallback((message: Message | Omit<Message, 'id' | 'timestamp'>) => {
    const fullMessage: Message = {
      id: 'id' in message ? message.id : Math.random().toString(36),
      timestamp: 'timestamp' in message ? message.timestamp : new Date(),
      ...message
    }
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages.slice(-maxMessages + 1), fullMessage]
    }))
  }, [maxMessages])
  
  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    }))
  }, [])
  
  const removeMessage = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== messageId)
    }))
  }, [])
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Add user message optimistically
    const userMessage: Message = {
      id: Math.random().toString(36),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }
    
    addMessage(userMessage)
    
    // Set loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    // Create assistant message placeholder
    const assistantMessageId = Math.random().toString(36)
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    
    addMessage(assistantMessage)
    
    try {
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      const response = await fetch(`/api/chat/${businessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          sessionToken: state.sessionToken
        }),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      
      // Get session token from response
      const newSessionToken = response.headers.get('X-Session-Token')
      if (newSessionToken && newSessionToken !== 'new-session') {
        setState(prev => ({ ...prev, sessionToken: newSessionToken }))
      }
      
      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')
      
      let assistantContent = ''
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = new TextDecoder().decode(value)
          
          if (chunk.startsWith('data: ')) {
            try {
              const data = JSON.parse(chunk.slice(6))
              
              if (data.error) {
                throw new Error(data.error)
              }
              
              if (data.content) {
                assistantContent += data.content
                updateMessage(assistantMessageId, { 
                  content: assistantContent,
                  isStreaming: true 
                })
              }
              
              if (data.done) {
                updateMessage(assistantMessageId, { isStreaming: false })
                break
              }
            } catch (parseError) {
              console.error('Error parsing stream chunk:', parseError)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }
      
      console.error('Error sending message:', error)
      setState(prev => ({ ...prev, error: error.message || 'Failed to send message' }))
      removeMessage(assistantMessageId)
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [businessId, state.sessionToken, state.isLoading, addMessage, updateMessage, removeMessage])
  
  const clearChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      sessionToken: null
    })
    
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem(persistenceKey)
    }
  }, [enablePersistence, persistenceKey])
  
  const retryLastMessage = useCallback(() => {
    if (state.messages.length === 0) return
    
    // Find the last user message
    const lastUserMessage = [...state.messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      // Remove any assistant messages after the last user message
      const userMessageIndex = state.messages.findIndex(msg => msg.id === lastUserMessage.id)
      setState(prev => ({
        ...prev,
        messages: prev.messages.slice(0, userMessageIndex + 1),
        error: null
      }))
      
      // Resend the message
      sendMessage(lastUserMessage.content)
    }
  }, [state.messages, sendMessage])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  return {
    ...state,
    sendMessage,
    clearChat,
    retryLastMessage,
    addMessage,
    updateMessage,
    removeMessage
  }
}