# ChatBot24 Studio

Telegram-бот + Website интеграция для автоматизации бизнеса.

## Структура проекта

```
chatbot24-studio/
├── bot/                          # Telegram бот (aiogram)
│   ├── main.py                  # Точка входа
│   ├── handlers.py              # Обработчики команд
│   ├── keyboards.py             # Клавиатуры
│   ├── config.py                # Конфигурация
│   ├── requirements.txt         # Зависимости
│   └── .env.example             # Пример переменных окружения
│
├── website/                      # Next.js сайт
│   ├── components/
│   │   └── HeroWidget.tsx       # Интерактивный виджет
│   ├── pages/
│   │   └── index.tsx            # Главная страница
│   ├── styles/
│   │   └── Home.module.css
│   ├── package.json
│   ├── next.config.js
│   └── tsconfig.json
│
├── api/                          # Vercel Serverless
│   └── webhook.py               # Supabase интеграция
│
├── supabase_schema.sql           # SQL для создания таблицы leads
├── vercel.json                   # Конфигурация деплоя
└── README.md                     # Документация
```

## Быстрый старт

### 1. Настройка Supabase

1. Создай проект в [Supabase](https://supabase.com)
2. Открой SQL Editor и выполни скрипт `supabase_schema.sql`
3. Скопируй URL и ключ из Project Settings → API

### 2. Настройка бота

```bash
cd bot
cp .env.example .env
# Отредактируй .env
pip install -r requirements.txt
python main.py
```

### 3. Настройка сайта

```bash
cd website
npm install
npm run dev
```

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather |
| `TELEGRAM_ADMIN_ID` | ID администратора для уведомлений |
| `SUPABASE_URL` | URL Supabase проекта |
| `SUPABASE_KEY` | Service Role Key из Supabase |
| `NEXT_PUBLIC_YM_COUNTER_ID` | ID Яндекс Метрики |
| `NEXT_PUBLIC_GA4_ID` | ID GA4 |

## Структура таблицы leads (Supabase)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | bigint | Автоинкремент |
| `user_id` | bigint | Telegram ID |
| `lead_task` | varchar | Задача (sales, support, booking, crm, other) |
| `lead_scale` | varchar | Масштаб (100, 500, 500plus) |
| `lead_timeline` | varchar | Срок (30, 90, research) |
| `lead_score` | integer | Скоринг 0-100 |
| `source` | varchar | Источник (telegram_bot) |
| `utm_source` | varchar | UTM метка |
| `utm_medium` | varchar | UTM метка |
| `tags` | varchar | Lead_Hot, Lead_Warm, Lead_Cold |
| `status` | varchar | new, contacted, converted |
| `created_at` | timestamptz | Время создания |

**Важно:** Таблица НЕ содержит полей `name` и `phone`!

## Функционал бота

### Основные команды
- `/start` — Главное меню
- `📊 Рассчитать проект` — Квалификация лида (4 шага)
- `🎮 Демо-режим` — Интерактивное демо (3 ниши)
- `💼 Кейсы` — Портфолио
- `❓ Поддержка` — Связь с менеджером

### Скоринг лидов
- **Hot (80-100)**: Срочный запуск, менеджер уведомляется немедленно
- **Warm (50-79)**: Стандартная воронка
- **Cold (0-49)**: Отложенный прогрев

### Уведомления менеджеру

При получении Hot Lead менеджер получает сообщение:
```
🔥 Hot Lead!

👤 Telegram ID: 123456789
📱 Телефон: +7 999 000-00-00
📋 Задача: Продажи / Воронки
📊 Объём: 100–500 заявок/мес
⏰ Срок: До 30 дней
⭐ Оценка: 95/100
🏷 Тег: Lead_Hot

🔗 Источник: telegram_bot
📍 UTM: N/A
```

## Hero-виджет

- 3 шага с динамическими ответами
- A/B тесты (варианты A/B/C)
- Триггер бездействия 15 сек
- UTM-метки при переходе
- Интеграция Яндекс Метрика + GA4

## Деплой на Vercel

### 1. Настройка секретов

В панели Vercel добавьте переменные окружения:

```
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_ADMIN_ID=your_id
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
NEXT_PUBLIC_YM_COUNTER_ID=your_counter
```

### 2. Настройка проекта

- **Framework Preset**: Next.js (для website)
- **Root Directory**: `./` (корень)
- **Build Command**: `cd website && npm run build`
- **Output Directory**: `website/dist`

### 3. Деплой

```bash
vercel --prod
```

## Аналитика

### События
- `bot_start` — Запуск бота
- `calc_started` — Начало расчета
- `contact_received` — Получен контакт
- `demo_completed` — Завершено демо
- `hero_interaction_start` — Начат виджет
- `hero_to_telegram_click` — Переход в Telegram

### Дашборд
Ключевые метрики:
- Конверсия в контакт: >40%
- Конверсия в бриф: >60%
- Конверсия демо: >70%
- Hot Lead %: >20%

## Лицензия

MIT © 2026 ChatBot24 Studio
