import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

// Отправка сообщения в OpenRouter
async function sendToOpenRouter(
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://chatbot24.su',
      'X-Title': 'ChatBot24',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet', // или 'openai/gpt-4o', 'meta-llama/llama-3.1-70b'
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('OpenRouter error:', errorData);
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      return NextResponse.json({
        success: true,
        message: 'Спасибо за интерес! Чтобы дать точный ответ, подключу специалиста. Оставьте контакт — он свяжется в течение часа.',
        fallback: true,
      });
    }

    // Отправляем запрос в OpenRouter
    const reply = await sendToOpenRouter(messages, apiKey);

    return NextResponse.json({ 
      success: true, 
      message: reply 
    });

  } catch (error) {
    console.error('OpenRouter API error:', error);
    
    // Fallback
    return NextResponse.json({
      success: true,
      message: 'Спасибо за интерес! Чтобы дать точный ответ, подключу специалиста. Оставьте контакт — он свяжется в течение часа.',
      fallback: true,
    });
  }
}