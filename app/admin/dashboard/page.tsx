"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PostStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

// Types
interface Post {
  id: string;
  telegramMessageId: bigint;
  originalChannel: string;
  rewrittenTitle: string;
  summary: string;
  imageUrl: string | null;
  tags: string[];
  slug: string;
  status: PostStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

type StatusFilter = "ALL" | PostStatus;

interface Stats {
  total: number;
  published: number;
  pending: number;
  rejected: number;
}

const STATUS_FILTERS: { value: StatusFilter; label: string; color: string }[] =
  [
    { value: "ALL", label: "Все", color: "bg-gray-500" },
    {
      value: PostStatus.PENDING,
      label: "На модерации",
      color: "bg-yellow-500",
    },
    {
      value: PostStatus.PUBLISHED,
      label: "Опубликованы",
      color: "bg-green-500",
    },
    {
      value: PostStatus.REJECTED,
      label: "Отклонены",
      color: "bg-red-500",
    },
  ];

const POSTS_PER_PAGE = 10;

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/admin/login?callbackUrl=${encodeURIComponent("/admin/dashboard")}`);
    }
  }, [status, router]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: POSTS_PER_PAGE.toString(),
        status: activeFilter,
      });

      const response = await fetch(`/api/admin/posts?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setPagination(data.pagination);

        // Calculate stats from posts
        const allPosts = data.data as Post[];
        setStats({
          total: data.pagination.total,
          published: allPosts.filter((p) => p.status === PostStatus.PUBLISHED)
            .length,
          pending: allPosts.filter((p) => p.status === PostStatus.PENDING)
            .length,
          rejected: allPosts.filter((p) => p.status === PostStatus.REJECTED)
            .length,
        });
      } else {
        throw new Error(data.message || "Failed to fetch posts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeFilter, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPosts();
    }
  }, [fetchPosts, status]);

  // Handle post actions
  const handlePublish = async (postId: string) => {
    setActionInProgress(postId);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId,
          status: "PUBLISHED",
        }),
      });

      if (!response.ok) throw new Error("Failed to publish post");

      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish post");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (postId: string) => {
    setActionInProgress(postId);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId,
          status: "REJECTED",
        }),
      });

      if (!response.ok) throw new Error("Failed to reject post");

      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject post");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) return;

    setActionInProgress(postId);
    try {
      const response = await fetch(`/api/admin/posts?id=${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      await fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setActionInProgress(null);
    }
  };

  // Loading state
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Загрузка...
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: PostStatus) => {
    const styles = {
      [PostStatus.PENDING]: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      [PostStatus.PUBLISHED]: "bg-green-500/20 text-green-400 border-green-500/30",
      [PostStatus.REJECTED]: "bg-red-500/20 text-red-400 border-red-500/30",
    };

    const labels = {
      [PostStatus.PENDING]: "На модерации",
      [PostStatus.PUBLISHED]: "Опубликован",
      [PostStatus.REJECTED]: "Отклонен",
    };

    return (
      <span
        className={cn(
          "px-2.5 py-1 text-xs font-medium rounded-full border",
          styles[status]
        )}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="bg-surface border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="font-bold text-white">ChatBot24</span>
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">Админ панель</span>
            </div>
            <div className="flex items-center gap-4">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ""}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-text-secondary text-sm hidden sm:block">
                {session?.user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Всего", value: stats.total, color: "text-white" },
              {
                label: "Опубликованы",
                value: stats.published,
                color: "text-green-400",
              },
              {
                label: "На модерации",
                value: stats.pending,
                color: "text-yellow-400",
              },
              {
                label: "Отклонены",
                value: stats.rejected,
                color: "text-red-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface border border-white/10 rounded-xl p-4"
              >
                <p className="text-text-muted text-sm">{stat.label}</p>
                <p className={cn("text-2xl font-bold", stat.color)}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setActiveFilter(filter.value);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeFilter === filter.value
                  ? "bg-indigo-500 text-white"
                  : "bg-surface border border-white/10 text-text-secondary hover:text-white hover:border-white/20"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Posts Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-white/10 rounded-xl">
            <p className="text-text-secondary">Нет статей для отображения</p>
          </div>
        ) : (
          <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-text-secondary text-sm font-medium px-6 py-4">
                      Статья
                    </th>
                    <th className="text-left text-text-secondary text-sm font-medium px-6 py-4">
                      Статус
                    </th>
                    <th className="text-left text-text-secondary text-sm font-medium px-6 py-4">
                      Просмотры
                    </th>
                    <th className="text-left text-text-secondary text-sm font-medium px-6 py-4">
                      Дата
                    </th>
                    <th className="text-right text-text-secondary text-sm font-medium px-6 py-4">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.imageUrl && (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={post.imageUrl}
                                alt={post.rewrittenTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white line-clamp-1">
                              {post.rewrittenTitle}
                            </p>
                            <p className="text-text-muted text-sm">
                              {post.tags.slice(0, 3).join(", ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {post.views}
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-sm">
                        {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewPost(post)}
                            className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Предпросмотр"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {post.status === PostStatus.PENDING && (
                            <>
                              <button
                                onClick={() => handlePublish(post.id)}
                                disabled={actionInProgress === post.id}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Опубликовать"
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReject(post.id)}
                                disabled={actionInProgress === post.id}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Отклонить"
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Открыть на сайте"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={actionInProgress === post.id}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Удалить"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                <p className="text-text-muted text-sm">
                  Показано {(currentPage - 1) * POSTS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * POSTS_PER_PAGE,
                    pagination.total
                  )}{" "}
                  из {pagination.total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Назад
                  </button>
                  <span className="text-text-muted text-sm">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!pagination.hasMore}
                    className="px-4 py-2 text-sm text-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPost && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewPost(null)}
        >
          <div
            className="bg-surface border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-surface z-10">
              <h2 className="text-xl font-bold text-white">
                Предпросмотр статьи
              </h2>
              <button
                onClick={() => setPreviewPost(null)}
                className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {previewPost.imageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                  <Image
                    src={previewPost.imageUrl}
                    alt={previewPost.rewrittenTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {previewPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                {previewPost.rewrittenTitle}
              </h1>
              <p className="text-text-secondary">{previewPost.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
