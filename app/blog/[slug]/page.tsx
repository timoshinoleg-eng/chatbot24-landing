import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { SEOHead } from "@/components/seo/SEOHead";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Types
interface BlogPost {
  id: string;
  slug: string;
  rewrittenTitle: string;
  rewrittenContent: string;
  summary: string;
  imageUrl: string | null;
  tags: string[];
  views: number;
  publishedAt: Date | null;
  updatedAt: Date;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface RelatedPost {
  id: string;
  slug: string;
  rewrittenTitle: string;
  summary: string;
  imageUrl: string | null;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
}

// Generate static params for all published posts
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      select: {
        slug: true,
      },
    });

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Failed to fetch posts for static generation:', error);
    // Return empty array if DB is not available (build will skip static generation)
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
      status: PostStatus.PUBLISHED,
    },
    select: {
      rewrittenTitle: true,
      summary: true,
      metaTitle: true,
      metaDescription: true,
      tags: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  if (!post) {
    return {
      title: "Статья не найдена",
    };
  }

  const title = post.metaTitle || post.rewrittenTitle;
  const description = post.metaDescription || post.summary;

  return {
    title,
    description,
    keywords: post.tags,
    authors: [{ name: "ChatBot24" }],
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags,
    },
  };
}

// Fetch single post
async function getPost(slug: string): Promise<BlogPost | null> {
  const post = await prisma.post.findUnique({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
    select: {
      id: true,
      slug: true,
      rewrittenTitle: true,
      rewrittenContent: true,
      summary: true,
      imageUrl: true,
      tags: true,
      views: true,
      publishedAt: true,
      updatedAt: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  return post;
}

// Fetch related posts
async function getRelatedPosts(
  currentSlug: string,
  tags: string[]
): Promise<RelatedPost[]> {
  const posts = await prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      slug: {
        not: currentSlug,
      },
      tags: {
        hasSome: tags,
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
    select: {
      id: true,
      slug: true,
      rewrittenTitle: true,
      summary: true,
      imageUrl: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return posts;
}

// Format date
function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Calculate reading time
function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Tag colors
const tagColors: Record<string, string> = {
  AI: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Автоматизация: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Бизнес: "bg-green-500/20 text-green-400 border-green-500/30",
  Telegram: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  VK: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const relatedPosts = await getRelatedPosts(post.slug, post.tags);

  const readingTime = getReadingTime(post.rewrittenContent);
  const publishDate = post.publishedAt || post.updatedAt;

  // Article JSON-LD schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.rewrittenTitle,
    description: post.summary,
    image: post.imageUrl || "https://chatbot24.ru/og-image.jpg",
    url: `https://chatbot24.ru/blog/${post.slug}`,
    datePublished: publishDate.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "ChatBot24",
      url: "https://chatbot24.ru",
    },
    publisher: {
      "@type": "Organization",
      name: "ChatBot24",
      logo: {
        "@type": "ImageObject",
        url: "https://chatbot24.ru/logo.png",
      },
    },
    keywords: post.tags.join(", "),
    articleSection: "Блог",
    inLanguage: "ru-RU",
  };

  // Breadcrumb JSON-LD schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: "https://chatbot24.ru",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Блог",
        item: "https://chatbot24.ru/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.rewrittenTitle,
        item: `https://chatbot24.ru/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <SEOHead
        title={post.metaTitle || post.rewrittenTitle}
        description={post.metaDescription || post.summary}
        ogType="article"
        publishedAt={publishDate.toISOString()}
        modifiedAt={post.updatedAt.toISOString()}
        tags={post.tags}
        canonical={`/blog/${post.slug}`}
      />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      {/* Breadcrumbs */}
      <div className="pt-24 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-text-muted">
            <Link
              href="/"
              className="hover:text-text-secondary transition-colors"
            >
              Главная
            </Link>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <Link
              href="/blog"
              className="hover:text-text-secondary transition-colors"
            >
              Блог
            </Link>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-text-secondary truncate max-w-[200px]">
              {post.rewrittenTitle}
            </span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <article className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full border transition-colors hover:opacity-80",
                    tagColors[tag] ||
                      "bg-white/10 text-text-secondary border-white/20"
                  )}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.rewrittenTitle}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm mb-8 pb-8 border-b border-white/10">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
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
              <time dateTime={publishDate.toISOString()}>
                {formatDate(publishDate)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
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
              <span>{readingTime} мин чтения</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>{post.views} просмотров</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <Image
                src={post.imageUrl}
                alt={post.rewrittenTitle}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-img:rounded-xl prose-pre:bg-surface prose-pre:border prose-pre:border-white/10"
            dangerouslySetInnerHTML={{ __html: post.rewrittenContent }}
          />

          {/* Share Buttons */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Поделиться статьей
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(
                  `https://chatbot24.ru/blog/${post.slug}`
                )}&text=${encodeURIComponent(post.rewrittenTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </a>
              <a
                href={`https://vk.com/share.php?url=${encodeURIComponent(
                  `https://chatbot24.ru/blog/${post.slug}`
                )}&title=${encodeURIComponent(post.rewrittenTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#4a76a8] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.673 4 8.231c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.744-.576.744z" />
                </svg>
                VK
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  `https://chatbot24.ru/blog/${post.slug}`
                )}&text=${encodeURIComponent(post.rewrittenTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">
              Похожие статьи
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="group bg-surface rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    {relatedPost.imageUrl && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={relatedPost.imageUrl}
                          alt={relatedPost.rewrittenTitle}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {relatedPost.rewrittenTitle}
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-2">
                        {relatedPost.summary}
                      </p>
                      <div className="mt-4 text-text-muted text-sm">
                        {formatDate(
                          relatedPost.publishedAt || relatedPost.createdAt
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
