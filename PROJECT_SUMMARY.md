# ChatBot24 Next.js 14 — Сводка проекта

## 🎯 Архитектура контента

```
Сайты-доноры (парсим новости)
        ↓
OpenRouter AI (рерайт + генерация заголовков)
        ↓
Unsplash API / AI-генерация (свои уникальные фото)
        ↓
Telegram канал @ml_digest_daily (ID: 3587382769)
        ↓
Vercel Cron (раз в час) → API Route
        ↓
Сайт chatbot24.su (перепост с оптимизацией)
        ↓
Админка (модерация перед публикацией)
```

---

## 📁 Структура проекта

```
chatbot24-nextjs/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth.js GitHub OAuth
│   │   ├── admin/posts/          # Admin posts API (CRUD)
│   │   ├── blog/posts/           # Public blog API
│   │   ├── cron/sync-telegram/   # Telegram sync cron job
│   │   └── submit/               # Form submission handler
│   ├── admin/                    # Admin pages
│   │   ├── login/                # Admin login
│   │   └── dashboard/            # Posts management
│   ├── blog/                     # Blog pages
│   │   ├── page.tsx              # Blog listing
│   │   └── [slug]/               # Single article
│   ├── globals.css               # Global styles + animations
│   ├── layout.tsx                # Root layout + SEO
│   ├── page.tsx                  # Home page
│   ├── providers.tsx             # Session provider
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts                 # robots.txt
├── components/                   # React components
│   ├── blog/                     # Blog components
│   │   ├── BlogCard.tsx
│   │   └── BlogGrid.tsx
│   ├── home/                     # Home page sections
│   │   ├── HeroSection.tsx
│   │   ├── ScenariosSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── IntegrationsSection.tsx
│   │   ├── FAQSection.tsx
│   │   └── CTASection.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── seo/                      # SEO components
│   │   └── SEOHead.tsx
│   └── ui/                       # UI components
│       ├── Button.tsx
│       └── Card.tsx
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── openrouter.ts             # OpenRouter AI client
│   ├── unsplash.ts               # Unsplash API client
│   ├── telegram-parser.ts        # Telegram parser
│   ├── utils.ts                  # Utility functions
│   └── auth.ts                   # Auth utilities
├── prisma/
│   └── schema.prisma             # Database schema
├── types/
│   └── index.ts                  # TypeScript types
├── middleware.ts                 # Next.js middleware
├── tailwind.config.ts            # Tailwind config (Tech Minimal theme)
├── next.config.js                # Next.js config
├── vercel.json                   # Vercel config + Cron jobs
└── package.json                  # Dependencies
```

---

## 🎨 Дизайн-система "Tech Minimal"

### Цветовая палитра (Dark Mode по умолчанию)

```typescript
colors: {
  background: '#0a0a0f',
  surface: '#12121a',
  surfaceGlass: 'rgba(18, 18, 26, 0.8)',
  primary: {
    DEFAULT: '#6366f1', // Indigo
    glow: '#818cf8',
  },
  accent: {
    cyan: '#06b6d4',
    purple: '#a855f7',
    pink: '#ec4899',
    green: '#22C55E',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    muted: '#64748b',
  }
}
```

### Градиенты
- **Hero**: `bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500`
- **CTA**: `bg-gradient-to-r from-cyan-500 to-purple-600`
- **Glass**: `backdrop-blur-xl bg-white/5 border border-white/10`

---

## 🗄️ Схема базы данных (Prisma)

### Модели

```prisma
model Post {
  id                String   @id @default(cuid())
  telegramMessageId BigInt   @unique
  originalChannel   String
  originalText      String   @db.Text
  rewrittenTitle    String
  rewrittenContent  String   @db.Text
  summary           String   @db.Text
  imageUrl          String?
  imageSource       ImageSource @default(UNSPLASH)
  tags              String[]
  slug              String   @unique
  status            PostStatus @default(PENDING)
  views             Int      @default(0)
  metaTitle         String?
  metaDescription   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  publishedAt       DateTime?
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          UserRole  @default(EDITOR)
  accounts      Account[]
  sessions      Session[]
}
```

