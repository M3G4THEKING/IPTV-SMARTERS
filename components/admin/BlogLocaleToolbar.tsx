"use client";

import { Copy, Globe, Link2 } from "lucide-react";
import {
  BLOG_LOCALES,
  copyBlogLocaleContent,
  hasLocalePublishableContent,
  type BlogLocale,
} from "@/lib/admin/blog-locales";
import {
  ADMIN_BLOG_LOCALE_LABELS,
  getBlogLocaleLabel,
  getBlogLocaleShort,
} from "@/lib/admin/admin-locale-labels";
import type { BlogPost } from "@/lib/admin/blog-shared";

interface BlogLocaleToolbarProps {
  blog: BlogPost;
  activeLocale: BlogLocale;
  primaryLocale: BlogLocale;
  publishedLocales: BlogLocale[];
  mirrorMode: boolean;
  onBlogChange: (blog: BlogPost) => void;
  onActiveLocaleChange: (locale: BlogLocale) => void;
  onPrimaryLocaleChange: (locale: BlogLocale) => void;
  onPublishedLocalesChange: (locales: BlogLocale[]) => void;
  onMirrorModeChange: (enabled: boolean) => void;
}

export default function BlogLocaleToolbar({
  blog,
  activeLocale,
  primaryLocale,
  publishedLocales,
  mirrorMode,
  onBlogChange,
  onActiveLocaleChange,
  onPrimaryLocaleChange,
  onPublishedLocalesChange,
  onMirrorModeChange,
}: BlogLocaleToolbarProps) {
  const otherPublished = publishedLocales.filter((l) => l !== activeLocale);

  const togglePublished = (loc: BlogLocale) => {
    if (publishedLocales.includes(loc)) {
      if (publishedLocales.length <= 1) return;
      const next = publishedLocales.filter((l) => l !== loc);
      onPublishedLocalesChange(next);
      onBlogChange({ ...blog, translations: next });
      if (activeLocale === loc) {
        onActiveLocaleChange(next[0]);
      }
      if (primaryLocale === loc) {
        onPrimaryLocaleChange(next[0]);
      }
      return;
    }
    const next = [...publishedLocales, loc].sort(
      (a, b) => BLOG_LOCALES.indexOf(a) - BLOG_LOCALES.indexOf(b)
    );
    onPublishedLocalesChange(next);
    onBlogChange({ ...blog, translations: next });
  };

  const handleCopy = (includeSlug: boolean) => {
    if (otherPublished.length === 0) {
      alert("Enable at least one other published language first.");
      return;
    }
    const message = includeSlug
      ? `Copy all content and URL slugs from ${getBlogLocaleLabel(activeLocale)} to ${otherPublished.map((l) => getBlogLocaleLabel(l)).join(", ")}?`
      : `Copy all text content from ${getBlogLocaleLabel(activeLocale)} to ${otherPublished.map((l) => getBlogLocaleLabel(l)).join(", ")}? (Slugs stay separate.)`;
    if (!confirm(message)) return;
    onBlogChange(
      copyBlogLocaleContent(blog, activeLocale, {
        targets: otherPublished,
        includeSlug,
      })
    );
  };

  return (
    <div className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Languages</h3>
        <p className="text-xs text-gray-500 mt-1">
          Write in one language first, then copy or use mirror mode. Publish only the languages you select.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-600 mr-1">Publish:</span>
        {BLOG_LOCALES.map((loc) => {
          const checked = publishedLocales.includes(loc);
          const complete = hasLocalePublishableContent(blog, loc);
          return (
            <label
              key={loc}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? "bg-white border-gray-300 shadow-sm"
                  : "bg-gray-100 border-transparent opacity-80"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => togglePublished(loc)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-800">{getBlogLocaleShort(loc)}</span>
              <span className="text-xs text-gray-500 hidden sm:inline">
                {ADMIN_BLOG_LOCALE_LABELS[loc]}
              </span>
              {checked && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    complete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}
                  title={complete ? "Ready to publish" : "Missing required fields"}
                >
                  {complete ? "ready" : "draft"}
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-gray-600">Primary:</span>
        <select
          value={primaryLocale}
          onChange={(e) => {
            const loc = e.target.value as BlogLocale;
            onPrimaryLocaleChange(loc);
            onBlogChange({ ...blog, locale: loc });
            if (!publishedLocales.includes(loc)) {
              const next = [...publishedLocales, loc].sort(
                (a, b) => BLOG_LOCALES.indexOf(a) - BLOG_LOCALES.indexOf(b)
              );
              onPublishedLocalesChange(next);
              onBlogChange({ ...blog, locale: loc, translations: next });
            }
          }}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg bg-white"
        >
          {publishedLocales.map((loc) => (
            <option key={loc} value={loc}>
              {getBlogLocaleLabel(loc)}
            </option>
          ))}
        </select>

        <span className="text-xs font-medium text-gray-600 ml-2">Editing:</span>
        {publishedLocales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => onActiveLocaleChange(loc)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeLocale === loc
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Globe className="w-3.5 h-3.5 inline mr-1.5" />
            {getBlogLocaleShort(loc)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
        <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            checked={mirrorMode}
            onChange={(e) => onMirrorModeChange(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Link2 className="w-4 h-4 text-gray-500" />
          <span>
            <strong>Mirror editing</strong> — changes apply to all published languages at once
          </span>
        </label>

        <button
          type="button"
          onClick={() => handleCopy(false)}
          disabled={otherPublished.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Copy className="w-4 h-4" />
          Copy {activeLocale.toUpperCase()} → others
        </button>
        <button
          type="button"
          onClick={() => handleCopy(true)}
          disabled={otherPublished.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Also copies URL slugs (use only if slugs should match)"
        >
          <Copy className="w-4 h-4" />
          Copy with slugs
        </button>
      </div>
    </div>
  );
}
