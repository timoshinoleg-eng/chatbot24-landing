/**
 * Public Blog Posts API
 * Unprotected endpoints for fetching published blog posts
 * Supports pagination, search, and tag filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostStatus } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  search: z.string().max(100).optional(),
  tag: z.string().max(50).optional(),
  slug: z.string().optional(),
});

/**
 * Build search query for PostgreSQL full-text search
 * Uses simple ILIKE for now, can be upgraded to full-text search
 */
function buildSearchQuery(search: string): { rewrittenTitle?: object; summary?: object } {
  return {
    rewrittenTitle: { contains: search, mode: 'insensitive' as const },
    summary: { contains: search, mode: 'insensitive' as const },
  };
}

/**
 * GET /api/blog/posts
 * List published posts with pagination, search, and tag filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = getPostsQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      tag: searchParams.get('tag'),
      slug: searchParams.get('slug'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid query parameters',
          errors: queryResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { page, limit, search, tag, slug } = queryResult.data;
    const skip = (page - 1) * limit;

    // If slug is provided, fetch single post
    if (slug) {
      const post = await prisma.post.findFirst({
        where: {
          slug,
          status: PostStatus.PUBLISHED,
        },
        select: {
          id: true,
          rewrittenTitle: true,
          rewrittenContent: true,
          summary: true,
          imageUrl: true,
          imageSource: true,
          tags: true,
          slug: true,
          views: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true,
          originalChannel: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!post) {
        return NextResponse.json(
          { error: 'Not found', message: 'Post not found' },
          { status: 404 }
        );
      }

      // Increment view count (fire and forget)
      prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        data: post,
      });
    }

    // Build where clause for list query
    const where: Parameters<typeof prisma.post.findMany>[0]['where'] = {
      status: PostStatus.PUBLISHED,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { rewrittenTitle: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Add tag filter
    if (tag) {
      where.tags = { has: tag };
    }

    // Execute queries in parallel
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          rewrittenTitle: true,
          summary: true,
          imageUrl: true,
          tags: true,
          slug: true,
          views: true,
          publishedAt: true,
          metaTitle: true,
          metaDescription: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Get all unique tags for tag cloud (only on first page without search/filter)
    let allTags: string[] = [];
    if (page === 1 && !search && !tag) {
      const tagsResult = await prisma.post.findMany({
        where: { status: PostStatus.PUBLISHED },
        select: { tags: true },
      });
      // Flatten and get unique tags
      const tagCounts: Record<string, number> = {};
      tagsResult.forEach((post) => {
        post.tags.forEach((t) => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });
      allTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([tag]) => tag);
    }

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
      meta: {
        tags: allTags,
        search: search || null,
        tagFilter: tag || null,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch posts',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/posts/[slug]
 * Fetch single post by slug (handled via query param in main GET)
 * This is a convenience method for /api/blog/posts?slug=xxx
 */

/**
 * Handle other methods
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
