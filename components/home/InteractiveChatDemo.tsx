'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  type: 'bot' | 'user'
  text: string
}

interface ChatStep {
  id: string
  botMessage: string
  options: {
    text: string
    nextStepId: string | null
    action?: 'submit' | 'redirect'
  }[]
}

// Тестовый сценарий диалога
const chatScenario: Record<string, ChatStep> = {
  start: {
    id: 'start',
    botMessage: 'Привет! 👋 Я помогу подобрать решение для вашего бизнеса. Чем занимаетесь?',
    options: [
      { text: 'Продаю товары', nextStepId: 'ecommerce' },
      { text: 'Оказываю услуги', nextStepId: 'services' },
      { text: 'Учебный курс', nextStepId: 'education' },
    ],
  },
  ecommerce: {
    id: 'ecommerce',
    botMessage: 'Отлично! Какой у вас канал продаж?',
    options: [
      { text: 'Интернет-магазин', nextStepId: 'shop_size' },
      { text: 'Instagram / VK', nextStepId: 'social_result' },
      { text: 'Маркетплейсы', nextStepId: 'marketplace_result' },
    ],
  },
  services: {
    id: 'services',
    botMessage: 'Понял! Какая у вас сфера?',
    options: [
      { text: 'Красота / Здоровье', nextStepId: 'beauty_result' },
      { text: 'Консалтинг / B2B', nextStepId: 'b2b_result' },
      { text: 'Другое', nextStepId: 'other_result' },
    ],
  },
  education: {
    id: 'education',
    botMessage: 'Супер! Какой формат обучения?',
    options: [
      { text: 'Онлайн-курсы', nextStepId: 'online_course_result' },
      { text: 'Оффлайн занятия', nextStepId: 'offline_result' },
    ],
  },
  shop_size: {
    id: 'shop_size',
    botMessage: 'Сколько заказов в день обрабатываете?',
    options: [
      { text: 'До 10', nextStepId: 'small_shop_result' },
      { text: '10-50', nextStepId: 'medium_shop_result' },
      { text: 'Более 50', nextStepId: 'large_shop_result' },
    ],
  },
  // Результаты
  social_result: {
    id: 'social_result',
    botMessage: '💡 Для соцсетей идеально: автоответы в Direct, сбор заявок в Stories, интеграция с CRM. Стоимость: от 25 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  marketplace_result: {
    id: 'marketplace_result',
    botMessage: '💡 Для маркетплейсов: уведомления о заказах, ответы на отзывы, аналитика продаж. Стоимость: от 30 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  beauty_result: {
    id: 'beauty_result',
    botMessage: '💡 Для салонов и клиник: онлайн-запись, напоминания, переносы, сбор отзывов. Стоимость: от 20 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  b2b_result: {
    id: 'b2b_result',
    botMessage: '💡 Для B2B: квалификация лидов, презентация услуг, запись на консультацию. Стоимость: от 35 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  other_result: {
    id: 'other_result',
    botMessage: '💡 Универсальное решение: консультации, запись, FAQ, интеграция с вашими системами. Стоимость: от 25 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  online_course_result: {
    id: 'online_course_result',
    botMessage: '💡 Для онлайн-школ: воронка продаж, пробные уроки, оплата, доступ к материалам. Стоимость: от 30 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  offline_result: {
    id: 'offline_result',
    botMessage: '💡 Для офлайн-занятий: запись на занятия, рассылки, контроль посещаемости. Стоимость: от 20 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  small_shop_result: {
    id: 'small_shop_result',
    botMessage: '💡 Для небольшого магазина: каталог, корзина, оплата, уведомления. Быстрый запуск! Стоимость: от 20 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  medium_shop_result: {
    id: 'medium_shop_result',
    botMessage: '💡 Для среднего магазина: полноценный магазин в Telegram, интеграция с 1C/МойСклад, аналитика. Стоимость: от 40 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  large_shop_result: {
    id: 'large_shop_result',
    botMessage: '💡 Для крупного магазина: enterprise-решение с личным кабинетом, сложной логистикой, множеством интеграций. Стоимость: от 80 000 ₽',
    options: [
      { text: 'Хочу такой бот', nextStepId: 'contact', action: 'submit' },
      { text: 'Есть вопросы', nextStepId: 'contact' },
    ],
  },
  contact: {
    id: 'contact',
    botMessage: 'Отлично! Оставьте контакт — свяжемся в течение часа. 📞',
    options: [
      { text: 'Заполнить форму', nextStepId: null, action: 'redirect' },
    ],
  },
}

export default function InteractiveChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: chatScenario.start.botMessage,
    },
  ])
  const [currentStepId, setCurrentStepId] = useState<string>('start')
  const [isTyping, setIsTyping] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentStep = chatScenario[currentStepId]

  const handleOptionClick = useCallback(async (option: ChatStep['options'][0]) => {
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: option.text,
    }
    setMessages((prev) => [...prev, userMessage])

    // Если действие — редирект
    if (option.action === 'redirect') {
      setIsCompleted(true)
      // Плавная прокрутка к форме
      setTimeout(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
      return
    }

    // Если есть следующий шаг
    if (option.nextStepId && chatScenario[option.nextStepId]) {
      setIsTyping(true)
      setCurrentStepId(option.nextStepId)

      // Имитация набора текста
      setTimeout(() => {
        setIsTyping(false)
        const nextStep = chatScenario[option.nextStepId!]
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          text: nextStep.botMessage,
        }
        setMessages((prev) => [...prev, botMessage])
      }, 800)
    }
  }, [])

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        text: chatScenario.start.botMessage,
      },
    ])
    setCurrentStepId('start')
    setIsCompleted(false)
  }, [])

  return (
    <div className="w-full max-w-[400px] h-[550px] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center gap-3">
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
        {isCompleted && (
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] px-4 py-3 text-sm leading-relaxed ${
                  message.type === 'bot'
                    ? 'bg-surface border border-white/10 text-text-primary rounded-2xl rounded-tl-none'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none'
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-surface border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options / Input */}
      <div className="p-4 bg-surface border-t border-white/10">
        {!isCompleted && currentStep && !isTyping && (
          <div className="grid grid-cols-1 gap-2">
            {currentStep.options.map((option, index) => (
              <motion.button
                key={`${currentStep.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleOptionClick(option)}
                className="w-full px-4 py-3 text-left text-sm bg-surface border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-text-primary hover:text-indigo-300 rounded-xl transition-all"
              >
                {option.text}
              </motion.button>
            ))}
          </div>
        )}

        {isCompleted && (
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-3">Спасибо за интерес! 👍</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              Пройти ещё раз
            </button>
          </div>
        )}

        {isTyping && (
          <div className="text-center text-sm text-text-muted">
            Печатает...
          </div>
        )}
      </div>
    </div>
  )
}