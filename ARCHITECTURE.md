# Архитектура системы ChatBot24

Техническая документация архитектуры проекта, описание компонентов и потоков данных.

## 📑 Содержание

1. [Общая архитектура](#общая-архитектура)
2. [Поток контента](#поток-контента)
3. [Схема базы данных](#схема-базы-данных)
4. [API Routes](#api-routes)
5. [Аутентификация](#аутентификация)
6. [Cron процесс](#cron-процесс)
7. [Компоненты интерфейса](#компоненты-интерфейса)

---

## Общая архитектура

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHATBOT24 ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   TELEGRAM   │    │  OPENROUTER  │    │   UNSPLASH   │  EXTERNAL APIs   │
│  │   CHANNEL    │    │      AI      │    │    API       │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         │ getUpdates        │ rewriteArticle    │ findImage                │
│         ▼                   ▼                   ▼                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      NEXT.JS 14 APPLICATION                          │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                    API LAYER (Route Handlers)                  │  │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │  │   │
│  │  │  │/api/cron/   │ │/api/admin/  │ │/api/blog/posts          │  │  │   │
│  │  │  │sync-telegram│ │   posts     │ │                         │  │  │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────────────┘  │  │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │  │   │
│  │  │  │/api/submit  │ │/api/auth/   │ │                         │  │  │   │
│  │  │  │             │ │ [...nextauth]│ │                         │  │  │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────────────────┘  │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                              │                                       │   │
│  │  ┌───────────────────────────┼───────────────────────────────────┐   │   │
│  │  │                    SERVICE LAYER (lib/)                        │   │   │
│  │  │  ┌─────────────┐ ┌────────┴────┐ ┌─────────────┐ ┌──────────┐│   │   │
│  │  │  │telegram-    │ │ openrouter  │ │  unsplash   │ │  prisma  ││   │   │
│  │  │  │parser.ts   │ │   .ts       │ │   .ts       │ │  .ts     ││   │   │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘│   │   │
│  │  └───────────────────────────────────────────────────────────────┘   │   │
│  │                              │                                       │   │
│  │  ┌───────────────────────────┴───────────────────────────────────┐   │   │
│  │  │                    DATA LAYER (Prisma ORM)                     │   │   │
│  │  │                          PostgreSQL                            │   │   │
│  │  └───────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│  ┌───────────────────────────┴─────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER (React Components)             │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────────┐  │   │
│  │  │    Home     │ │    Blog     │ │   Admin     │ │     Auth       │  │   │
│  │  │   Pages     │ │    Pages    │ │   Panel     │ │    Pages       │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────────┘  │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Технологический стек

| Слой | Технология | Назначение |
|------|------------|------------|
| Frontend | Next.js 14 + React 18 | SSR, SSG, интерактивность |
| Styling | Tailwind CSS | Utility-first CSS |
| Language | TypeScript 5 | Типизация |
| ORM | Prisma 5 | Работа с БД |
| Database | PostgreSQL | Хранение данных |
| Auth | NextAuth.js 5 | Аутентификация |
| Validation | Zod | Валидация данных |

---

## Поток контента

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTENT FLOW DIAGRAM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐                                                           │
│   │   ADMIN     │────────────────┐                                          │
│   │  (GitHub)   │                │                                          │
│   └──────┬──────┘                │                                          │
│          │ signIn()              │                                          │
│          ▼                        │                                          │
│   ┌─────────────┐                 │         ┌──────────────────────────┐    │
│   │   SESSION   │                 │         │   PUBLISHED POSTS        │    │
│   │   COOKIE    │                 │         │   (public access)        │    │
│   └─────────────┘                 │         └───────────┬──────────────┘    │
│                                   │                     │                   │
│   ╔═══════════════════════════════════════════════════════════════════════╗ │
│   ║                        AUTOMATED CONTENT FLOW                         ║ │
│   ╚═══════════════════════════════════════════════════════════════════════╝ │
│                                   │                     │                   │
│   ┌──────────────┐    ┌───────────▼──────────┐         │                   │
│   │   TELEGRAM   │    │     CRON JOB         │         │                   │
│   │   CHANNEL    │────│  /api/cron/sync      │         │                   │
│   │  @channel    │    │  (every 6 hours)     │         │                   │
│   └──────────────┘    └───────────┬──────────┘         │                   │
│                                   │                     │                   │
│                         ┌─────────▼──────────┐         │                   │
│                         │  fetchChannelMsgs()│         │                   │
│                         │  telegram-parser   │         │                   │
│                         └─────────┬──────────┘         │                   │
│                                   │                     │                   │
│                         ┌─────────▼──────────┐         │                   │
│                         │  rewriteArticle()  │         │                   │
│                         │   openrouter.ts    │         │                   │
│                         │  (Mistral 7B)      │         │                   │
│                         └─────────┬──────────┘         │                   │
│                                   │                     │                   │
│                         ┌─────────▼──────────┐         │                   │
│                         │    findImage()     │         │                   │
│                         │    unsplash.ts     │         │                   │
│                         └─────────┬──────────┘         │                   │
│                                   │                     │                   │
│                         ┌─────────▼──────────┐         │                   │
│                         │   CREATE POST      │         │                   │
│                         │   status: PENDING  │         │                   │
│                         └─────────┬──────────┘         │                   │
│                                   │                     │                   │
│                                   ▼                     ▼                   │
│                         ┌──────────────────────────────────────────┐       │
│                         │              POSTGRESQL DATABASE          │       │
│                         │  ┌────────────┐      ┌────────────────┐  │       │
│                         │  │   POST     │      │     USER       │  │       │
│                         │  │   Table    │      │    Table       │  │       │
│                         │  └────────────┘      └────────────────┘  │       │
│                         └──────────────────────────────────────────┘       │
│                                   │                     ▲                   │
│                                   │                     │                   │
│                         ┌─────────▼──────────┐         │                   │
│                         │   ADMIN PANEL      │         │                   │
│                         │  /api/admin/posts  │         │                   │
│                         │                    │         │                   │
│                         │  PATCH status →    │─────────┘                   │
│                         │  PUBLISHED         │                             │
│                         └────────────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Пошаговый процесс

```
Шаг 1: Получение сообщений
━━━━━━━━━━━━━━━━━━━━━━━━━━
GET https://api.telegram.org/bot<TOKEN>/getUpdates
     ↓
Парсинг сообщений → Фильтрация по каналу → Извлечение текста

Шаг 2: AI-рерайтинг
━━━━━━━━━━━━━━━━━━
POST https://openrouter.ai/api/v1/chat/completions
     ↓
System Prompt + Original Text → Mistral 7B → JSON с полями:
     • title, summary, content
     • tags, metaTitle, metaDescription

Шаг 3: Поиск изображения
━━━━━━━━━━━━━━━━━━━━━━━━
GET https://api.unsplash.com/search/photos
     ↓
Поиск по первым 3 тегам + ['technology', 'ai']
     ↓
Возврат URL изображения

Шаг 4: Создание записи
━━━━━━━━━━━━━━━━━━━━━━
Prisma Post.create()
     • status: PENDING (для модерации)
     • telegramMessageId (для защиты от дубликатов)
     • slug (транслитерация заголовка)

Шаг 5: Модерация
━━━━━━━━━━━━━━━━
Админ → PATCH /api/admin/posts
     • status: PUBLISHED или REJECTED
     • publishedAt: текущая дата

Шаг 6: Публикация
━━━━━━━━━━━━━━━━━
GET /api/blog/posts
     • Фильтр: status = PUBLISHED
     • Сортировка: publishedAt DESC
```

---

## Схема базы данных

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                              ENUMS                                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │   │   PostStatus    │  │   ImageSource   │  │    UserRole     │     │   │
│  │   ├─────────────────┤  ├─────────────────┤  ├─────────────────┤     │   │
│  │   │ PENDING         │  │ UNSPLASH        │  │ ADMIN           │     │   │
│  │   │ PUBLISHED       │  │ AI_GENERATED    │  │ EDITOR          │     │   │
│  │   │ REJECTED        │  │                 │  │                 │     │   │
│  │   └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           POST TABLE                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  id                String    @id @default(cuid())                   │   │
│  │  telegramMessageId BigInt    @unique                                │   │
│  │  originalChannel   String                                           │   │
│  │  originalText      String    @db.Text                               │   │
│  │  rewrittenTitle    String                                           │   │
│  │  rewrittenContent  String    @db.Text                               │   │
│  │  summary           String    @db.Text                               │   │
│  │  imageUrl          String?                                          │   │
│  │  imageSource       ImageSource                                      │   │
│  │  tags              String[]                                         │   │
│  │  slug              String    @unique                                │   │
│  │  status            PostStatus @default(PENDING)                     │   │
│  │  views             Int       @default(0)                            │   │
│  │  metaTitle         String?                                          │   │
│  │  metaDescription   String?                                          │   │
│  │  createdAt         DateTime  @default(now())                        │   │
│  │  updatedAt         DateTime  @updatedAt                             │   │
│  │  publishedAt       DateTime?                                        │   │
│  │                                                                      │   │
│  │  @@index([status, publishedAt])                                     │   │
│  │  @@index([slug])                                                    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         USER & AUTH TABLES                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────┐                                   │   │
│  │  │            USER              │                                   │   │
│  │  ├──────────────────────────────┤                                   │   │
│  │  │ id            String   @id   │◄────────────────────┐             │   │
│  │  │ email         String   @unique                     │             │   │
│  │  │ name          String?                              │             │   │
│  │  │ image         String?                              │             │   │
│  │  │ role          UserRole @default(EDITOR)            │             │   │
│  │  │ createdAt     DateTime @default(now())             │             │   │
│  │  │ updatedAt     DateTime @updatedAt                  │             │   │
│  │  │ accounts      Account[]  ◄──┐                      │             │   │
│  │  │ sessions      Session[]  ◄──┼──────────────────────┘             │   │
│  │  └──────────────────────────────┘   │                               │   │
│  │                                      │                               │   │
│  │  ┌─────────────────────────────┐    │     ┌───────────────────────┐ │   │
│  │  │          ACCOUNT            │    │     │        SESSION        │ │   │
│  │  ├─────────────────────────────┤    │     ├───────────────────────┤ │   │
│  │  │ id                String @id│    │     │ id           String @id│ │   │
│  │  │ userId            String    │────┘     │ sessionToken String    │ │   │
│  │  │ type              String    │◄─────────│ userId       String    │ │   │
│  │  │ provider          String    │          │ expires      DateTime  │ │   │
│  │  │ providerAccountId String    │          └───────────────────────┘ │   │
│  │  │ refresh_token     String?   │                                      │   │
│  │  │ access_token      String?   │                                      │   │
│  │  │ expires_at        Int?      │                                      │   │
│  │  │ token_type        String?   │                                      │   │
│  │  │ scope             String?   │                                      │   │
│  │  │ id_token          String?   │                                      │   │
│  │  │ session_state     String?   │                                      │   │
│  │  │                               ┌──────────────────────────────┐    │   │
│  │  └───────────────────────────────┤  VERIFICATION TOKEN          │    │   │
│  │                                  ├──────────────────────────────┤    │   │
│  │                                  │ identifier   String          │    │   │
│  │                                  │ token        String   @unique│    │   │
│  │                                  │ expires      DateTime        │    │   │
│  │                                  └──────────────────────────────┘    │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Описание таблиц

#### Post
Основная таблица для хранения статей блога.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | CUID | Уникальный идентификатор |
| `telegramMessageId` | BigInt | ID сообщения в Telegram (защита от дубликатов) |
| `originalChannel` | String | Исходный Telegram-канал |
| `originalText` | Text | Оригинальный текст из Telegram |
| `rewrittenTitle` | String | Заголовок после AI-рерайта |
| `rewrittenContent` | Text | Контент после AI-рерайта (HTML) |
| `summary` | Text | Краткое описание |
| `imageUrl` | String? | URL изображения |
| `imageSource` | Enum | Источник: Unsplash или AI |
| `tags` | String[] | Массив тегов |
| `slug` | String | URL-friendly идентификатор (уникальный) |
| `status` | Enum | PENDING / PUBLISHED / REJECTED |
| `views` | Int | Счётчик просмотров |
| `metaTitle` | String? | SEO заголовок |
| `metaDescription` | String? | SEO описание |

#### User, Account, Session
Таблицы NextAuth.js для аутентификации.

---

## API Routes

### Структура endpoints

```
app/api/
├── auth/[...nextauth]/
│   └── route.ts          # NextAuth.js обработчик
│                           GET/POST /api/auth/*
│
├── blog/posts/
│   └── route.ts          # Публичные посты
│                           GET /api/blog/posts
│                           GET /api/blog/posts?slug=xxx
│
├── admin/posts/
│   └── route.ts          # Управление постами
│                           GET  /api/admin/posts (список)
│                           PATCH /api/admin/posts (обновить статус)
│                           DELETE /api/admin/posts?id=xxx (удалить)
│
├── cron/sync-telegram/
│   └── route.ts          # Cron задача
│                           GET/POST /api/cron/sync-telegram
│                           Требует: Authorization: Bearer <CRON_SECRET>
│
└── submit/
    └── route.ts          # Форма обратной связи
                            POST /api/submit
```

### Примеры запросов

#### Получение публикаций

```http
GET /api/blog/posts?page=1&limit=10

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasMore": true
  },
  "meta": {
    "tags": ["ai", "bots", "automation"]
  }
}
```

#### Модерация поста

```http
PATCH /api/admin/posts
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "id": "clxxx...",
  "status": "PUBLISHED"
}

Response:
{
  "success": true,
  "message": "Post published successfully",
  "data": {
    "id": "clxxx...",
    "status": "PUBLISHED",
    "publishedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Ручной запуск синхронизации

```http
POST /api/cron/sync-telegram
Authorization: Bearer your-cron-secret

Response:
{
  "success": true,
  "message": "Telegram sync completed",
  "processed": 3,
  "skipped": 5,
  "errors": 0,
  "posts": [...]
}
```

---

## Аутентификация

### Flow аутентификации

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AUTHENTICATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐                     ┌──────────────┐    ┌──────────────┐    │
│   │  USER    │                     │   GITHUB     │    │  CHATBOT24   │    │
│   └────┬─────┘                     └──────┬───────┘    └──────┬───────┘    │
│        │                                  │                   │            │
│        │ 1. Клик "Войти через GitHub"    │                   │            │
│        │─────────────────────────────────>│                   │            │
│        │                                  │                   │            │
│        │ 2. Авторизация на GitHub        │                   │            │
│        │<─────────────────────────────────│                   │            │
│        │                                  │                   │            │
│        │ 3. Callback с code              │                   │            │
│        │─────────────────────────────────────────────────────>│            │
│        │                                  │                   │            │
│        │                                  │   4. Обмен code на token      │
│        │                                  │<──────────────────│            │
│        │                                  │                   │            │
│        │                                  │   5. Получение профиля        │
│        │                                  │──────────────────>│            │
│        │                                  │                   │            │
│        │                                  │   6. signIn callback          │
│        │                                  │   Проверка username           │
│        │                                  │   === ADMIN_GITHUB_USERNAME   │
│        │                                  │                   │            │
│        │ 7. Session cookie                │                   │            │
│        │<─────────────────────────────────────────────────────│            │
│        │                                  │                   │            │
│        │ 8. Доступ к admin панели        │                   │            │
│        │─────────────────────────────────────────────────────>│            │
│        │                                  │                   │            │
│   ┌────┴─────┐                     ┌──────┴───────┐    ┌──────┴───────┐    │
│   │  USER    │                     │   GITHUB     │    │  CHATBOT24   │    │
│   └──────────┘                     └──────────────┘    └──────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Защита роутов

```typescript
// app/api/admin/posts/route.ts

async function requireAdmin(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== UserRole.ADMIN) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user: session.user };
}
```

### Session структура

```typescript
{
  user: {
    id: "clxxx...",
    email: "admin@example.com",
    name: "Admin Name",
    image: "https://avatars.githubusercontent.com/...",
    role: "ADMIN" // или "EDITOR"
  },
  expires: "2024-02-15T10:30:00.000Z"
}
```

---

## Cron процесс

### Диаграмма процесса

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CRON JOB PROCESS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TRIGGER (каждые 6 часов)                                                  │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────────────────────────────────────────────────────────┐      │
│   │                    /api/cron/sync-telegram                       │      │
│   │                                                                  │      │
│   │  1. AUTH CHECK                                                   │      │
│   │     └─> Authorization: Bearer <CRON_SECRET>                     │      │
│   │                                                                  │      │
│   │  2. FETCH MESSAGES                                               │      │
│   │     └─> GET telegram.org/bot<TOKEN>/getUpdates                  │      │
│   │         Filter: channel_post || message                          │      │
│   │         Limit: last 20 messages                                  │      │
│   │                                                                  │      │
│   │  3. CHECK DUPLICATES                                             │      │
│   │     └─> SELECT telegramMessageId FROM Post                       │      │
│   │         Filter: newMessages = messages - existingIds            │      │
│   │                                                                  │      │
│   │  4. PROCESS EACH MESSAGE                                         │      │
│   │     │                                                            │      │
│   │     ├──> SKIP if text.length < 50                               │      │
│   │     │                                                            │      │
│   │     ├──> OPENROUTER                                              │      │
│   │     │    POST openrouter.ai/api/v1/chat/completions             │      │
│   │     │    Model: mistralai/mistral-7b-instruct:free              │      │
│   │     │    Response: { title, summary, content, tags, ... }       │      │
│   │     │                                                            │      │
│   │     ├──> UNSPLASH                                                │      │
│   │     │    GET api.unsplash.com/search/photos                     │      │
│   │     │    Query: tags[0..2] + ['technology', 'ai']               │      │
│   │     │                                                            │      │
│   │     ├──> GENERATE SLUG                                           │      │
│   │     │    transliterate(title) -> slug                           │      │
│   │     │    ensure uniqueness: slug-1, slug-2, ...                 │      │
│   │     │                                                            │      │
│   │     └──> CREATE POST                                             │      │
│   │          Prisma Post.create()                                   │      │
│   │          status: PENDING                                        │      │
│   │                                                                  │      │
│   │  5. RESPONSE                                                     │      │
│   │     {                                                            │      │
│   │       success: true,                                             │      │
│   │       processed: N,                                              │      │
│   │       skipped: M,                                                │      │
│   │       errors: K,                                                 │      │
│   │       posts: [...]                                               │      │
│   │     }                                                            │      │
│   │                                                                  │      │
│   └─────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Конфигурация cron

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-telegram",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Обработка ошибок

```typescript
// Каждый этап обёрнут в try-catch
for (const message of newMessages) {
  try {
    // Переписывание
    const rewritten = await rewriteArticle(message.text);
  } catch (rewriteError) {
    console.error(`Failed to rewrite message ${message.id}`);
    results.errors++;
    continue; // Пропускаем сообщение, продолжаем с остальными
  }
  
  // ... остальные этапы
}
```

---

## Компоненты интерфейса

### Структура компонентов

```
components/
├── blog/
│   ├── BlogCard.tsx      # Карточка статьи в списке
│   └── BlogGrid.tsx      # Сетка статей
│
├── home/
│   ├── HeroSection.tsx       # Главный баннер
│   ├── FeaturesSection.tsx   # Преимущества
│   ├── HowItWorksSection.tsx # Как это работает
│   ├── ScenariosSection.tsx  # Сценарии использования
│   ├── IntegrationsSection.tsx # Интеграции
│   ├── FAQSection.tsx        # FAQ
│   ├── CTASection.tsx        # Призыв к действию
│   └── index.ts              # Экспорты
│
├── layout/
│   ├── Header.tsx        # Шапка сайта
│   └── Footer.tsx        # Подвал
│
├── seo/
│   └── SEOHead.tsx       # SEO метатеги
│
└── ui/
    ├── Button.tsx        # Кнопка
    └── Card.tsx          # Карточка
```

### Flow данных в компонентах

```
Page Component
     │
     ├──> getServerSideData() или useEffect()
     │         │
     │         ▼
     │    fetch('/api/blog/posts')
     │         │
     │         ▼
     │    Prisma query
     │
     ▼
Presentational Components
     │
     ├──> BlogGrid
     │       │
     │       └──> BlogCard[]
     │
     ├──> Header
     │       │
     │       └──> Auth status, Navigation
     │
     └──> Footer
```

---

## Производительность

### Оптимизации

| Техника | Реализация | Результат |
|---------|------------|-----------|
| **Database Indexing** | `@@index([status, publishedAt])` | Быстрый поиск публикаций |
| **Image Optimization** | `next/image` + Unsplash CDN | Авто-ресайз и WebP |
| **API Caching** | Vercel Edge Cache | Снижение нагрузки |
| **Selective Fetching** | Prisma `select` | Только нужные поля |
| **Parallel Queries** | `Promise.all([posts, total])` | Ускорение загрузки |

### Масштабирование

```
Current: Vercel Hobby (Serverless)
  └── Лимит: 10s execution time
  └── Подходит для: до 1000 статей

Future: Vercel Pro + Connection Pooling
  └── Увеличение timeout
  └── Redis для кэширования
  └── CDN для статики
```

---

## Безопасность

### Меры защиты

| Уровень | Меры |
|---------|------|
| **API** | CRON_SECRET для cron endpoints |
| **Auth** | NextAuth.js + CSRF токены |
| **Input** | Zod валидация всех входов |
| **SQL** | Prisma (защита от SQL injection) |
| **XSS** | React escape + DOMPurify |
| **CORS** | Настроены заголовки в next.config.js |

---

## Мониторинг

### Логирование

```typescript
// Структура логов
console.log('[Cron] Starting Telegram sync job...');
console.log(`[Cron] Found ${messages.length} messages`);
console.log(`[Admin] Post ${id} status updated to ${status} by ${user.email}`);
console.error('[Cron] Fatal error during sync:', error);
```

### Метрики

- **Vercel Analytics**: Web Vitals, посещаемость
- **Database**: Размер, количество записей
- **API**: Время ответа, количество ошибок
