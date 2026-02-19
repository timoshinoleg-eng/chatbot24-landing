import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  POSTGRES_PRISMA_URL: z.string().min(1),
  POSTGRES_URL_NON_POOLING: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHANNEL_ID: z.string().min(1),
  OPENROUTER_API_KEY: z.string().min(1),
  UNSPLASH_ACCESS_KEY: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  ADMIN_GITHUB_USERNAME: z.string().min(1),
});

export const env = envSchema.parse(process.env);
