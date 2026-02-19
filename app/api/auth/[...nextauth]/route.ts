/**
 * NextAuth.js v5 (Auth.js) Configuration
 * GitHub OAuth with Prisma Adapter and Admin-only access
 * @see https://authjs.dev/getting-started/installation
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GitHub from 'next-auth/providers/github';
import type { GitHubProfile } from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Admin GitHub username from environment
const ADMIN_GITHUB_USERNAME = process.env.ADMIN_GITHUB_USERNAME;

/**
 * NextAuth configuration options
 */
const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    /**
     * Sign-in callback - restricts login to admin only
     */
    async signIn({ user, account, profile }) {
      // Only allow GitHub provider
      if (account?.provider !== 'github') {
        console.warn(`Sign-in rejected: provider ${account?.provider} not allowed`);
        return false;
      }

      // Check if admin username is configured
      if (!ADMIN_GITHUB_USERNAME) {
        console.error('ADMIN_GITHUB_USERNAME environment variable is not set');
        return false;
      }

      // Get GitHub username from profile
      const githubUsername = (profile as unknown as GitHubProfile)?.login;

      if (!githubUsername) {
        console.warn('Sign-in rejected: could not get GitHub username');
        return false;
      }

      // Only allow the specified admin username
      if (githubUsername.toLowerCase() !== ADMIN_GITHUB_USERNAME.toLowerCase()) {
        console.warn(`Sign-in rejected: user ${githubUsername} is not authorized`);
        return false;
      }

      console.log(`Admin sign-in authorized: ${githubUsername}`);
      return true;
    },

    /**
     * Session callback - adds user role to session
     */
    async session({ session, user }: { session: Session; user: User }) {
      if (session.user) {
        // Add user ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = user.id;
        // Add user role from database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = (user as any).role;
      }
      return session;
    },

    /**
     * JWT callback (used when session strategy is 'jwt')
     * Note: We use database strategy, but this is here for flexibility
     */
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: UserRole }).role;
      }
      return token;
    },
  },
  events: {
    /**
     * Create user event - automatically set admin role
     */
    async createUser({ user }: { user: User }) {
      try {
        // Update the newly created user to have ADMIN role
        await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.ADMIN },
        });
        console.log(`User ${user.email} assigned ADMIN role`);
      } catch (error) {
        console.error('Failed to assign admin role:', error);
      }
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  debug: process.env.NODE_ENV === 'development',
};

/**
 * NextAuth handler
 */
const handler = NextAuth(authOptions);

// Export as unknown first to avoid TypeScript issues with Next.js 14
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = handler as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any  
export const POST = handler as any;
