import { NextRequest, NextResponse } from 'next/server';

const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
const GIGACHAT_TOKEN_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';

// Системный промт для бота
const SYSTEM_PROMPT = `Ты — AI-ассистент ChatBot24.su, продающий чат-ботов и автоматизацию для B2B.

Твоя цель: превратить посетителя сайта в квалифицированного лида.

Стиль общения:
- Профессионально, но по-человечески (без канцелярита)
- Короткие сообщения: 1-3 предложения
- Лёгкий юмор, но серьёзность
- Не дави, показывай выгоды

Ключевые боли B2B:
1. Лиды теряются, менеджеры долго отвечают
2. Нужно больше заявок без увеличения трафика
3. Менеджеры тратят время на рутину

Аргументы:
- Скорость: ответ за секунды
- 24/7: работает ночью и в выходные
- Квалификация: передаёт только тёплых лидов
- Интеграции: CRM, мессенджеры, сайт

Структура диалога:
1. Hook: приветствие + сильное обещание
2. Квалификация: ниша, роль, проблема, объём
3. Персонализация: как бот решит проблему
4. Мини-кейс: короткий пример с результатом
5. CTA: бриф, демо или консультация

Если вопрос сложный — предложи живого специалиста.`;

// Получение токена GigaChat
async function getGigaChatToken(): Promise<string> {
  const authKey = process.env.GIGACHAT_AUTH_KEY;
  
  if (!authKey) {
    throw new Error('GIGACHAT_AUTH_KEY not configured');
  }

  const response = await fetch(GIGACHAT_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': crypto.randomUUID(),
      'Authorization': `Basic ${authKey}`,
    },
    body: 'scope=GIGACHAT_API_PERS',
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Отправка сообщения в GigaChat
async function sendToGigaChat(
  messages: Array<{ role: string; content: string }>,
  token: string
): Promise<string> {
  const response = await fetch(GIGACHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: 'GigaChat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Извините, произошла ошибка. Попробуйте позже.';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    // Получаем токен
    const token = await getGigaChatToken();

    // Отправляем запрос в GigaChat
    const reply = await sendToGigaChat(messages, token);

    return NextResponse.json({ 
      success: true, 
      message: reply 
    });

  } catch (error) {
    console.error('GigaChat API error:', error);
    
    // Fallback: если GigaChat недоступен, возвращаем заглушку
    return NextResponse.json({
      success: true,
      message: 'Спасибо за интерес! Чтобы дать точный ответ, подключу специалиста. Оставьте контакт — он свяжется в течение часа.',
      fallback: true,
    });
  }
}