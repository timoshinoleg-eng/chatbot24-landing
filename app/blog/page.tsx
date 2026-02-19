"use client";

import { useState, useEffect, useCallback } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { cn } from "@/lib/utils";

// Types
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tags: string[];
  date: string;
  readingTime?: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

type TagFilter = "all" | "AI" | "Автоматизация" | "Бизнес";

const TAGS: { value: TagFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "AI", label: "AI" },
  { value: "Автоматизация", label: "Автоматизация" },
  { value: "Бизнес", label: "Бизнес" },
];

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [activeTag, setActiveTag] = useState<TagFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: POSTS_PER_PAGE.toString(),
      });

      if (activeTag !== "all") {
        params.append("tag", activeTag);
      }

      const response = await fetch(`/api/blog/posts?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      if (data.success) {
        const formattedPosts: BlogPost[] = data.data.map(
          (post: {
            id: string;
            slug: string;
            rewrittenTitle: string;
            summary: string;
            imageUrl: string | null;
            tags: string[];
            publishedAt: string | null;
            createdAt: string;
            views: number;
          }) => ({
            id: post.id,
            slug: post.slug,
            title: post.rewrittenTitle,
            excerpt: post.summary,
            image: post.imageUrl || "/images/blog-placeholder.jpg",
            tags: post.tags,
            date:
              post.publishedAt?.toString() ||
              post.createdAt.toString(),
            readingTime: Math.ceil(post.summary.length / 1000),
          })
        );

        setPosts(formattedPosts);
        setPagination(data.pagination);
      } else {
        throw new Error(data.message || "Failed to fetch posts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleTagChange = (tag: TagFilter) => {
    setActiveTag(tag);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <SEOHead
        title="Блог об AI и автоматизации"
        description="Полезные статьи о чат-ботах, искусственном интеллекте и автоматизации бизнес-процессов. Экспертные материалы от ChatBot24 Studio."
        canonical="/blog"
      />

      {/* Page Header */}
      <section className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Блог об{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AI и автоматизации
              </span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl">
              Полезные материалы о чат-ботах, искусственном интеллекте и
              автоматизации бизнес-процессов
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => handleTagChange(tag.value)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                  activeTag === tag.value
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-surface border border-white/10 text-text-secondary hover:text-white hover:border-white/20"
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-2xl overflow-hidden border border-white/5 animate-pulse"
                >
                  <div className="aspect-[16/10] bg-white/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-white/5 rounded w-1/3" />
                    <div className="h-6 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-secondary mb-2">
                Ошибка загрузки
              </h3>
              <p className="text-text-muted">{error}</p>
            </div>
          ) : (
            <>
              <BlogGrid posts={posts} columns={3} gap="lg" />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                      "p-2 rounded-lg border transition-all",
                      currentPage === 1
                        ? "border-white/5 text-text-muted cursor-not-allowed"
                        : "border-white/10 text-text-secondary hover:text-white hover:border-white/20"
                    )}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;

                    // Show first, last, current, and neighbors
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                            isActive
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                              : "border border-white/10 text-text-secondary hover:text-white hover:border-white/20"
                          )}
                        >
                          {page}
                        </button>
                      );
                    }

                    // Show ellipsis
                    if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="text-text-muted px-1"
                        >
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasMore}
                    className={cn(
                      "p-2 rounded-lg border transition-all",
                      !pagination.hasMore
                        ? "border-white/5 text-text-muted cursor-not-allowed"
                        : "border-white/10 text-text-secondary hover:text-white hover:border-white/20"
                    )}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
