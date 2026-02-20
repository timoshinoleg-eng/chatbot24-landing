'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, Users, GraduationCap, Stethoscope, Building2 } from 'lucide-react'

const cases = [
  {
    icon: GraduationCap,
    title: 'Онлайн-школа',
    metrics: [
      { value: '+25%', label: 'к заявкам', icon: TrendingUp },
      { value: '−35%', label: 'времени кураторов', icon: Clock },
    ],
    stack: ['Telegram', 'Bitrix24'],
    description: 'Автоматизация записи на курсы и ответов на частые вопросы',
  },
  {
    icon: Stethoscope,
    title: 'Клиника',
    metrics: [
      { value: '70%', label: 'записей через бота', icon: Users },
      { value: '−40%', label: 'пропущенных звонков', icon: TrendingUp },
    ],
    stack: ['Telegram', 'Google Calendar'],
    description: 'Онлайн-запись и напоминания о приемах',
  },
  {
    icon: Building2,
    title: 'B2B продажи',
    metrics: [
      { value: '+30%', label: 'конверсия', icon: TrendingUp },
      { value: '100%', label: 'горячие лиды менеджерам', icon: Users },
    ],
    stack: ['Telegram', 'Bitrix24', 'AmoCRM'],
    description: 'Квалификация лидов и передача в CRM',
  },
]

export default function CaseStudies() {
  return (
    <section id="cases" className="py-20 lg:py-28 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Результаты наших клиентов
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Реальные цифры из кейсов компаний, которые уже внедрили AI-ботов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => (
            <motion.div
              key={caseItem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-surface border border-white/10 rounded-2xl p-8 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <caseItem.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">{caseItem.title}</h3>
              </div>

              <p className="text-text-secondary text-sm mb-6">{caseItem.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {caseItem.metrics.map((metric) => (
                  <div key={metric.label} className="text-center p-4 bg-background rounded-xl border border-white/5">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <metric.icon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-400">{metric.value}</div>
                    <div className="text-xs text-text-muted mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-text-muted mb-2">Интеграции:</p>
                <div className="flex flex-wrap gap-2">
                  {caseItem.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-white/5 text-text-secondary text-xs font-medium rounded-full border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}