import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Системный промт для бота
const SYSTEM_PROMPT = `Ты — AI-ассистент ChatBot24.su, продающий чат-ботов и автоматизацию для B2B.

Твоя цель: превратить посетителя сайта в квалифицированного лида.

Стиль общения:
- Профессионально, но по-человечески (без канцелярита)
- Короткие сообщения: 1-3 предложения
- Лёгкий юмор, но серьёзность
- Не дави, показывай выгоды`;

// Бесплатные модели OpenRouter
const FREE_MODELS = [
  'openrouter/free',  // Автовыбор бесплатной модели
  'google/gemma-3-4b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8 секунд таймаут

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not set');
      return fallbackResponse('API key not configured');
    }

    console.log('Sending request to OpenRouter...');

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://chatbot24.su',
        'X-Title': 'ChatBot24',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', response.status, error);
      return fallbackResponse(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return fallbackResponse('Empty response');
    }

    return NextResponse.json({ 
      success: true, 
      message: content,
      model: data.model,
    });

  } catch (error) {
    clearTimeout(timeout);
    console.error('Error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return fallbackResponse('Request timeout');
    }
    
    return fallbackResponse(error instanceof Error ? error.message : 'Unknown error');
  }
}

function fallbackResponse(error: string) {
  console.log('Fallback triggered:', error);
  return NextResponse.json({
    success: true,
    message: 'Привет! 👋 Я помогу подобрать решение для автоматизации вашего бизнеса.\n\nРасскажите, чем занимается ваша компания? (например: интернет-магазин, услуги, обучение)',
    fallback: true,
    error,
  });
}