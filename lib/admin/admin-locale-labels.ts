import type { BlogLocale } from "@/lib/admin/blog-locales";

/** Full display names for blog admin (ca/uk are English regional sites, not French). */
export const ADMIN_BLOG_LOCALE_LABELS: Record<BlogLocale, string> = {
  en: "English (US)",
  ca: "English (Canada)",
  uk: "English (UK)",
  es: "Spanish",
  fr: "French",
};

export const ADMIN_BLOG_LOCALE_SHORT: Record<BlogLocale, string> = {
  en: "EN",
  ca: "CA",
  uk: "UK",
  es: "ES",
  fr: "FR",
};

export const ADMIN_BLOG_SLUG_PLACEHOLDERS: Record<BlogLocale, string> = {
  en: "my-blog-post",
  ca: "best-iptv-canada",
  uk: "best-iptv-uk",
  es: "mi-articulo-iptv",
  fr: "mon-article-iptv",
};

const TITLE_PLACEHOLDERS: Record<BlogLocale, string> = {
  en: "Enter blog title",
  ca: "Enter blog title for Canada",
  uk: "Enter blog title for UK",
  es: "Introduce el título del artículo",
  fr: "Saisissez le titre de l'article",
};

const EXCERPT_PLACEHOLDERS: Record<BlogLocale, string> = {
  en: "Short excerpt for the blog listing page",
  ca: "Short excerpt for Canadian visitors",
  uk: "Short excerpt for UK visitors",
  es: "Breve descripción para la página de listado",
  fr: "Courte description pour la page de liste",
};

const META_DESCRIPTION_PLACEHOLDERS: Record<BlogLocale, string> = {
  en: "SEO description for search and social previews",
  ca: "SEO description for Canada (required to publish)",
  uk: "SEO description for UK (required to publish)",
  es: "Descripción SEO para búsqueda y redes sociales",
  fr: "Description SEO pour la recherche et les réseaux sociaux",
};

export function getBlogLocaleLabel(locale: BlogLocale): string {
  return ADMIN_BLOG_LOCALE_LABELS[locale];
}

export function getBlogLocaleShort(locale: BlogLocale): string {
  return ADMIN_BLOG_LOCALE_SHORT[locale];
}

export function getBlogSlugPlaceholder(locale: BlogLocale): string {
  return ADMIN_BLOG_SLUG_PLACEHOLDERS[locale];
}

export function getBlogTitlePlaceholder(locale: BlogLocale): string {
  return TITLE_PLACEHOLDERS[locale];
}

export function getBlogExcerptPlaceholder(locale: BlogLocale): string {
  return EXCERPT_PLACEHOLDERS[locale];
}

export function getBlogMetaDescriptionPlaceholder(locale: BlogLocale): string {
  return META_DESCRIPTION_PLACEHOLDERS[locale];
}

export function getBlogBlockTextPlaceholder(
  locale: BlogLocale,
  blockType: "heading" | "paragraph" | "quote" | "list"
): string {
  const label = getBlogLocaleLabel(locale);
  switch (blockType) {
    case "heading":
      return `Heading text (${label})`;
    case "paragraph":
      return `Paragraph text (${label})`;
    case "quote":
      return `Quote text (${label})`;
    case "list":
      return `List item (${label})`;
  }
}
