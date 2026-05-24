import { describe, expect, it } from "vitest";
import {
  getLocaleCurrencyCode,
  isPremiumPlansSectionEnabled,
  normalizePricingSection,
} from "./pricing-display";

describe("isPremiumPlansSectionEnabled", () => {
  it("defaults to visible when unset", () => {
    expect(isPremiumPlansSectionEnabled(undefined)).toBe(true);
    expect(isPremiumPlansSectionEnabled({})).toBe(true);
  });

  it("respects false and string false", () => {
    expect(isPremiumPlansSectionEnabled({ showPremiumPlans: false })).toBe(false);
    expect(isPremiumPlansSectionEnabled({ showPremiumPlans: "false" })).toBe(false);
  });
});

describe("normalizePricingSection", () => {
  it("coerces showPremiumPlans to boolean and trims strings", () => {
    const result = normalizePricingSection({
      showPremiumPlans: "false",
      plan12MonthsPrice: "  79 $CA \n",
    });
    expect(result.showPremiumPlans).toBe(false);
    expect(result.plan12MonthsPrice).toBe("79 $CA");
  });
});

describe("getLocaleCurrencyCode", () => {
  it("uses admin override from translations", () => {
    expect(getLocaleCurrencyCode("ca", { currencyCode: "cad" })).toBe("CAD");
  });

  it("falls back to locale default", () => {
    expect(getLocaleCurrencyCode("ca", {})).toBe("CAD");
    expect(getLocaleCurrencyCode("uk", {})).toBe("GBP");
    expect(getLocaleCurrencyCode("en", {})).toBe("USD");
  });
});
