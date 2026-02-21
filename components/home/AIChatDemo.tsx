'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { readStreamableValue } from 'ai/rsc'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AIChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! 👋 За 2 минуты покажу, как не терять лиды и разгрузить отдел продаж без новых наймов. Готов?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, streamingContent, isLoading])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    // Отменяем предыдущий запрос если есть
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      
      // Проверяем, это streaming или JSON
      if (contentType?.includes('text/plain') || contentType?.includes('text/event-stream')) {
        // Streaming response
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        if (!reader) {
          throw new Error('No reader available')
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Это текстовая часть
              const text = line.slice(2).replace(/^"|"$/g, '')
              fullContent += text
              setStreamingContent(fullContent)
            }
          }
        }

        // Добавляем финальное сообщение
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: fullContent || 'Извините, не удалось получить ответ.',
        }
        setMessages((prev) => [...prev, botMessage])
        setStreamingContent('')

        // Проверяем CTA
        checkCTA(content, fullContent)

      } else {
        // JSON response (fallback)
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        const botContent = data.message || data.content || 'Извините, произошла ошибка.'
        
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: botContent,
        }
        setMessages((prev) => [...prev, botMessage])

        checkCTA(content, botContent)
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Пользователь отменил
      }
      
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка соединения. Попробуйте позже или свяжитесь с нами напрямую.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setStreamingContent('')
      abortControllerRef.current = null
    }
  }, [messages, isLoading])

  const checkCTA = (userContent: string, botContent: string) => {
    const lowerUser = userContent.toLowerCase()
    const lowerBot = botContent.toLowerCase()
    
    if (lowerUser.includes('бриф') || 
        lowerUser.includes('консультация') ||
        lowerUser.includes('демо') ||
        lowerBot.includes('бриф') ||
        lowerBot.includes('заполнить') ||
        lowerBot.includes('свяжемся')) {
      setIsCompleted(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Привет! 👋 За 2 минуты покажу, как не терять лиды и разгрузить отдел продаж без новых наймов. Готов?',
      },
    ])
    setIsCompleted(false)
    setStreamingContent('')
    setIsLoading(false)
  }

  const handleCTA = () => {
    setIsCompleted(true)
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    }, 500)
  }

  return (
    <div className="w-full max-w-[400px] h-[550px] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm">ChatBot24 AI</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white/80 text-xs">Online</span>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleReset}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            title="Начать заново"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background min-h-0"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'assistant'
                    ? 'bg-surface border border-white/10 text-text-primary rounded-2xl rounded-tl-none'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}

          {/* Streaming message */}
          {isLoading && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[90%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-surface border border-white/10 text-text-primary rounded-2xl rounded-tl-none">
                {streamingContent}
                <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Loading indicator (только когда нет streaming) */}
          {isLoading && !streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-surface border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 bg-surface border-t border-white/10 flex-shrink-0">
        {!isCompleted ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишите сообщение..."
              disabled={isLoading}
              className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-text-secondary">Готовы обсудить детали? 👍</p>
            <div className="flex gap-2">
              <button
                onClick={handleCTA}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Заполнить бриф
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 border border-white/10 text-text-secondary text-sm rounded-xl hover:border-indigo-500/50 transition-colors"
              >
                Начать заново
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}