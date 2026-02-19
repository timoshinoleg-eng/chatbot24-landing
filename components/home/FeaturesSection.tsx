"use client";

import { Card } from "@/components/ui/Card";
import {
  MessageSquare,
  FileText,
  GitBranch,
  UserCheck,
  Database,
  Table,
  Webhook,
  Bell,
  Zap,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Сценарий диалога",
    description: "Продуманные цепочки сообщений, которые ведут клиента к цели",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Продающие тексты",
    description: "Убедительные сообщения, написанные профессиональными копирайтерами",
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: "Ветвления",
    description: "Интеллектуальная маршрутизация ответов на основе выбора пользователя",
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Передача на менеджера",
    description: "Автоматическая эскалация сложных вопросов живому оператору",
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Bitrix24",
    description: "Прямая интеграция с CRM для создания лидов и сделок",
  },
  {
    icon: <Table className="w-6 h-6" />,
    title: "Google Sheets",
    description: "Запись данных прямо в таблицы для простого анализа",
  },
  {
    icon: <Webhook className="w-6 h-6" />,
    title: "Webhook",
    description: "Гибкая интеграция с любыми внешними сервисами и API",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Напоминания",
    description: "Автоматические уведомления клиентам и менеджерам",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Возможности</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Всё для эффективных продаж
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Полный набор инструментов для автоматизации коммуникаций с клиентами
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group p-6 bg-surface/50 border-text-muted/10 hover:border-primary/30 hover:bg-surface transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <div className="text-primary">{feature.icon}</div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom highlight */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/5 via-accent-purple/5 to-primary/5 border border-primary/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Нужна интеграция, которой нет в списке?
              </h3>
              <p className="text-text-secondary">
                Разработаем кастомное решение под ваши требования
              </p>
            </div>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors whitespace-nowrap"
            >
              Обсудить интеграцию
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
