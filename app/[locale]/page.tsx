import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { buildLocaleHomepageMetadata } from "@/lib/utils/homepage-route-metadata";
import { getAllBlogs } from "@/lib/admin/blog";
import { isBlogAvailableInLocale } from "@/lib/utils/blog-slugs";
import HomePageClient from "./HomePageClient";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!locales.includes(localeParam as Locale)) {
    return { title: "Page Not Found", description: "The page you are looking for does not exist." };
  }
  return buildLocaleHomepageMetadata(localeParam as Locale);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!locales.includes(localeParam as Locale)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const blogs = await getAllBlogs();
  const latestBlogs = blogs
    .filter((blog) => isBlogAvailableInLocale(blog, locale))
    .slice(0, 3);

  return <HomePageClient latestBlogs={latestBlogs} />;
}