---

## 🔌 API интеграции

### OpenRouter AI (lib/openrouter.ts)
- **Модель**: `mistralai/mistral-7b-instruct:free`
- **SEO ключевые слова**: внедрение чат-ботов, автоматизация бизнеса ИИ, нейросети для продаж, разработка ботов под ключ

### Unsplash (lib/unsplash.ts)
- Поиск изображений по ключевым словам
- Fallback на AI-генерацию при необходимости

### Telegram Parser (lib/telegram-parser.ts)
- Парсинг канала @ml_digest_daily
- Извлечение текста, даты, ID сообщений

---

## ⚙️ Environment Variables (.env.local)

```bash
# Database
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random-secret-min-32-chars"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Telegram
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHANNEL_ID="3587382769"
TELEGRAM_NOTIFICATION_CHAT_ID="..."

# OpenRouter
OPENROUTER_API_KEY="..."

# Unsplash
UNSPLASH_ACCESS_KEY="..."

# Cron
CRON_SECRET="random-secret"

# Admin
ADMIN_GITHUB_USERNAME="your-github-username"
```

---

## 🚀 Установка и запуск

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка переменных окружения
cp .env.local.example .env.local
# Отредактируйте .env.local

# 3. Генерация Prisma клиента
npx prisma generate

# 4. Применение миграций
npx prisma migrate dev

# 5. Запуск dev сервера
npm run dev

# 6. Откройте http://localhost:3000
```

---

## 📦 Деплой на Vercel

1. **Подключите репозиторий к Vercel**
2. **Добавьте переменные окружения** в Project Settings
3. **Настройте базу данных** (Vercel Postgres / Neon)
4. **Настройте GitHub OAuth App**
   - Authorization callback URL: `https://your-domain.com/api/auth/callback/github`
5. **Cron job** настроен автоматически (vercel.json)

---

## ✅ Функционал

### Для посетителей
- [x] Лендинг с 7 секциями
- [x] Блог с категориями и тегами
- [x] SEO-оптимизация (meta, Open Graph, JSON-LD)
- [x] Адаптивный дизайн (mobile-first)
- [x] Форма обратной связи
- [x] Sitemap и robots.txt

### Для администратора
- [x] Авторизация через GitHub
- [x] Панель управления постами
- [x] Модерация (Publish/Reject)
- [x] Превью постов
- [x] Статистика

### Автоматизация
- [x] Cron job (раз в час)
- [x] Парсинг Telegram канала
- [x] AI-рерайт контента
- [x] Автоматический поиск изображений
- [x] Генерация slug и meta-тегов

---

## 📝 Якорные слова (SEO)

Встроены в тексты:
- "внедрение чат-ботов"
- "автоматизация бизнеса ИИ"
- "нейросети для продаж"
- "разработка ботов под ключ"

---

## 🔒 Безопасность

- [x] Rate limiting на API routes
- [x] Валидация входных данных (Zod)
- [x] HTML sanitization для контента
- [x] Защита cron endpoint (CRON_SECRET)
- [x] Admin-only доступ к панели
- [x] CSRF защита через NextAuth

---

## 📊 Производительность

- [x] next/image для оптимизации изображений
- [x] Шрифты через next/font
- [x] ISR для статических страниц
- [x] Code splitting по роутам
- [x] Оптимизация бандла

---

## 🛠️ Технологический стек

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom + Lucide Icons
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js v5 (GitHub OAuth)
- **AI**: OpenRouter API (Mistral)
- **Images**: Unsplash API
- **Hosting**: Vercel
- **Cron**: Vercel Cron Jobs

---

## 📚 Документация

- `README.md` — Основная документация
- `DEPLOYMENT.md` — Руководство по деплою
- `ARCHITECTURE.md` — Техническая архитектура

---

**Готово к деплою! 🚀**
