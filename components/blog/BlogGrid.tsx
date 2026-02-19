'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BlogCard } from './BlogCard';

// ============================================
// Types & Interfaces
// ============================================

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  image: string;
  tags?: string[];
  date: string;
  readingTime?: number;
}

interface BlogGridProps {
  /** Array of blog posts to display */
  posts: BlogPost[];
  /** Custom className */
  className?: string;
  /** Number of columns on large screens (default: 3) */
  columns?: 2 | 3 | 4;
  /** Gap size between cards */
  gap?: 'sm' | 'md' | 'lg';
  /** Whether to show empty state when no posts */
  showEmptyState?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
}

// ============================================
// Empty State Component
// ============================================

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-surface border border-white/10 flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-muted"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-secondary mb-1">
        {message}
      </h3>
      <p className="text-text-muted text-sm">
        Попробуйте изменить параметры поиска или зайдите позже
      </p>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function BlogGrid({
  posts,
  className,
  columns = 3,
  gap = 'md',
  showEmptyState = true,
  emptyMessage = 'Статьи не найдены',
}: BlogGridProps) {
  // Grid column classes based on columns prop
  const gridColumns = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  // Gap classes based on gap prop
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  // If no posts and showEmptyState is true, show empty state
  if (posts.length === 0 && showEmptyState) {
    return (
      <div
        className={cn(
          'grid',
          gridColumns[columns],
          gapClasses[gap],
          className
        )}
      >
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid',
        gridColumns[columns],
        gapClasses[gap],
        className
      )}
    >
      {posts.map((post, index) => (
        <BlogCard
          key={post.id}
          slug={post.slug}
          title={post.title}
          excerpt={post.excerpt}
          image={post.image}
          tags={post.tags}
          date={post.date}
          readingTime={post.readingTime}
          className={cn(
            // Staggered animation on scroll
            'animate-slide-up'
          )}
          style={{
            animationDelay: `${index * 100}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default BlogGrid;
