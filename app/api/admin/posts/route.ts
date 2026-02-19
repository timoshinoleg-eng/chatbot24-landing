/**
 * Admin Posts API
 * Protected endpoints for managing blog posts
 * Requires ADMIN role authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus, UserRole } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/app/api/auth/[...nextauth]/route';

// Validation schemas
const getPostsQuerySchema = z.object({
  status: z.enum(['PENDING', 'PUBLISHED', 'REJECTED', 'ALL']).optional().default('ALL'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'views']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const updatePostSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
  status: z.enum(['PUBLISHED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be PUBLISHED or REJECTED' }),
  }),
  publishedAt: z.string().datetime().optional().nullable(),
});

const deletePostSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
});

/**
 * Check if user is authenticated and has ADMIN role
 */
async function requireAdmin(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== UserRole.ADMIN) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user: session.user };
}

/**
 * GET /api/admin/posts
 * List all posts with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = getPostsQuerySchema.safeParse({
      status: searchParams.get('status') || 'ALL',
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          errors: queryResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { status, page, limit, search, sortBy, sortOrder } = queryResult.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Parameters<typeof prisma.post.findMany>[0]['where'] = {};

    if (status !== 'ALL') {
      where.status = status as PostStatus;
    }

    if (search) {
      where.OR = [
        { rewrittenTitle: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Execute queries in parallel
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          telegramMessageId: true,
          originalChannel: true,
          rewrittenTitle: true,
          summary: true,
          imageUrl: true,
          tags: true,
          slug: true,
          status: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true,
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/posts
 * Update post status (PUBLISH or REJECT)
 */
export async function PATCH(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = updatePostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          errors: validationResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { id, status, publishedAt } = validationResult.data;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Not found', message: 'Post not found' },
        { status: 404 }
      );
    }

    // Update post
    const updateData: Parameters<typeof prisma.post.update>[0]['data'] = {
      status: status as PostStatus,
    };

    // Set publishedAt if publishing
    if (status === 'PUBLISHED') {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
    } else {
      updateData.publishedAt = null;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        rewrittenTitle: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    console.log(`[Admin] Post ${id} status updated to ${status} by ${authCheck.user?.email}`);

    return NextResponse.json({
      success: true,
      message: `Post ${status === 'PUBLISHED' ? 'published' : 'rejected'} successfully`,
      data: updatedPost,
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts
 * Delete a post
 */
export async function DELETE(request: NextRequest) {
  const authCheck = await requireAdmin(request);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    // Get ID from query params (DELETE requests typically don't have body)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate input
    const validationResult = deletePostSchema.safeParse({ id });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    const { id: postId } = validationResult.data;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Not found', message: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete post
    await prisma.post.delete({
      where: { id: postId },
    });

    console.log(`[Admin] Post ${postId} deleted by ${authCheck.user?.email}`);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      data: { id: postId },
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
