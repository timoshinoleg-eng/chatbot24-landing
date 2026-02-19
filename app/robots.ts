import { MetadataRoute } from "next";

/**
 * Generate robots.txt configuration
 * @returns Robots configuration for Next.js
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatbot24.ru";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow admin routes
        disallow: ["/admin/", "/api/admin/", "/api/auth/"],
      },
      {
        // Google-specific rules
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        // Bing-specific rules
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
