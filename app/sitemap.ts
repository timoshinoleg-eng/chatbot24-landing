import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

// Base URL for the site
const BASE_URL = "https://chatbot24.ru";

// Static routes configuration
const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/blog", priority: 0.8, changefreq: "daily" },
  { path: "/services", priority: 0.8, changefreq: "weekly" },
  { path: "/cases", priority: 0.7, changefreq: "weekly" },
  { path: "/contacts", priority: 0.6, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
];

/**
 * Generate dynamic sitemap with blog posts
 * @returns Sitemap configuration for Next.js
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Generate static routes
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq as
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never",
    priority: route.priority,
  }));

  try {
    // Fetch all published blog posts
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    // Generate blog post entries
    const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    // Combine all entries
    return [...staticEntries, ...blogEntries];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static routes only if database query fails
    return staticEntries;
  }
}
