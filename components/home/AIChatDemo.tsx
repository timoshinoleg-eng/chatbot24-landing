'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_REPLIES: Record<string, string[]> = {
  welcome: ['B2B', 'HoReCa', 'E-commerce', 'Другое'],
  niche: ['Интернет-магазин', 'Услуги', 'Образование', 'Производство', 'Другое'],
  budget: ['До 20 000₽', 'До 50 000₽', 'До 100 000₽', 'До 200 000₽', 'Обсудим'],
  problem: ['Много вопросов', 'Медленные ответы', 'Нужны лиды', 'Автоматизация'],
  yesno: ['Да', 'Нет', 'Расскажи подробнее'],
  contact: ['Заполнить бриф', 'Позвоните мне', 'Написать в Telegram'],
}

export default function AIChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! 👋 За 2 минуты подберём решение для вашего бизнеса. Какая у вас сфера?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentStep, setCurrentStep] = useState<keyof typeof QUICK_REPLIES>('welcome')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const getNextStep = (text: string): keyof typeof QUICK_REPLIES => {
    if (currentStep === 'welcome' || currentStep === 'niche') return 'problem'
    if (currentStep === 'problem') return 'budget'
    if (currentStep === 'budget') return 'contact'
    if (currentStep === 'yesno') return 'contact'
    return 'yesno'
  }

  const sendMessage = useCallback(async (content: string, skipApi = false) => {
    if (!content.trim() || isLoading) return

    // Создаём сообщение пользователя
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    }
    
    // Получаем актуальные сообщения ДО обновления state
    const currentMessages = [...messages, userMessage]
    
    // Обновляем UI
    setMessages(currentMessages)
    
    setInput('')
    setShowCustomInput(false)
    
    if (skipApi) {
      setCurrentStep('niche')
      if (content === 'Другое') setShowCustomInput(true)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()
      const botContent = data.message || 'Извините, произошла ошибка.'
      
      // Добавляем ответ бота
      setMessages((prev) => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botContent,
      }])
      
      // Обновляем шаг
      const nextStep = getNextStep(botContent)
      setCurrentStep(nextStep)
      
      // Проверяем CTA
      if (botContent.toLowerCase().includes('бриф') || 
          botContent.toLowerCase().includes('консультация')) {
        setIsCompleted(true)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже.',
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, currentStep])

  const handleQuickReply = useCallback((reply: string) => {
    if (reply === 'Другое') {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: 'Другое',
      }
      setMessages((prev) => [...prev, userMessage])
      setShowCustomInput(true)
      setCurrentStep('niche')
    } else if (reply === 'Заполнить бриф') {
      setIsCompleted(true)
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else if (reply === 'Позвоните мне' || reply === 'Написать в Telegram') {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: reply,
      }
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `Отлично! Оставьте ваш номер телефона — наш специалист свяжется в течение 15 минут.`,
      }
      setMessages((prev) => [...prev, userMessage, botMessage])
      setShowCustomInput(true)
      setCurrentStep('contact')
    } else {
      sendMessage(reply)
    }
  }, [sendMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) sendMessage(input)
  }

  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! 👋 За 2 минуты подберём решение для вашего бизнеса. Какая у вас сфера?',
    }])
    setCurrentStep('welcome')
    setIsCompleted(false)
    setShowCustomInput(false)
    setInput('')
  }

  const currentButtons = QUICK_REPLIES[currentStep] || QUICK_REPLIES.yesno

  return (
    <div className="w-full max-w-[400px] h-[550px] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
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
          <button onClick={handleReset} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] px-4 py-2.5 text-sm leading-relaxed ${
                message.role === 'assistant'
                  ? 'bg-slate-800 text-white rounded-2xl rounded-tl-none'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none'
              }`}>
                {message.content}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Reply Buttons */}
      {!isCompleted && !isLoading && (
        <div className="px-4 py-3 bg-slate-900 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {currentButtons.map((button) => (
              <button
                key={button}
                onClick={() => handleQuickReply(button)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium rounded-full border border-white/10 hover:border-indigo-500 transition-all"
              >
                {button}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-white/10 flex-shrink-0">
        {!isCompleted ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={showCustomInput ? "Напишите подробнее..." : "Или напишите своё сообщение..."}
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        ) : (
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-400">Готовы обсудить детали? 👍</p>
            <div className="flex gap-2">
              <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90">
                Заполнить бриф
              </button>
              <button onClick={handleReset} className="px-4 py-3 border border-white/10 text-slate-300 text-sm rounded-xl hover:border-indigo-500/50">
                Начать заново
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}