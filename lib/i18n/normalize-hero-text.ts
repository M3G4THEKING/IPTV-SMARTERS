/**
 * Hero copy is rendered inside inline flow (<p> with links). Newlines and extra
 * whitespace from the admin textarea break layout; normalize on edit and save.
 */

import { normalizePricingSection } from "./pricing-display";

const HERO_STRING_KEYS = new Set([
  "title",
  "subtitlePart1",
  "subtitlePart2",
  "eyebrow",
  "description",
  "channelsLink",
  "description2",
  "description3",
  "description4",
  "description5",
  "compatibleDevices",
  "officialSmartersLinkText",
  "officialIboLinkText",
  "m3uLink",
  "freeTest",
  "lead",
  "lead2",
  "lead3",
  "lead4",
  "lead5",
  "cta",
  "ctaNote",
]);

export function normalizeInlineHeroText(value: string): string {
  return value
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeHeroSection(
  hero: Record<string, unknown> | undefined | null
): Record<string, unknown> {
  if (!hero || typeof hero !== "object") {
    return {};
  }

  const result: Record<string, unknown> = { ...hero };

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string" && HERO_STRING_KEYS.has(key)) {
      result[key] = normalizeInlineHeroText(value);
    }
  }

  return result;
}

/** @deprecated Use normalizeAdminTranslationContent */
export function normalizeTranslationHeroContent(
  content: Record<string, unknown>
): Record<string, unknown> {
  return normalizeAdminTranslationContent(content);
}

/** Hero + pricing normalization for admin save/load. */
export function normalizeAdminTranslationContent(
  content: Record<string, unknown>
): Record<string, unknown> {
  if (!content || typeof content !== "object") {
    return content;
  }

  const result: Record<string, unknown> = { ...content };

  if (content.hero && typeof content.hero === "object") {
    result.hero = normalizeHeroSection(content.hero as Record<string, unknown>);
  }

  if (content.pricing && typeof content.pricing === "object") {
    result.pricing = normalizePricingSection(content.pricing as Record<string, unknown>);
  }

  return result;
}

export function normalizeAllTranslationsHero<T extends { content?: Record<string, unknown> }>(
  translations: Record<string, T>
): Record<string, T> {
  const result: Record<string, T> = {};

  for (const [locale, entry] of Object.entries(translations)) {
    if (!entry?.content) {
      result[locale] = entry;
      continue;
    }
    result[locale] = {
      ...entry,
      content: normalizeAdminTranslationContent(entry.content),
    };
  }

  return result;
}

export function validateTranslationSavePayload(body: {
  locale?: unknown;
  content?: unknown;
}): string | null {
  if (!body.locale || typeof body.locale !== "string") {
    return "Missing locale";
  }
  if (!body.content || typeof body.content !== "object" || Array.isArray(body.content)) {
    return "Missing translation content";
  }
  return null;
}
