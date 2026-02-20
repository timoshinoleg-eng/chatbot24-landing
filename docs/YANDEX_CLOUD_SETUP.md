# Yandex Cloud Functions для GigaChat прокси

## Регистрация и настройка

### 1. Регистрация в Yandex Cloud
1. Перейди на https://cloud.yandex.ru
2. Нажми "Попробовать бесплатно"
3. Войди через Яндекс ID или создай аккаунт
4. Привяжи карту (спишут 1₽ и вернут — для верификации)
5. Получи **Start Grant** — 4000₽ на 60 дней (хватит надолго)

### 2. Создание функции

1. В консоли Yandex Cloud перейди в **Functions**
2. Нажми **"Создать функцию"**
3. Название: `gigachat-proxy`
4. Нажми **"Создать"**

### 3. Создание версии функции

**Runtime:** Node.js 18

**Код:**

```javascript
const https = require('https');

const GIGACHAT_TOKEN_URL = 'ngw.devices.sberbank.ru';
const GIGACHAT_API_URL = 'gigachat.devices.sberbank.ru';

exports.handler = async (event, context) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: ''
        };
    }

    const { messages } = JSON.parse(event.body || '{}');
    
    if (!messages || !Array.isArray(messages)) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Messages array required' })
        };
    }

    const authKey = process.env.GIGACHAT_AUTH_KEY;
    
    if (!authKey) {
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Auth key not configured' })
        };
    }

    try {
        // Получаем токен
        const token = await getToken(authKey);
        
        // Отправляем запрос в GigaChat
        const response = await chatWithGigaChat(messages, token);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ success: true, message: response })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Спасибо за интерес! Чтобы дать точный ответ, подключу специалиста. Оставьте контакт — он свяжется в течение часа.',
                fallback: true 
            })
        };
    }
};

function getToken(authKey) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: GIGACHAT_TOKEN_URL,
            port: 9443,
            path: '/api/v2/oauth',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': generateUUID(),
                'Authorization': `Basic ${authKey}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.access_token) {
                        resolve(response.access_token);
                    } else {
                        reject(new Error('No access token'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write('scope=GIGACHAT_API_PERS');
        req.end();
    });
}

function chatWithGigaChat(messages, token) {
    return new Promise((resolve, reject) => {
        const systemPrompt = `Ты — AI-ассистент ChatBot24.su, продающий чат-ботов и автоматизацию для B2B.

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
5. CTA: бриф, демо или консультация`;

        const options = {
            hostname: GIGACHAT_API_URL,
            port: 443,
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const body = JSON.stringify({
            model: 'GigaChat',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response.choices?.[0]?.message?.content || 'Извините, произошла ошибка.');
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

**Точка входа:** `index.handler`

**Таймаут:** 10 секунд

**Память:** 128 МБ

### 4. Переменные окружения
В разделе **"Переменные окружения"** добавь:
- `GIGACHAT_AUTH_KEY` = твой Base64 ключ

### 5. Публичный доступ
1. В настройках функции включи **"Публичный доступ"**
2. Скопируй URL функции (будет такой: `https://functions.yandexcloud.net/xxxxxxxxxxxxxxxx`)

### 6. Обновление сайта
Пришли мне полученный URL — я обновлю код сайта, чтобы чат обращался к Yandex Cloud Functions.

---

## Стоимость
- **Бесплатно** в рамках Start Grant (4000₽ на 60 дней)
- После — около 0.5₽ за 1000 вызовов (очень дёшево)

---

## Альтернатива
Если Yandex Cloud сложно, могу настроить **свой прокси-сервер** на бесплатном хостинге (Render.com, Railway.app) — но там тоже нужна регистрация.

**Рекомендую Yandex Cloud** — стабильно, дёшево, российские сертификаты уже есть.