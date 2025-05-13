/**
 * File: src/components/business/ai-agent.tsx
 * 
 * Enhanced AI chat component with modern UI and better UX
 */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  MessageCircle,
  Minimize2,
  Maximize2,
  RefreshCw,
  X,
  ChevronDown,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface Business {
  id: string
  name: string
  ai_enabled: boolean
}

interface AIAgentProps {
  business: Business
  className?: string
  showHeader?: boolean
  isFloating?: boolean
}

export function AIAgent({ business, className, showHeader = true, isFloating = false }: AIAgentProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(!isFloating)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Predefined quick questions
  const quickQuestions = [
    "What are your hours?",
    "What services do you offer?",
    "Where are you located?",
    "How can I contact you?"
  ]
  
  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  // Auto-focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isExpanded])
  
  // Load chat history on mount
  useEffect(() => {
    if (sessionToken && isExpanded) {
      loadChatHistory()
    }
  }, [sessionToken, isExpanded])
  
  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${business.id}?sessionToken=${sessionToken}`)
      if (response.ok) {
        const data = await response.json()
        if (data.messages) {
          setMessages(data.messages.map((msg: any) => ({
            id: msg.id || Math.random().toString(),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          })))
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    
    // Optimistic UI - add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)
    
    // Create assistant message placeholder for streaming
    const assistantMessageId = Math.random().toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    
    setMessages(prev => [...prev, assistantMessage])
    
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      const response = await fetch(`/api/chat/${business.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionToken: sessionToken
        }),
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      
      // Get session token from response headers
      const newSessionToken = response.headers.get('X-Session-Token')
      if (newSessionToken && newSessionToken !== 'new-session') {
        setSessionToken(newSessionToken)
      }
      
      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream')
      }
      
      let assistantContent = ''
      const decoder = new TextDecoder()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          
          // Handle multiple SSE messages in a single chunk
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const dataStr = line.slice(6).trim()
                if (!dataStr) continue
                
                const data = JSON.parse(dataStr)
                console.log('Parsed data:', data) // Debug log
                
                if (data.error) {
                  throw new Error(data.error)
                }
                
                if (data.content) {
                  assistantContent += data.content
                  
                  // Update the assistant message with new content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: assistantContent, isStreaming: true }
                      : msg
                  ))
                }
                
                if (data.done) {
                  // Mark streaming as complete
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, isStreaming: false }
                      : msg
                  ))
                  return // Exit the function when done
                }
              } catch (parseError) {
                console.error('Error parsing stream chunk:', parseError)
                console.error('Raw chunk:', line)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
      
      // If we reach here without getting data.done, mark as complete
      if (assistantContent.trim()) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: assistantContent, isStreaming: false }
            : msg
        ))
      } else {
        // If no content was received, try to fetch from the database
        console.log('No streaming content received, attempting to fetch from database')
        // Wait a bit for database write to complete
        setTimeout(async () => {
          try {
            const historyResponse = await fetch(`/api/chat/${business.id}?sessionToken=${sessionToken}`)
            if (historyResponse.ok) {
              const historyData = await historyResponse.json()
              if (historyData.messages && historyData.messages.length > 0) {
                const lastMessage = historyData.messages[historyData.messages.length - 1]
                if (lastMessage.role === 'assistant' && lastMessage.content) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: lastMessage.content, isStreaming: false }
                      : msg
                  ))
                }
              }
            }
          } catch (error) {
            console.error('Error fetching from database:', error)
          }
        }, 1000)
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
      console.error('Error sending message:', error)
      setError(error.message || 'Failed to send message')
      
      // Remove the assistant placeholder message on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
    } finally {
      setIsLoading(false)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }
  
  // Handle quick question click
  const handleQuickQuestion = (question: string) => {
    setInput(question)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }
  
  // Clear chat history
  const handleClearChat = () => {
    setMessages([])
    setSessionToken(null)
    setError(null)
  }
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }
  
  // Render message
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user'
    const showAvatar = index === 0 || messages[index - 1]?.role !== message.role
    
    return (
      <div
        key={message.id}
        className={cn(
          'flex gap-3 mb-4 group',
          isUser ? 'justify-end' : 'justify-start'
        )}
      >
        {!isUser && showAvatar && (
          <Avatar className="w-8 h-8 mt-0.5">
            <AvatarFallback className="bg-primary/10">
              <Bot className="w-4 h-4 text-primary" />
            </AvatarFallback>
          </Avatar>
        )}
        {!isUser && !showAvatar && <div className="w-8" />}
        
        <div className={cn(
          'flex flex-col max-w-[85%]',
          isUser ? 'items-end' : 'items-start'
        )}>
          <div
            className={cn(
              'rounded-2xl px-4 py-3 break-words',
              isUser 
                ? 'bg-primary text-primary-foreground rounded-br-md' 
                : 'bg-muted/70 text-foreground rounded-bl-md',
              message.isStreaming && 'animate-pulse'
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.isStreaming && (
              <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>AI is typing...</span>
              </div>
            )}
          </div>
          
          <div className={cn(
            'text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'text-right' : 'text-left'
          )}>
            {formatTime(message.timestamp)}
          </div>
        </div>
        
        {isUser && showAvatar && (
          <Avatar className="w-8 h-8 mt-0.5">
            <AvatarFallback className="bg-blue-500 text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        )}
        {isUser && !showAvatar && <div className="w-8" />}
      </div>
    )
  }
  
  // Welcome message component
  const WelcomeMessage = () => (
    <div className="p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
        <Bot className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">Hi! I'm {business.name}'s AI Assistant</h3>
      <p className="text-sm text-muted-foreground mb-4">
        I'm here to help answer your questions about our business. Feel free to ask me anything!
      </p>
      
      {/* Quick Questions */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Quick Questions</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {quickQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuestion(question)}
              className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
  
  if (!business.ai_enabled) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Assistant Coming Soon</h3>
          <p className="text-muted-foreground">
            {business.name} will have an AI assistant available soon to help answer your questions.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Floating minimized state
  if (isFloating && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 group"
          size="lg"
        >
          <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
          {messages.length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {messages.length}
            </div>
          )}
        </Button>
      </div>
    )
  }
  
  return (
    <Card className={cn(
      'flex flex-col',
      isFloating ? 'fixed bottom-4 right-4 w-80 max-w-[90vw] h-[500px] max-h-[80vh] shadow-2xl z-40' : '',
      className
    )}>
      {showHeader && (
        <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-5 h-5 text-primary" />
                <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <span className="text-base">AI Assistant</span>
            </CardTitle>
            <div className="flex items-center gap-1">
              {error && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  title="Retry"
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              {isFloating && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 p-0"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm border-b flex items-center gap-2">
            <X className="w-4 h-4" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
          <div className="p-4">
            {messages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t bg-background/95 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="pr-12 rounded-full border-2 focus:border-primary transition-colors"
                  autoComplete="off"
                  maxLength={500}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {input.length}/500
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                size="sm"
                className="rounded-full w-10 h-10 p-0 relative overflow-hidden group"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </Button>
            </div>
            
            {/* Typing indicator */}
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {isLoading ? 'Sending...' : messages.length > 0 ? `${messages.length} messages` : 'Start a conversation'}
              </span>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-xs h-6 px-2"
                >
                  Clear chat
                </Button>
              )}
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}