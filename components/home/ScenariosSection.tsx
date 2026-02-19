"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Calendar, Briefcase, Truck, MessageCircle, User, Bot } from "lucide-react";

interface Scenario {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  messages: {
    sender: "user" | "bot";
    text: string;
  }[];
}

const scenarios: Scenario[] = [
  {
    id: "services",
    icon: <Calendar className="w-6 h-6" />,
    title: "Услуги",
    description: "Запись на приём, консультации, автонапоминания",
    messages: [
      { sender: "user", text: "Хочу записаться на стрижку" },
      { sender: "bot", text: "Отлично! Выберите удобную дату:" },
      { sender: "bot", text: "📅 Завтра 14:00\n📅 Завтра 16:00\n📅 Послезавтра 10:00" },
      { sender: "user", text: "Завтра 14:00" },
      { sender: "bot", text: "✅ Запись подтверждена! Ждём вас завтра в 14:00" },
    ],
  },
  {
    id: "b2b",
    icon: <Briefcase className="w-6 h-6" />,
    title: "B2B",
    description: "Квалификация лидов, сбор требований",
    messages: [
      { sender: "user", text: "Интересует автоматизация продаж" },
      { sender: "bot", text: "Отлично! Какой у вас бизнес?" },
      { sender: "user", text: "Интернет-магазин одежды" },
      { sender: "bot", text: "Сколько заказов в день обрабатываете?" },
      { sender: "user", text: "Около 50" },
      { sender: "bot", text: "Передаю менеджеру. Он свяжется в течение 15 минут!" },
    ],
  },
  {
    id: "delivery",
    icon: <Truck className="w-6 h-6" />,
    title: "Доставка",
    description: "Меню, оформление заказа, отслеживание",
    messages: [
      { sender: "user", text: "Хочу заказать пиццу" },
      { sender: "bot", text: "🍕 Наше меню:\n\n1. Маргарита — 450₽\n2. Пепперони — 550₽\n3. Четыре сыра — 600₽" },
      { sender: "user", text: "Пепперони" },
      { sender: "bot", text: "Отличный выбор! Адрес доставки?" },
      { sender: "user", text: "ул. Ленина 10" },
      { sender: "bot", text: "✅ Заказ принят! Доставим за 40 минут" },
    ],
  },
];

function ChatSimulation({ messages }: { messages: Scenario["messages"] }) {
  return (
    <div className="space-y-3">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-2 ${
            msg.sender === "user" ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.sender === "user"
                ? "bg-accent-green/20"
                : "bg-primary/20"
            }`}
          >
            {msg.sender === "user" ? (
              <User className="w-3 h-3 text-accent-green" />
            ) : (
              <Bot className="w-3 h-3 text-primary" />
            )}
          </div>
          <div
            className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
              msg.sender === "user"
                ? "bg-accent-green/10 text-text-primary rounded-tr-sm"
                : "bg-surface border border-text-muted/10 text-text-secondary rounded-tl-sm"
            }`}
          >
            {msg.text.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < msg.text.split("\n").length - 1 && <br />}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScenariosSection() {
  const [activeScenario, setActiveScenario] = useState<string>("services");

  return (
    <section id="scenarios" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 mb-6">
            <MessageCircle className="w-4 h-4 text-accent-green" />
            <span className="text-sm text-accent-green">Сценарии использования</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Подходит для любого бизнеса
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Выберите готовый сценарий или создадим уникальный под ваши задачи
          </p>
        </div>

        {/* Scenario Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={`p-6 cursor-pointer transition-all duration-300 border ${
                activeScenario === scenario.id
                  ? "bg-surface border-accent-green/50 shadow-lg shadow-accent-green/10"
                  : "bg-surface/50 border-text-muted/10 hover:border-text-muted/30"
              }`}
              onClick={() => setActiveScenario(scenario.id)}
            >
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    activeScenario === scenario.id
                      ? "bg-accent-green/20 text-accent-green"
                      : "bg-text-muted/10 text-text-muted"
                  }`}
                >
                  {scenario.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-text-muted">{scenario.description}</p>
                </div>
              </div>

              {/* Chat Simulation */}
              <div className="bg-[#0a0a0f] rounded-xl p-4 border border-text-muted/10">
                <ChatSimulation messages={scenario.messages} />
              </div>

              {/* Active indicator */}
              {activeScenario === scenario.id && (
                <div className="mt-4 flex items-center gap-2 text-accent-green text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                  <span>Активный сценарий</span>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-text-muted mb-4">
            Не нашли подходящий сценарий? Расскажем, как бот поможет именно вам
          </p>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 text-accent-green hover:text-accent-green/80 font-medium transition-colors"
          >
            Обсудить проект
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
