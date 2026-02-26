// Vercel Serverless Function - Send brief form to Telegram
module.exports = async function handler(req, res) {
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

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '-3771638944';

    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    const text = `
<b>📝 НОВЫЙ БРИФ НА РАЗРАБОТКУ ЧАТ-БОТА</b>

<b>👤 Контакты:</b>
• Имя: ${name}
• Телефон/TG: ${phone}
• Email: ${email || '—'}

<b>🏢 Бизнес:</b>
${business_niche || '—'}

<b>🎯 Цель:</b> ${goals || '—'}
<b>🔥 Приоритет:</b> ${priority || '5'}/10

<b>📋 Текущий процесс:</b>
${current_process || '—'}

<b>💻 Платформа:</b> ${platform || '—'}

<b>👥 Аудитория:</b> ${audience || '—'}
${audience_desc ? `<b>Портрет:</b> ${audience_desc}` : ''}

<b>⚙️ Функции:</b> ${features || '—'}

<b>📌 Примеры:</b>
${examples || '—'}

<b>🔗 Сервисы:</b> ${services || '—'}
<b>Интеграция:</b> ${integration || '—'}
${integration_details ? `<b>Детали:</b> ${integration_details}` : ''}

<b>💰 Бюджет:</b> ${budget || '—'}
<b>⏱️ Сроки:</b> ${timeline || '—'}

${comment ? `<b>💬 Комментарий:</b> ${comment}` : ''}

<i>🤖 Отправлено из брифа на chatbot24.su</i>
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return res.status(500).json({ error: 'Failed to send message', details: data });
    }

    return res.status(200).json({ success: true, message: 'Sent to Telegram' });
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};
