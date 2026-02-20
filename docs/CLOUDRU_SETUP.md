# Cloud.ru Functions для GigaChat прокси

## Что нужно сделать

### 1. Регистрация в Cloud.ru
- Зайди на https://cloud.ru
- Зарегистрируйся / войди
- Перейди в раздел "Functions"

### 2. Создание функции

Название: `gigachat-proxy`
Runtime: `Node.js 18`

Код функции:

```javascript
const https = require('https');
const http = require('http');

const GIGACHAT_TOKEN_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';

exports.handler = async (event, context) => {
    const { messages } = JSON.parse(event.body || '{}');
    
    if (!messages || !Array.isArray(messages)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Messages array required' })
        };
    }

    const authKey = process.env.GIGACHAT_AUTH_KEY;
    
    if (!authKey) {
        return {
            statusCode: 500,
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
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ success: true, message: response })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
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
            hostname: 'ngw.devices.sberbank.ru',
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
                    resolve(response.access_token);
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
        const systemPrompt = `Ты — AI-ассистент ChatBot24.su...`; // полный промпт
        
        const options = {
            hostname: 'gigachat.devices.sberbank.ru',
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
                    resolve(response.choices[0]?.message?.content || 'Извините, произошла ошибка.');
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

### 3. Переменные окружения
В настройках функции добавь:
- `GIGACHAT_AUTH_KEY` = твой ключ

### 4. Получение URL
После создания функции Cloud.ru даст URL типа:
`https://functions.cloud.ru/xxx/gigachat-proxy`

### 5. Обновление сайта
Я обновлю код сайта, чтобы чат обращался к Cloud.ru вместо прямых запросов к GigaChat.

---

## Альтернатива: проще

Если Cloud.ru сложно, можно использовать **Yandex Cloud Functions** — там тоже есть сертификаты и бесплатный тариф.

Какой вариант выбираем?