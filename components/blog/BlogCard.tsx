'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================
// Types & Interfaces
// ============================================

type BlogTag = 'AI' | 'Автоматизация' | 'Бизнес' | 'Telegram' | 'VK' | string;

interface BlogCardProps {
  /** Post slug/URL */
  slug: string;
  /** Post title */
  title: string;
  /** Post excerpt/description */
  excerpt?: string;
  /** Featured image URL */
  image: string;
  /** Post tags */
  tags?: BlogTag[];
  /** Publish date (ISO 8601 or formatted string) */
  date: string;
  /** Reading time in minutes */
  readingTime?: number;
  /** Custom className */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

// ============================================
// Tag Color Mapping
// ============================================

const tagColors: Record<string, { bg: string; text: string; border: string }> = {
  'AI': {
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
  'Автоматизация': {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  'Бизнес': {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  'Telegram': {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  'VK': {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  'default': {
    bg: 'bg-white/10',
    text: 'text-text-secondary',
    border: 'border-white/20',
  },
};

function getTagStyles(tag: BlogTag) {
  return tagColors[tag] || tagColors.default;
}

// ============================================
// Date Formatter
// ============================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================
// Main Component
// ============================================

export function BlogCard({
  slug,
  title,
  excerpt,
  image,
  tags = [],
  date,
  readingTime,
  className,
  style,
}: BlogCardProps) {
  const formattedDate = formatDate(date);

  return (
    <article
      className={cn(
        'group relative flex flex-col',
        'bg-surface rounded-2xl overflow-hidden',
        'border border-white/5',
        'transition-all duration-300',
        'hover:border-white/10 hover:shadow-xl hover:shadow-black/20',
        className
      )}
      style={style}
    >
      <Link href={`/blog/${slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Glassmorphism overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
          
          {/* Hover overlay with glass effect */}
          <div
            className={cn(
              'absolute inset-0',
              'bg-surfaceGlass/80 backdrop-blur-sm',
              'flex items-center justify-center',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-300'
            )}
          >
            <span className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              Читать статью
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-5">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, 3).map((tag) => {
                const styles = getTagStyles(tag);
                return (
                  <span
                    key={tag}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-full border',
                      styles.bg,
                      styles.text,
                      styles.border
                    )}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-text-secondary text-sm line-clamp-2 mb-4 flex-grow">
              {excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 text-text-muted text-sm mt-auto pt-4 border-t border-white/5">
            {/* Date */}
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <time dateTime={date}>{formattedDate}</time>
            </div>

            {/* Reading time */}
            {readingTime && (
              <>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-1.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{readingTime} мин</span>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default BlogCard;
