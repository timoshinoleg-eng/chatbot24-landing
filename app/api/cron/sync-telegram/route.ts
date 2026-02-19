/**
 * Cron job endpoint for syncing Telegram channel messages
 * Triggered by Vercel Cron or external scheduler
 * Protected by CRON_SECRET header
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchChannelMessages } from '@/lib/telegram-parser';
import { rewriteArticle } from '@/lib/openrouter';
import { findImage } from '@/lib/unsplash';
import { PostStatus, ImageSource } from '@prisma/client';
import { z } from 'zod';

// Telegram channel configuration
const TELEGRAM_CHANNEL_ID = '@ml_digest_daily';
const TELEGRAM_CHANNEL_NUMERIC_ID = '3587382769';

// Validation schema for environment
const envSchema = z.object({
  CRON_SECRET: z.string().min(1, 'CRON_SECRET is required'),
});

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  const translit: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
    я: 'ya', ' ': '-', _: '-',
  };

  return title
    .toLowerCase()
    .split('')
    .map((char) => translit[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

/**
 * GET handler - Cron job endpoint
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Cron] Starting Telegram sync job...');

  try {
    // Validate environment
    const envResult = envSchema.safeParse({
      CRON_SECRET: process.env.CRON_SECRET,
    });

    if (!envResult.success) {
      console.error('[Cron] Missing CRON_SECRET environment variable');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify cron secret header
    const authHeader = request.headers.get('authorization');
    const expectedSecret = `Bearer ${envResult.data.CRON_SECRET}`;

    if (!authHeader || authHeader !== expectedSecret) {
      console.warn('[Cron] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch messages from Telegram channel
    console.log(`[Cron] Fetching messages from ${TELEGRAM_CHANNEL_ID}...`);
    const messages = await fetchChannelMessages(TELEGRAM_CHANNEL_ID, 20);

    if (messages.length === 0) {
      console.log('[Cron] No messages found');
      return NextResponse.json({
        success: true,
        message: 'No new messages to process',
        processed: 0,
        skipped: 0,
        errors: 0,
        duration: Date.now() - startTime,
      });
    }

    console.log(`[Cron] Found ${messages.length} messages`);

    // Get existing message IDs to filter duplicates
    const existingIds = await prisma.post.findMany({
      select: { telegramMessageId: true },
    });
    const existingIdSet = new Set(existingIds.map((p) => p.telegramMessageId.toString()));

    // Filter new messages
    const newMessages = messages.filter(
      (msg) => !existingIdSet.has(msg.id.toString())
    );

    console.log(`[Cron] ${newMessages.length} new messages to process`);

    const results = {
      processed: 0,
      skipped: messages.length - newMessages.length,
      errors: 0,
      posts: [] as Array<{
        id: string;
        telegramId: number;
        title: string;
        status: string;
      }>,
    };

    // Process each new message
    for (const message of newMessages) {
      try {
        // Skip messages that are too short
        if (!message.text || message.text.length < 50) {
          console.log(`[Cron] Skipping message ${message.id}: too short`);
          results.skipped++;
          continue;
        }

        console.log(`[Cron] Processing message ${message.id}...`);

        // Rewrite content via OpenRouter
        let rewritten;
        try {
          rewritten = await rewriteArticle(message.text, TELEGRAM_CHANNEL_ID);
        } catch (rewriteError) {
          console.error(`[Cron] Failed to rewrite message ${message.id}:`, rewriteError);
          results.errors++;
          continue;
        }

        // Find image via Unsplash
        const searchKeywords = rewritten.tags.slice(0, 3).concat(['technology', 'ai']);
        const imageUrl = await findImage(searchKeywords, 'landscape');

        // Generate unique slug
        let slug = generateSlug(rewritten.title);
        let slugSuffix = 0;
        const originalSlug = slug;

        // Ensure slug uniqueness
        while (await prisma.post.findUnique({ where: { slug } })) {
          slugSuffix++;
          slug = `${originalSlug}-${slugSuffix}`;
        }

        // Create post in database
        const post = await prisma.post.create({
          data: {
            telegramMessageId: BigInt(message.id),
            originalChannel: TELEGRAM_CHANNEL_ID,
            originalText: message.text,
            rewrittenTitle: rewritten.title,
            rewrittenContent: rewritten.content,
            summary: rewritten.summary,
            imageUrl: imageUrl || undefined,
            imageSource: imageUrl ? ImageSource.UNSPLASH : ImageSource.AI_GENERATED,
            tags: rewritten.tags,
            slug,
            status: PostStatus.PENDING,
            metaTitle: rewritten.metaTitle,
            metaDescription: rewritten.metaDescription,
          },
        });

        console.log(`[Cron] Created post ${post.id} from message ${message.id}`);

        results.processed++;
        results.posts.push({
          id: post.id,
          telegramId: message.id,
          title: rewritten.title,
          status: post.status,
        });
      } catch (error) {
        console.error(`[Cron] Error processing message ${message.id}:`, error);
        results.errors++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron] Sync completed in ${duration}ms`, results);

    return NextResponse.json({
      success: true,
      message: 'Telegram sync completed',
      ...results,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Fatal error during sync:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Alternative for manual trigger
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
