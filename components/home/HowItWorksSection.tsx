"use client";

import { Card } from "@/components/ui/Card";
import { ClipboardList, Pencil, TestTube, Rocket, ArrowRight } from "lucide-react";

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}

const steps: Step[] = [
  {
    number: "01",
    icon: <ClipboardList className="w-6 h-6" />,
    title: "Бриф",
    description: "Определяем задачи и цели автоматизации",
    details: [
      "Анализ текущих процессов",
      "Определение точек контакта",
      "Формирование ТЗ",
    ],
  },
  {
    number: "02",
    icon: <Pencil className="w-6 h-6" />,
    title: "Черновик",
    description: "Создаём структуру диалога и тексты",
    details: [
      "Разработка сценария",
      "Написание продающих текстов",
      "Согласование с вами",
    ],
  },
  {
    number: "03",
    icon: <TestTube className="w-6 h-6" />,
    title: "Тестовая версия",
    description: "Настраиваем и тестируем функционал",
    details: [
      "Программирование бота",
      "Настройка интеграций",
      "Тестирование всех сценариев",
    ],
  },
  {
    number: "04",
    icon: <Rocket className="w-6 h-6" />,
    title: "Запуск",
    description: "Запускаем бота и обучаем команду",
    details: [
      "Развёртывание на сервере",
      "Обучение персонала",
      "Техническая поддержка",
    ],
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-6">
            <Rocket className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm text-accent-cyan">Как мы работаем</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            От идеи до запуска — 4 простых шага
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Прозрачный процесс разработки с фиксированными сроками
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px]">
                  <div className="w-full h-full bg-gradient-to-r from-primary/50 to-transparent" />
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                </div>
              )}

              <Card className="h-full p-6 bg-surface/50 border-text-muted/10 hover:border-primary/30 hover:bg-surface transition-all duration-300 group">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-text-muted/20 group-hover:text-primary/30 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm mb-4">
                  {step.description}
                </p>

                {/* Details list */}
                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-text-muted"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-16 p-6 rounded-2xl bg-surface border border-text-muted/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                <span className="text-accent-green font-bold">3-5</span>
              </div>
              <div>
                <div className="text-text-primary font-semibold">дней</div>
                <div className="text-text-muted text-sm">Средний срок запуска</div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-text-muted/20" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">0₽</span>
              </div>
              <div>
                <div className="text-text-primary font-semibold">предоплата</div>
                <div className="text-text-muted text-sm">Оплата после запуска</div>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-text-muted/20" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                <span className="text-accent-cyan font-bold">∞</span>
              </div>
              <div>
                <div className="text-text-primary font-semibold">поддержка</div>
                <div className="text-text-muted text-sm">Первый месяц бесплатно</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
