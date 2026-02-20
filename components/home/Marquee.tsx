'use client'

import { useState } from 'react'

const testimonials = [
  {
    name: 'Анна К.',
    role: 'Основатель онлайн-школы',
    content: 'Бот обрабатывает 80% вопросов студентов. Кураторы теперь занимаются только сложными случаями.',
    avatar: 'АК',
  },
  {
    name: 'Михаил С.',
    role: 'Директор клиники',
    content: 'Запись через бота выросла на 40%. Пропущенных звонков практически не осталось.',
    avatar: 'МС',
  },
  {
    name: 'Елена В.',
    role: 'Руководитель отдела продаж',
    content: 'Квалификация лидов автоматическая. Менеджеры получают только горячие заявки.',
    avatar: 'ЕВ',
  },
  {
    name: 'Дмитрий П.',
    role: 'Владелец магазина',
    content: 'Интеграция с 1С работает идеально. Заказы попадают в систему мгновенно.',
    avatar: 'ДП',
  },
  {
    name: 'Ольга М.',
    role: 'CEO консалтинговой фирмы',
    content: 'Бот собирает данные клиентов до созвона. Экономит 30 минут на каждой встрече.',
    avatar: 'ОМ',
  },
  {
    name: 'Игорь Л.',
    role: 'Организатор мероприятий',
    content: 'Автоматическая регистрация и рассылки. 500+ участников без ручной работы.',
    avatar: 'ИЛ',
  },
  {
    name: 'Наталья Р.',
    role: 'Управляющий салоном',
    content: 'Напоминания о записи снизили ноу-шоу на 60%. Клиенты довольны удобством.',
    avatar: 'НР',
  },
]

export default function Marquee() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Что говорят клиенты
          </h2>
          <p className="text-text-secondary">
            Реальные отзывы о внедрении AI-ботов
          </p>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          className={`flex gap-6 ${isPaused ? '' : 'animate-marquee'}`}
          style={{ width: 'max-content' }}
        >
          {/* Double the items for seamless loop */}
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className="w-[350px] flex-shrink-0 bg-surface border border-white/10 rounded-xl p-6 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-indigo-400 font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                  <p className="text-text-muted text-xs">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}