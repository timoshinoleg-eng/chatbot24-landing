import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import https from 'https';

const GIGACHAT_API_URL = 'gigachat.devices.sberbank.ru';
const GIGACHAT_TOKEN_URL = 'ngw.devices.sberbank.ru';

// Загружаем сертификат Минцифры
let caCert: Buffer | undefined;
try {
  const certPath = join(process.cwd(), 'russian_trusted_root_ca_pem.crt');
  caCert = readFileSync(certPath);
  console.log('Certificate loaded successfully');
} catch (error) {
  console.error('Failed to load certificate:', error);
}

// Создаем HTTPS агент с сертификатом
const httpsAgent = caCert 
  ? new https.Agent({ ca: caCert })
  : undefined;

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

// Функция для fetch с кастомным HTTPS агентом
async function fetchWithCert(url: string, options: RequestInit): Promise<Response> {
  if (httpsAgent && url.startsWith('https://')) {
    // Используем нативный https модуль
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string>,
        agent: httpsAgent,
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve(new Response(data, {
            status: res.statusCode,
            headers: new Headers(Object.entries(res.headers as Record<string, string>)),
          }));
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }
  
  return fetch(url, options);
}

// Получение токена GigaChat
async function getGigaChatToken(): Promise<string> {
  const authKey = process.env.GIGACHAT_AUTH_KEY;
  
  if (!authKey) {
    throw new Error('GIGACHAT_AUTH_KEY not configured');
  }

  const response = await fetchWithCert(`https://${GIGACHAT_TOKEN_URL}:9443/api/v2/oauth`, {
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
    const errorText = await response.text();
    console.error('Token request failed:', response.status, errorText);
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
  const response = await fetchWithCert(`https://${GIGACHAT_API_URL}/api/v1/chat/completions`, {
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
    const errorText = await response.text();
    console.error('Chat request failed:', response.status, errorText);
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

    console.log('Certificate loaded:', !!caCert);
    console.log('HTTPS Agent:', !!httpsAgent);

    // Получаем токен
    const token = await getGigaChatToken();
    console.log('Token received:', !!token);

    // Отправляем запрос в GigaChat
    const reply = await sendToGigaChat(messages, token);
    console.log('Reply received:', reply.substring(0, 100));

    return NextResponse.json({ 
      success: true, 
      message: reply 
    });

  } catch (error) {
    console.error('GigaChat API error:', error);
    
    return NextResponse.json({
      success: true,
      message: 'Спасибо за интерес! Чтобы дать точный ответ, подключу специалиста. Оставьте контакт — он свяжется в течение часа.',
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}