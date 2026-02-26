"""use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./HeroWidget.module.css";

interface HeroWidgetProps {
  variant?: "A" | "B" | "C";
  ymCounterId?: string;
}

type Step = 1 | 2 | 3;
type Goal = "sales" | "automation" | "reduce-load" | "just-looking";

export default function HeroWidget({
  variant = "A",
  ymCounterId,
}: HeroWidgetProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showInactivityPrompt, setShowInactivityPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Track inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      setShowInactivityPrompt(false);
      timeout = setTimeout(() => {
        setShowInactivityPrompt(true);
      }, 15000); // 15 seconds
    };

    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  // Track goal events
  const trackEvent = useCallback(
    (eventName: string, params?: Record<string, any>) => {
      // GA4
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", eventName, params);
      }

      // Yandex Metrica
      if (
        typeof window !== "undefined" &&
        ymCounterId &&
        (window as any).ym
      ) {
        (window as any).ym(
          parseInt(ymCounterId),
          "reachGoal",
          eventName,
          params
        );
      }

      console.log("[HeroWidget] Event:", eventName, params);
    },
    [ymCounterId]
  );

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setStep(2);
    trackEvent("hero_interaction_start", { goal, variant });
  };

  const handleTelegramClick = () => {
    const utmParams = new URLSearchParams({
      utm_source: "hero_site",
      utm_medium: "website",
      utm_campaign: "main",
      variant,
    });

    const botUrl = `https://t.me/ChatBot24su_bot?start=${utmParams.toString()}`;

    trackEvent("hero_to_telegram_click", {
      goal: selectedGoal,
      variant,
    });

    window.open(botUrl, "_blank");
  };

  const handleCasesClick = () => {
    trackEvent("hero_to_cases", { goal: selectedGoal, variant });
    window.open("https://www.chatbot24.su/cases", "_blank");
  };

  const getStep2Content = () => {
    const content: Record<Goal, { title: string; text: string }> = {
      sales: {
        title: "Отлично.",
        text: `Бот может:
• Квалифицировать лида
• Собирать контакты
• Передавать в CRM

Средний рост конверсии — 22–37%.

Хотите увидеть расчёт под ваш бизнес?`,
      },
      automation: {
        title: "Правильный выбор.",
        text: `Автоматизация экономит:
• 40–70 часов менеджера в месяц
• До 60% на ФОТ

Хотите рассчитать экономию?`,
      },
      "reduce-load": {
        title: "Понимаю.",
        text: `Бот обрабатывает до 80%
рутинных вопросов 24/7.

Освободите команду для сложных задач?`,
      },
      "just-looking": {
        title: "Без проблем.",
        text: `Покажу реальный кейс:
В нише услуг бот увеличил
заявки на 31% за 2 месяца.

Интересно узнать детали?`,
      },
    };

    const c = content[selectedGoal!];
    return (
      <>
        <div className={styles.botMessage}>
          <p className={styles.messageTitle}>{c.title}</p>
          <p className={styles.messageText}>{c.text}</p>
        </div>
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleTelegramClick}
          >
            💬 Перейти в Telegram
          </button>
          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={handleCasesClick}
          >
            📊 Смотреть кейсы
          </button>
        </div>
      </>
    );
  };

  const getStep1Title = () => {
    const titles: Record<string, string> = {
      A: "Какая задача сейчас приоритетна?",
      B: "Сколько заявок обрабатываете вручную?",
      C: "Хотите рассчитать экономию от бота?",
    };
    return titles[variant];
  };

  return (
    <div className={styles.widget}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.botInfo}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>24</span>
          </div>
          <div className={styles.botDetails}>
            <span className={styles.botName}>ChatBot24 Assistant</span>
            <span className={styles.onlineStatus}>
              <span className={styles.onlineDot}></span>
              Онлайн
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {step === 1 && (
          <>
            <div className={styles.botMessage}>
              <p className={styles.messageText}>
                Здравствуйте.
                Покажу, как бот увеличивает конверсию за 30 секунд.
              </p>
            </div>
            <div className={styles.botMessage}>
              <p className={styles.messageText}>{getStep1Title()}</p>
            </div>
            <div className={styles.buttons}>
              <button
                className={styles.goalButton}
                onClick={() => handleGoalSelect("sales")}
              >
                📈 Больше продаж
              </button>
              <button
                className={styles.goalButton}
                onClick={() => handleGoalSelect("automation")}
              >
                ⚙️ Автоматизация
              </button>
              <button
                className={styles.goalButton}
                onClick={() => handleGoalSelect("reduce-load")}
              >
                📉 Снижение нагрузки
              </button>
              <button
                className={styles.goalButton}
                onClick={() => handleGoalSelect("just-looking")}
              >
                👀 Просто смотрю
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.botMessage}>
              <p className={styles.messageText}>
                {selectedGoal === "sales" && "📈 Больше продаж"}
                {selectedGoal === "automation" && "⚙️ Автоматизация"}
                {selectedGoal === "reduce-load" && "📉 Снижение нагрузки"}
                {selectedGoal === "just-looking" && "👀 Просто смотрю"}
              </p>
            </div>
            {getStep2Content()}
          </>
        )}

        {step === 3 && (
          <div className={styles.botMessage}>
            <p className={styles.messageText}>
              Отлично! Переходите в Telegram, чтобы продолжить расчёт.
            </p>
            <div className={styles.buttons}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={handleTelegramClick}
              >
                💬 Перейти в Telegram
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inactivity Prompt */}
      {showInactivityPrompt && step < 3 && (
        <div className={styles.inactivityPrompt}>
          <p>Показать, как бот может обрабатывать заявки 24/7?</p>
          <button
            className={styles.showButton}
            onClick={() => {
              setShowInactivityPrompt(false);
              trackEvent("hero_inactivity_click", { variant });
            }}
          >
            Показать
          </button>
        </div>
      )}
    </div>
  );
}
