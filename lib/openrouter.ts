/**
 * OpenRouter AI client for content rewriting
 * Docs: https://openrouter.ai/docs
 */

export interface RewriteResult {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-7b-instruct:free';

const SEO_KEYWORDS = [
  'внедрение чат-ботов',
  'автоматизация бизнеса ИИ',
  'нейросети для продаж',
  'разработка ботов под ключ',
];

/**
 * Rewrites an article using OpenRouter AI with SEO optimization
 */
export async function rewriteArticle(
  originalText: string,
  sourceChannel: string
): Promise<RewriteResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const systemPrompt = `Ты - эксперт по контент-маркетингу и SEO. Твоя задача - переписать статью о чат-ботах и ИИ, 
сохранив суть, но сделав её уникальной, интересной и оптимизированной для поисковых систем.

Обязательно используй эти ключевые слова естественным образом:
${SEO_KEYWORDS.join(', ')}

Верни результат в формате JSON с полями:
- title: привлекательный заголовок (до 70 символов)
- summary: краткое описание для превью (до 200 символов)
- content: полный переписанный текст с HTML-разметкой
- tags: массив тегов (5-7 штук)
- metaTitle: SEO-заголовок (до 60 символов)
- metaDescription: SEO-описание (до 160 символов)`;

  const userPrompt = `Исходный текст из канала ${sourceChannel}:\n\n${originalText}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'ChatBot24 Content Generator',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}` +
        (errorData.error?.message ? ` - ${errorData.error.message}` : '')
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from OpenRouter API');
    }

    // Parse JSON response
    let result: RewriteResult;
    try {
      result = JSON.parse(content);
    } catch {
      // If not valid JSON, try to extract JSON from markdown code block
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Validate required fields
    const requiredFields: (keyof RewriteResult)[] = [
      'title',
      'summary',
      'content',
      'tags',
      'metaTitle',
      'metaDescription',
    ];

    for (const field of requiredFields) {
      if (!result[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure tags is an array
    if (!Array.isArray(result.tags)) {
      result.tags = [];
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error during article rewriting');
  }
}

/**
 * Checks if OpenRouter API is configured and available
 */
export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}
