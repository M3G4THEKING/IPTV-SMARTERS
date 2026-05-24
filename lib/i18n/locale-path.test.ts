import { describe, expect, it } from "vitest";
import {
  buildLocalizedPath,
  fixDuplicateLocalePath,
  getLocaleFromPathname,
  stripLocalePrefix,
} from "./locale-path";

describe("locale-path", () => {
  it("reads uk from pathname", () => {
    expect(getLocaleFromPathname("/uk/")).toBe("uk");
    expect(getLocaleFromPathname("/uk/blog/test/")).toBe("uk");
  });

  it("strips uk locale prefix", () => {
    expect(stripLocalePrefix("/uk/")).toBe("/");
    expect(stripLocalePrefix("/uk/blog/my-post/")).toBe("/blog/my-post");
  });

  it("strips stacked locale prefixes", () => {
    expect(stripLocalePrefix("/ca/uk/")).toBe("/");
    expect(stripLocalePrefix("/ca/uk/blog/post/")).toBe("/blog/post");
  });

  it("builds localized paths", () => {
    expect(buildLocalizedPath("ca", "/uk/")).toBe("/ca/");
    expect(buildLocalizedPath("en", "/blog/foo")).toBe("/en/blog/foo/");
  });

  it("fixes duplicate locale URLs", () => {
    expect(fixDuplicateLocalePath("/ca/uk/")).toBe("/uk/");
    expect(fixDuplicateLocalePath("/en/ca/blog/slug/")).toBe("/ca/blog/slug/");
  });
});
