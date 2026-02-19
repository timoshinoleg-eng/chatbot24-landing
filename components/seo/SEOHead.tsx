import React from 'react';
import Head from 'next/head';

// ============================================
// Types & Interfaces
// ============================================

interface SEOHeadProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Canonical URL */
  canonical?: string;
  /** Is this an article page? */
  article?: boolean;
  /** Article publish date (ISO 8601) */
  publishedAt?: string;
  /** Article modified date (ISO 8601) */
  modifiedAt?: string;
  /** Article tags/keywords */
  tags?: string[];
  /** No index this page */
  noIndex?: boolean;
  /** Custom meta tags */
  additionalMeta?: Array<{ name: string; content: string }>;
}

// ============================================
// Default Configuration
// ============================================

const siteConfig = {
  name: 'ChatBot24',
  url: 'https://chatbot24.ru',
  logo: 'https://chatbot24.ru/logo.png',
  twitterHandle: '@chatbot24',
  defaultOgImage: 'https://chatbot24.ru/og-image.jpg',
  description:
    'Создаем интеллектуальных Telegram и VK ботов для автоматизации бизнеса. Продажи, поддержка, запись — 24/7.',
};

// ============================================
// JSON-LD Generators
// ============================================

function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: siteConfig.logo,
    sameAs: [
      'https://t.me/chatbot24_bot',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@chatbot24.ru',
      availableLanguage: ['Russian'],
    },
  };
}

function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  image: string,
  publishedAt: string,
  modifiedAt?: string,
  tags?: string[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image,
    url: url,
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: siteConfig.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: tags?.join(', '),
    articleSection: 'Блог',
    inLanguage: 'ru-RU',
  };
}

// ============================================
// Main Component
// ============================================

export function SEOHead({
  title,
  description,
  ogImage,
  canonical,
  article = false,
  publishedAt,
  modifiedAt,
  tags,
  noIndex = false,
  additionalMeta = [],
}: SEOHeadProps) {
  // Build full title
  const fullTitle = title === siteConfig.name 
    ? title 
    : `${title} | ${siteConfig.name}`;
  
  // Use provided image or default
  const image = ogImage || siteConfig.defaultOgImage;
  
  // Build canonical URL
  const canonicalUrl = canonical ? `${siteConfig.url}${canonical}` : siteConfig.url;

  // Generate JSON-LD schemas
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  const articleSchema = article && publishedAt
    ? generateArticleSchema(
        title,
        description,
        canonicalUrl,
        image,
        publishedAt,
        modifiedAt,
        tags
      )
    : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Keywords from tags */}
      {tags && tags.length > 0 && (
        <meta name="keywords" content={tags.join(', ')} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Language */}
      <meta property="og:locale" content="ru_RU" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteConfig.name} />

      {/* Open Graph Article-specific */}
      {article && publishedAt && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {modifiedAt && (
            <meta property="article:modified_time" content={modifiedAt} />
          )}
          <meta property="article:author" content={siteConfig.name} />
          {tags?.map((tag) => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitterHandle} />
      <meta name="twitter:creator" content={siteConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      {additionalMeta.map((meta) => (
        <meta key={meta.name} name={meta.name} content={meta.content} />
      ))}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema),
          }}
        />
      )}
    </Head>
  );
}

export default SEOHead;
