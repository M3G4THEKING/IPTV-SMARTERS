import { locales, type Locale } from "@/lib/i18n";

/** First path segment when it is a supported locale (e.g. `/uk/blog/` → `uk`). */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment && locales.includes(segment as Locale)) {
    return segment as Locale;
  }
  return null;
}

/**
 * Remove one or more leading locale segments.
 * Fixes malformed paths like `/ca/uk/blog/` → `/blog/`.
 */
export function stripLocalePrefix(pathname: string): string {
  let segments = pathname.split("/").filter(Boolean);

  while (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments = segments.slice(1);
  }

  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

/** Build a localized URL path with trailing slash (matches site trailingSlash config). */
export function buildLocalizedPath(locale: Locale, pathWithoutLocale: string): string {
  const rest = stripLocalePrefix(pathWithoutLocale);

  if (rest === "/") {
    return `/${locale}/`;
  }

  const suffix = rest.endsWith("/") ? rest : `${rest}/`;
  return `/${locale}${suffix}`;
}

/** True when path has two locale segments in a row (`/ca/uk/...`). */
export function hasDuplicateLocalePrefix(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return (
    segments.length >= 2 &&
    locales.includes(segments[0] as Locale) &&
    locales.includes(segments[1] as Locale)
  );
}

/** Resolve `/ca/uk/foo/` → `/uk/foo/` (keeps the second locale as canonical). */
export function fixDuplicateLocalePath(pathname: string): string | null {
  if (!hasDuplicateLocalePrefix(pathname)) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const targetLocale = segments[1] as Locale;
  const rest = segments.slice(2).join("/");

  return rest ? `/${targetLocale}/${rest}/` : `/${targetLocale}/`;
}
