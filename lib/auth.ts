import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * User role enum
 */
export type UserRole = 'ADMIN' | 'USER' | 'EDITOR';

/**
 * Session user interface
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

/**
 * Session data interface
 */
export interface Session {
  user: SessionUser;
  expiresAt: string;
  createdAt: string;
}

/**
 * Get current session from cookies
 * Works in Server Components and Route Handlers
 * @returns Session object or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Get session from request (for API routes and middleware)
 * @param request - NextRequest object
 * @returns Session object or null if not authenticated
 */
export function getSessionFromRequest(request: NextRequest): Session | null {
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Require authentication - throws error or redirects if not authenticated
 * For use in Server Components
 * @param redirectTo - URL to redirect to if not authenticated
 * @returns Session object
 */
export async function requireAuth(redirectTo: string = '/admin/login'): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}

/**
 * Require admin role - throws error or redirects if not admin
 * For use in Server Components
 * @param redirectTo - URL to redirect to if not admin
 * @returns Session object with admin user
 */
export async function requireAdmin(redirectTo: string = '/admin/login'): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect(redirectTo);
  }

  if (session.user.role !== 'ADMIN') {
    redirect(redirectTo);
  }

  return session;
}

/**
 * Check if user is authenticated (for client components)
 * @returns Boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const sessionCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('session='));

  if (!sessionCookie) {
    return false;
  }

  try {
    const sessionValue = decodeURIComponent(sessionCookie.split('=')[1]);
    const session: Session = JSON.parse(sessionValue);
    
    return new Date(session.expiresAt) > new Date();
  } catch {
    return false;
  }
}

/**
 * Check if current user is admin (for client components)
 * @returns Boolean indicating if user is admin
 */
export function isAdmin(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const sessionCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('session='));

  if (!sessionCookie) {
    return false;
  }

  try {
    const sessionValue = decodeURIComponent(sessionCookie.split('=')[1]);
    const session: Session = JSON.parse(sessionValue);
    
    return session.user.role === 'ADMIN' && new Date(session.expiresAt) > new Date();
  } catch {
    return false;
  }
}

/**
 * Get current user from client-side cookie
 * @returns User object or null
 */
export function getCurrentUser(): SessionUser | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const sessionCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('session='));

  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionValue = decodeURIComponent(sessionCookie.split('=')[1]);
    const session: Session = JSON.parse(sessionValue);
    
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

/**
 * Create session cookie string
 * @param user - User data
 * @param expiresInHours - Session expiration time in hours
 * @returns Cookie string for Set-Cookie header
 */
export function createSessionCookie(
  user: SessionUser,
  expiresInHours: number = 24
): string {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

  const session: Session = {
    user,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const cookieValue = JSON.stringify(session);
  const isSecure = process.env.NODE_ENV === 'production';

  return `session=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; ${isSecure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${expiresInHours * 60 * 60}`;
}

/**
 * Clear session cookie
 * @returns Cookie string to clear the session
 */
export function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Auth error types
 */
export type AuthError = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SESSION_EXPIRED'
  | 'INVALID_CREDENTIALS';

/**
 * Auth error class
 */
export class AuthErrorException extends Error {
  constructor(
    public type: AuthError,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
