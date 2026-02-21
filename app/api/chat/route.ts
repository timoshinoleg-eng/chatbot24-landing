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

// Приоритет моделей (от лучшей к запасной)
const MODELS = [
  'deepseek/deepseek-r1-0528:free',      // Лучшая для русского и B2B
  'meta-llama/llama-3.3-70b-instruct:free', // Большая, умная
  'qwen/qwen3-next-80b-a3b-instruct:free',  // Хорошо следует инструкциям
];

// Отправка сообщения в OpenRouter
async function sendToOpenRouter(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  modelIndex: number = 0
): Promise<{ content: string; model: string }> {
  const model = MODELS[modelIndex] || MODELS[0];
  
  console.log(`Trying model: ${model}`);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://chatbot24.su',
      'X-Title': 'ChatBot24',
    },
    body: JSON.stringify({
      model: model,
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
    console.error(`Model ${model} failed:`, response.status, errorData);
    
    // Пробуем следующую модель
    if (modelIndex < MODELS.length - 1) {
      console.log('Trying next model...');
      return sendToOpenRouter(messages, apiKey, modelIndex + 1);
    }
    
    throw new Error(`All models failed. Last error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from API');
  }

  console.log(`Success with model: ${model}`);
  return { content, model };
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

    console.log('=== OpenRouter API Request ===');
    console.log('Messages count:', messages.length);

    // Отправляем запрос в OpenRouter с fallback моделями
    const { content, model } = await sendToOpenRouter(messages, apiKey);
    
    console.log('=== Success ===');
    console.log('Model used:', model);
    console.log('Response preview:', content.substring(0, 100));

    return NextResponse.json({ 
      success: true, 
      message: content,
      model: model,
    });

  } catch (error) {
    console.error('=== OpenRouter API Error ===');
    console.error(error);
    
    return NextResponse.json({
      success: true,
      message: 'Спасибо за интерес! Чтобы дать точный ответ, подключу специалиста. Оставьте контакт — он свяжется в течение часа.',
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}