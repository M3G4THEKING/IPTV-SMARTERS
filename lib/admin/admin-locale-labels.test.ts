import { describe, expect, it } from "vitest";
import {
  ADMIN_BLOG_LOCALE_LABELS,
  getBlogSlugPlaceholder,
} from "./admin-locale-labels";

describe("admin-locale-labels", () => {
  it("labels Canada and UK as English regional sites, not French", () => {
    expect(ADMIN_BLOG_LOCALE_LABELS.ca).toBe("English (Canada)");
    expect(ADMIN_BLOG_LOCALE_LABELS.uk).toBe("English (UK)");
    expect(ADMIN_BLOG_LOCALE_LABELS.ca).not.toContain("French");
    expect(ADMIN_BLOG_LOCALE_LABELS.uk).not.toContain("French");
  });

  it("uses English slug placeholders for ca and uk", () => {
    expect(getBlogSlugPlaceholder("ca")).toBe("best-iptv-canada");
    expect(getBlogSlugPlaceholder("uk")).toBe("best-iptv-uk");
    expect(getBlogSlugPlaceholder("fr")).toBe("mon-article-iptv");
  });
});
