"use client";

import { Card } from "@/components/ui/Card";
import { Check, Shield, Lock, Server, Plug } from "lucide-react";

interface Integration {
  name: string;
  description: string;
  icon: string;
  color: string;
}

const integrations: Integration[] = [
  {
    name: "Bitrix24",
    description: "CRM, лиды, сделки, контакты",
    icon: "B24",
    color: "#3AC1D6",
  },
  {
    name: "Google Sheets",
    description: "Запись данных в таблицы",
    icon: "GS",
    color: "#34A853",
  },
  {
    name: "Webhook",
    description: "Интеграция с любыми сервисами",
    icon: "WH",
    color: "#6366f1",
  },
];

const securityFeatures = [
  "SSL-шифрование всех данных",
  "Хранение в российских дата-центрах",
  "Соответствие 152-ФЗ",
  "Регулярные бэкапы",
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 mb-6">
            <Plug className="w-4 h-4 text-accent-purple" />
            <span className="text-sm text-accent-purple">Интеграции</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Работает с вашими системами
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Готовые интеграции с популярными сервисами и возможность подключения любых других
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {integrations.map((integration) => (
            <Card
              key={integration.name}
              className="group p-6 bg-surface/50 border-text-muted/10 hover:border-primary/30 hover:bg-surface transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Icon placeholder */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: `${integration.color}20`, color: integration.color }}
                >
                  {integration.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-text-muted">{integration.description}</p>
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-2">
                {integration.name === "Bitrix24" && (
                  <>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      Создание лидов
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      Обновление сделок
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      Запись в контакты
                    </li>
                  </>
                )}
                {integration.name === "Google Sheets" && (
                  <>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      Автозапись данных
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      Форматирование
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      Фильтрация
                    </li>
                  </>
                )}
                {integration.name === "Webhook" && (
                  <>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      POST/GET запросы
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      Кастомные заголовки
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent-green" />
                      JSON формат
                    </li>
                  </>
                )}
              </ul>
            </Card>
          ))}
        </div>

        {/* Security Section */}
        <Card className="p-8 bg-gradient-to-br from-surface/80 to-surface border-text-muted/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-accent-green" />
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-text-muted" />
                  <Server className="w-4 h-4 text-text-muted" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Безопасность на первом месте
              </h3>
              <p className="text-text-secondary mb-6">
                Мы серьёзно относимся к защите данных ваших клиентов. 
                Все интеграции работают через зашифрованные каналы связи.
              </p>
              <a
                href="#cta"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Узнать подробнее
                <span>→</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#0a0a0f] border border-text-muted/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-accent-green" />
                  </div>
                  <span className="text-sm text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Custom Integration CTA */}
        <div className="mt-12 text-center">
          <p className="text-text-muted mb-4">
            Нужна интеграция с другой системой?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["AmoCRM", "Telegram", "WhatsApp", "Email", "SMS"].map((service) => (
              <span
                key={service}
                className="px-4 py-2 rounded-full bg-surface border border-text-muted/20 text-text-secondary text-sm hover:border-primary/30 hover:text-text-primary transition-colors cursor-default"
              >
                {service}
              </span>
            ))}
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm">
              + другие
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
