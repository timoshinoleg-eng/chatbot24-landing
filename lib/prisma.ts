/**
 * Prisma client singleton for Next.js
 * Prevents multiple instances in development due to hot reloading
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export default for convenience
export default prisma;

/**
 * Safely disconnects from the database
 * Should be called when the application shuts down
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Connects to the database explicitly
 * Usually not needed as Prisma connects lazily on first query
 */
export async function connectPrisma(): Promise<void> {
  await prisma.$connect();
}

/**
 * Executes a transaction with automatic rollback on error
 * @param operations - Array of Prisma operations to execute in a transaction
 */
export async function executeTransaction<T>(
  operations: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return prisma.$transaction(operations);
}

/**
 * Checks if Prisma client is connected
 * Note: This is a best-effort check as Prisma connects lazily
 */
export function isPrismaConnected(): boolean {
  // Prisma doesn't expose a direct connection status
  // This is a workaround checking if the client exists
  return !!prisma;
}

/**
 * Type exports for convenience
 */
export type { 
  PrismaClient,
  // Common model types - uncomment as needed based on your schema
  // User,
  // Post,
  // Article,
  // Channel,
  // Message,
} from '@prisma/client';
