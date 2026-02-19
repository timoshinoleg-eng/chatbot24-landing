/**
 * Form submission handler
 * Validates and sends contact form submissions to Telegram bot
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_NOTIFICATION_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

// Validation schema for form data
const submitSchema = z.object({
  telegram: z
    .string()
    .min(5, 'Telegram username must be at least 5 characters')
    .max(32, 'Telegram username must be at most 32 characters')
    .transform((val) => {
      // Remove @ if present
      return val.startsWith('@') ? val.slice(1) : val;
    })
    .refine(
      (val) => /^[a-zA-Z0-9_]+$/.test(val),
      'Telegram username can only contain letters, numbers, and underscores'
    ),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be at most 1000 characters')
    .transform((val) => val.trim()),
  name: z
    .string()
    .max(100, 'Name must be at most 100 characters')
    .optional()
    .transform((val) => val?.trim() || undefined),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
});

/**
 * Type for submission response
 */
interface SubmissionResponse {
  success: boolean;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Escape special characters for Telegram HTML
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Send notification to Telegram bot
 */
async function sendTelegramNotification(data: {
  telegram: string;
  message: string;
  name?: string;
  email?: string;
}): Promise<boolean> {
  console.log('TELEGRAM_BOT_TOKEN exists:', !!TELEGRAM_BOT_TOKEN);
  console.log('TELEGRAM_NOTIFICATION_CHAT_ID exists:', !!TELEGRAM_NOTIFICATION_CHAT_ID);
  console.log('TELEGRAM_NOTIFICATION_CHAT_ID value:', TELEGRAM_NOTIFICATION_CHAT_ID);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_NOTIFICATION_CHAT_ID) {
    console.warn('Telegram notification not configured');
    return false;
  }

  const formattedMessage = `
<b>📝 New Contact Form Submission</b>

<b>From:</b> ${escapeHtml(data.name || 'Anonymous')}
<b>Telegram:</b> @${escapeHtml(data.telegram)}
${data.email ? `<b>Email:</b> ${escapeHtml(data.email)}` : ''}

<b>Message:</b>
${escapeHtml(data.message)}

<i>Submitted at: ${new Date().toLocaleString('ru-RU')}</i>
  `.trim();

  try {
    const url = `${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`;
    console.log('Sending Telegram request to:', url.replace(TELEGRAM_BOT_TOKEN!, '***TOKEN***'));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_NOTIFICATION_CHAT_ID,
        text: formattedMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    console.log('Telegram response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Telegram notification failed:', errorData);
      return false;
    }

    const responseData = await response.json();
    console.log('Telegram response:', responseData);

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * POST handler - Process form submission
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = submitSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          message: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Send notification to Telegram
    const notificationSent = await sendTelegramNotification({
      telegram: data.telegram,
      message: data.message,
      name: data.name,
      email: data.email || undefined,
    });

    // Log submission (in production, you might want to save to database)
    console.log('Form submission received:', {
      telegram: data.telegram,
      name: data.name,
      email: data.email,
      messageLength: data.message.length,
      notificationSent,
      timestamp: new Date().toISOString(),
    });

    if (!notificationSent) {
      return NextResponse.json<SubmissionResponse>(
        {
          success: false,
          message: 'Failed to send notification. Please try again later.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<SubmissionResponse>(
      {
        success: true,
        message: 'Thank you! Your message has been sent successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing form submission:', error);

    return NextResponse.json<SubmissionResponse>(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle other methods
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
