import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import {
  HeroSection,
  ScenariosSection,
  FeaturesSection,
  HowItWorksSection,
  IntegrationsSection,
  FAQSection,
  CTASection,
} from "@/components/home";
import { BlogGrid } from "@/components/blog/BlogGrid";
import Link from "next/link";

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

// Fetch latest blog posts
async function getLatestPosts(): Promise<BlogPost[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
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

    return posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.rewrittenTitle,
      excerpt: post.summary,
      image: post.imageUrl || "/images/blog-placeholder.jpg",
      tags: post.tags,
      date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      readingTime: Math.ceil(post.summary.length / 1000),
    }));
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
}

export default async function HomePage() {
  const latestPosts = await getLatestPosts();

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Scenarios Section */}
      <ScenariosSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Integrations Section */}
      <IntegrationsSection />

      {/* Latest Blog Posts Section */}
      {latestPosts.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Блог
                </h2>
                <p className="text-text-secondary text-lg max-w-2xl">
                  Полезные материалы о чат-ботах, автоматизации и AI
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden md:flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Все статьи
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
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

            <BlogGrid posts={latestPosts} columns={3} gap="lg" />

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Все статьи
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
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
