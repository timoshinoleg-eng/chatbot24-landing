"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Сколько стоит разработка чат-бота?",
    answer:
      "Стоимость зависит от сложности проекта. Простой бот с базовыми функциями — от 15 000₽. Средний проект с интеграциями — 25 000-40 000₽. Сложные решения с AI и множеством интеграций — от 50 000₽. Точную стоимость озвучим после заполнения брифа.",
  },
  {
    question: "Какие сроки разработки?",
    answer:
      "Средний срок запуска — 3-5 рабочих дней. Это включает разработку сценария, написание текстов, программирование и тестирование. Сложные проекты могут занять до 2 недель.",
  },
  {
    question: "Нужна ли предоплата?",
    answer:
      "Нет, мы работаем без предоплаты. Вы оплачиваете проект только после запуска и проверки работы бота. Так вы можете быть уверены в результате.",
  },
  {
    question: "Как происходит обучение персонала?",
    answer:
      "После запуска мы проводим бесплатное обучение для вашей команды. Показываем, как работать с админ-панелью, как редактировать тексты и как передавать диалоги менеджерам. Также предоставляем видео-инструкции.",
  },
  {
    question: "Что если бот не справится с вопросом клиента?",
    answer:
      "Бот автоматически распознаёт сложные ситуации и передаёт диалог живому оператору. Вы сами определяете триггеры для эскалации — например, ключевые слова или негативный тон сообщения.",
  },
  {
    question: "Можно ли изменить тексты после запуска?",
    answer:
      "Да, конечно. Мы предоставляем доступ к админ-панели, где вы можете редактировать тексты, добавлять новые ветки диалога и менять настройки. Это просто и не требует программирования.",
  },
  {
    question: "Какие мессенджеры поддерживаются?",
    answer:
      "Мы разрабатываем ботов для Telegram, ВКонтакте, WhatsApp, Viber и веб-чатов для сайтов. Также возможны интеграции с другими платформами по запросу.",
  },
  {
    question: "Есть ли техническая поддержка?",
    answer:
      "Первый месяц поддержки включён в стоимость. Далее доступны пакеты поддержки от 3 000₽/месяц. В поддержку входит исправление ошибок, небольшие доработки и консультации.",
  },
  {
    question: "Как бот интегрируется с CRM?",
    answer:
      "Бот автоматически создаёт лиды и сделки в вашей CRM (Bitrix24, AmoCRM и другие). Все данные из диалога передаются в карточку клиента — контакты, запросы, предпочтения.",
  },
  {
    question: "Можно ли протестировать бота до покупки?",
    answer:
      "Да, мы создаём тестовую версию бота, где вы можете пройти по всем сценариям и оценить работу. После вашего одобрения запускаем боевую версию.",
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={`border transition-all duration-300 ${
        isOpen
          ? "bg-surface border-primary/30"
          : "bg-surface/50 border-text-muted/10 hover:border-text-muted/30"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="text-text-primary font-medium pr-4">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-6 pb-6 text-text-secondary leading-relaxed">
          {item.answer}
        </div>
      </div>
    </Card>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-pink/10 border border-accent-pink/20 mb-6">
            <HelpCircle className="w-4 h-4 text-accent-pink" />
            <span className="text-sm text-accent-pink">Вопросы и ответы</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-text-secondary text-lg">
            Ответы на популярные вопросы о разработке чат-ботов
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-surface border border-text-muted/10">
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Остались вопросы?
          </h3>
          <p className="text-text-secondary mb-6">
            Напишите нам — ответим на любые вопросы о чат-ботах
          </p>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors"
          >
            Связаться с нами
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
