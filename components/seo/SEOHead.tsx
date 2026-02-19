'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
  tags?: string[];
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage = '/og-image.png',
  ogType = 'website',
  publishedAt,
  modifiedAt,
  tags = [],
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = `${title} | ChatBot24 Studio`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {canonical && <link rel="canonical" href={canonical} />}
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="ChatBot24 Studio" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Article specific */}
      {ogType === 'article' && publishedAt && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          {modifiedAt && (
            <meta property="article:modified_time" content={modifiedAt} />
          )}
          {tags.map((tag) => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
        </>
      )}
    </Head>
  );
}
