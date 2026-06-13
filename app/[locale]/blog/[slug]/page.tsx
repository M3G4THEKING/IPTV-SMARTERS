import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getBlogBySlug } from "@/lib/admin/blog";
import { getBlogUrl, isBlogAvailableInLocale } from "@/lib/utils/blog-slugs";
import BlogPostContent from "./BlogPostContent";

import {
  getSiteBaseUrl,
  optimizeImageForSocialShare,
  resolveAbsoluteImageUrl,
} from "@/lib/seo/og-image";
import { hreflangByLocale } from "@/lib/seo/hreflang";
import { siteNameMap } from "@/lib/i18n/locale-maps";

export const revalidate = 3600; // Revalidate every hour

interface BlogPostPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  let blog = null;

  try {
    // Fetch blog data server-side - this ensures Googlebot sees the content
    blog = await getBlogBySlug(slug, locale);
  } catch (error) {
    console.error("Error loading blog post:", error);
    notFound();
  }

  if (!blog || !isBlogAvailableInLocale(blog, locale)) {
    notFound();
  }

  const title = (blog.title[locale] || "").trim() || "Blog Post";
  const metaDesc = (blog.meta?.description?.[locale] || "").trim();
  const excerptLocale = (blog.excerpt[locale] || "").trim();
  const schemaDescription = metaDesc || excerptLocale;
  const baseUrl = getSiteBaseUrl();
  const imageUrl = optimizeImageForSocialShare(
    resolveAbsoluteImageUrl(blog.featuredImage, baseUrl)
  );
  const localizedPath = getBlogUrl(blog, locale);
  const articleUrl =
    localizedPath && !localizedPath.includes("/blog//")
      ? `${baseUrl}${localizedPath}`
      : `${baseUrl}/${locale}/blog/${slug}/`;

  // Article schema for rich results in search (FAQ, how-to, article snippets)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: schemaDescription,
    image: imageUrl,
    inLanguage: hreflangByLocale[locale],
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    author: blog.author
      ? { "@type": "Person", name: blog.author }
      : { "@type": "Organization", name: siteNameMap[locale], url: `${baseUrl}/${locale}/` },
    publisher: {
      "@type": "Organization",
      name: siteNameMap[locale],
      url: `${baseUrl}/${locale}/`,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo/IPTVSMARTERSNL-LOGO.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostContent blog={blog} locale={locale} />
    </>
  );
}

