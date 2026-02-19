/**
 * NextAuth.js v5 (Auth.js) Configuration
 * GitHub OAuth with Prisma Adapter and Admin-only access
 * @see https://authjs.dev/getting-started/installation
 */

import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Admin GitHub username from environment
const ADMIN_GITHUB_USERNAME = process.env.ADMIN_GITHUB_USERNAME;

/**
 * NextAuth configuration options
 */
export const authOptions = {
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
    strategy: 'database' as const,
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
      const githubUsername = profile?.login as string | undefined;

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
    async session({ session, user }) {
      if (session.user) {
        // Add user ID
        session.user.id = user.id;
        // Add user role from database
        session.user.role = (user as { role: UserRole }).role;
      }
      return session;
    },

    /**
     * JWT callback (used when session strategy is 'jwt')
     * Note: We use database strategy, but this is here for flexibility
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
  },
  events: {
    /**
     * Create user event - automatically set admin role
     */
    async createUser({ user }) {
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
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

/**
 * NextAuth handler
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
