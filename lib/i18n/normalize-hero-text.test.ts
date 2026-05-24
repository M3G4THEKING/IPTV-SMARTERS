import { describe, expect, it } from "vitest";
import {
  normalizeAdminTranslationContent,
  normalizeHeroSection,
  normalizeInlineHeroText,
  validateTranslationSavePayload,
} from "./normalize-hero-text";

describe("normalizeInlineHeroText", () => {
  it("collapses newlines and extra spaces", () => {
    expect(normalizeInlineHeroText("line one\n\nline two")).toBe("line one line two");
    expect(normalizeInlineHeroText("  spaced   out  ")).toBe("spaced out");
  });
});

describe("normalizeHeroSection", () => {
  it("normalizes known hero string fields only", () => {
    const hero = normalizeHeroSection({
      title: "Best IPTV\nService",
      description3: ", etc.\n(Smart TV)",
      nested: { keep: "as-is" },
    });
    expect(hero.title).toBe("Best IPTV Service");
    expect(hero.description3).toBe(", etc. (Smart TV)");
    expect(hero.nested).toEqual({ keep: "as-is" });
  });
});

describe("normalizeAdminTranslationContent", () => {
  it("normalizes hero and pricing inside locale content", () => {
    const content = normalizeAdminTranslationContent({
      hero: {
        description: "Intro\nwith break",
      },
      pricing: {
        title: "Plans",
        plan3MonthsPrice: " $19 \n",
        showPremiumPlans: "true",
      },
    });
    expect((content.hero as Record<string, string>).description).toBe("Intro with break");
    expect((content.pricing as Record<string, unknown>).plan3MonthsPrice).toBe("$19");
    expect((content.pricing as Record<string, unknown>).showPremiumPlans).toBe(true);
  });
});

describe("validateTranslationSavePayload", () => {
  it("allows save without GitHub sha", () => {
    expect(
      validateTranslationSavePayload({
        locale: "en",
        content: { pricing: { plan3MonthsPrice: "$10" } },
      })
    ).toBeNull();
  });

  it("rejects missing content", () => {
    expect(validateTranslationSavePayload({ locale: "en" })).toBe(
      "Missing translation content"
    );
  });
});
