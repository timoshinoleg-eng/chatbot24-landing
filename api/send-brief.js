/**
 * API Route: /api/send-brief
 * Send brief form data to Telegram group
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            business_niche,
            goals,
            priority,
            current_process,
            platform,
            audience,
            audience_desc,
            features,
            examples,
            services,
            integration,
            integration_details,
            budget,
            timeline,
            name,
            phone,
            email,
            comment
        } = req.body;

        if (!name || !phone || !business_niche) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'Name, phone and business niche are required'
            });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Missing Telegram configuration');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Build message
        const messageText = `
📝 <b>НОВЫЙ БРИФ НА РАЗРАБОТКУ ЧАТ-БОТА</b>

<b>👤 Контакты:</b>
• Имя: ${escapeHtml(name)}
• Телефон/TG: ${escapeHtml(phone)}
• Email: ${escapeHtml(email) || '—'}

<b>🏢 Бизнес:</b>
${escapeHtml(business_niche)}

<b>🎯 Цель:</b> ${escapeHtml(goals) || '—'}
<b>🔥 Приоритет:</b> ${priority || '5'}/10

<b>📋 Текущий процесс:</b>
${escapeHtml(current_process) || '—'}

<b>💻 Платформа:</b> ${escapeHtml(platform) || '—'}

<b>👥 Аудитория:</b> ${escapeHtml(audience) || '—'}
${audience_desc ? `<b>Портрет:</b> ${escapeHtml(audience_desc)}` : ''}

<b>⚙️ Функции:</b> ${escapeHtml(features) || '—'}

<b>📌 Примеры:</b>
${escapeHtml(examples) || '—'}

<b>🔗 Сервисы:</b> ${escapeHtml(services) || '—'}
<b>Интеграция:</b> ${escapeHtml(integration) || '—'}
${integration_details ? `<b>Детали интеграции:</b> ${escapeHtml(integration_details)}` : ''}

<b>💰 Бюджет:</b> ${escapeHtml(budget) || '—'}
<b>⏱️ Сроки:</b> ${escapeHtml(timeline) || '—'}

${comment ? `<b>💬 Комментарий:</b> ${escapeHtml(comment)}` : ''}

<i>🤖 Отправлено из брифа на chatbot24.su</i>
        `.trim();

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            console.error('Telegram API error:', result);
            return res.status(500).json({
                error: 'Failed to send message',
                details: result.description || 'Unknown error'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Brief submitted successfully'
        });

    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            stack: error.stack
        });
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb'
        }
    }
};
