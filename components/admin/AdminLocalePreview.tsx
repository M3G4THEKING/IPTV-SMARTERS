"use client";

type GetValue = (path: string) => string;
type GetBoolValue = (path: string, defaultValue?: boolean) => boolean;

type PreviewProps = {
  locale: string;
  getValue: GetValue;
  getBoolValue?: GetBoolValue;
};

const STANDARD_PLAN_KEYS = [
  { nameKey: "pricing.plan3Months", priceKey: "pricing.plan3MonthsPrice", popular: false },
  { nameKey: "pricing.plan6Months", priceKey: "pricing.plan6MonthsPrice", popular: false },
  { nameKey: "pricing.plan12Months", priceKey: "pricing.plan12MonthsPrice", popular: true },
  { nameKey: "pricing.plan24Months", priceKey: "pricing.plan24MonthsPrice", popular: false },
] as const;

const PREMIUM_PLAN_KEYS = [
  { nameKey: "pricing.plan3MonthsPremium", priceKey: "pricing.plan3MonthsPremiumPrice", popular: false },
  { nameKey: "pricing.plan6MonthsPremium", priceKey: "pricing.plan6MonthsPremiumPrice", popular: false },
  { nameKey: "pricing.plan12MonthsPremium", priceKey: "pricing.plan12MonthsPremiumPrice", popular: true },
  { nameKey: "pricing.plan24MonthsPremium", priceKey: "pricing.plan24MonthsPremiumPrice", popular: false },
] as const;

function PlanPreviewGrid({
  plans,
  getValue,
  variant,
}: {
  plans: readonly { nameKey: string; priceKey: string; popular: boolean }[];
  getValue: GetValue;
  variant: "standard" | "premium";
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {plans.map((plan) => {
        const name = getValue(plan.nameKey);
        const price = getValue(plan.priceKey);
        return (
          <div
            key={plan.priceKey}
            className={`border-2 rounded-xl p-4 ${
              plan.popular ? "border-blue-600 bg-blue-50 shadow-lg" : "border-gray-200 bg-white"
            }`}
          >
            {plan.popular ? (
              <div className="text-center mb-2">
                <span className="inline-block text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                  POPULAR
                </span>
              </div>
            ) : null}
            <h3 className="font-bold text-gray-900 mb-2 text-center text-sm sm:text-base">{name}</h3>
            <div className="text-center mb-3">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {price || "—"}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <p className="flex items-start gap-1.5">
                <span className="text-blue-600">✓</span>
                <span>{getValue("pricing.instantActivation")}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-blue-600">✓</span>
                <span>{getValue("pricing.liveChannels")}</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-blue-600">✓</span>
                <span>
                  {variant === "premium"
                    ? getValue("pricing.adultContent")
                    : getValue("pricing.quality")}
                </span>
              </p>
            </div>
            <button
              type="button"
              disabled
              className={`w-full mt-4 py-2 rounded-lg font-semibold text-sm ${
                plan.popular ? "bg-blue-600 text-white" : "bg-gray-900 text-white"
              }`}
            >
              {getValue("common.buyNow") || "Buy Now"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function AdminHeroPreview({ locale, getValue }: PreviewProps) {
  const isCa = locale === "ca";

  if (isCa) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">
          Homepage hero preview ({locale})
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563eb] mb-3">
          {getValue("hero.eyebrow")}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight mb-2 max-w-xl">
          {getValue("hero.title")}
        </h1>
        <p className="text-base font-medium text-neutral-600 mb-4 max-w-lg">
          {getValue("hero.subtitlePart1")}{" "}
          <span className="text-[#2563eb]">{getValue("hero.subtitlePart2")}</span>
        </p>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-lg mb-4">
          {getValue("hero.lead")}{" "}
          <span className="font-medium text-[#2563eb]">{getValue("hero.channelsLink")}</span>
          {getValue("hero.lead2")} {getValue("hero.lead3")} {getValue("hero.lead4")}{" "}
          {getValue("hero.lead5")}
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex px-5 py-2.5 bg-[#2563eb] text-white text-sm font-semibold rounded-lg">
            {getValue("hero.cta")}
          </span>
          <span className="text-xs text-neutral-500">{getValue("hero.ctaNote")}</span>
        </div>
        <p className="text-xs text-neutral-500 border-t border-neutral-100 pt-3 max-w-lg">
          Keyword row (iptv canada, iptv quebec, …) appears below the CTA on the live site.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">Homepage hero preview</p>
      <h1 className="text-3xl font-bold text-black mb-3">
        <span className="underline decoration-blue-600">{getValue("hero.title")}</span>
        <br />
        <span className="mt-2 block text-xl font-semibold">
          {getValue("hero.subtitlePart1")}{" "}
          <span className="text-blue-600">{getValue("hero.subtitlePart2")}</span>
        </span>
      </h1>
      <p className="text-gray-600 leading-relaxed text-sm">{getValue("hero.description")}</p>
    </div>
  );
}

export function AdminPricingPreview({
  locale,
  getValue,
  getBoolValue = () => true,
}: PreviewProps & { getBoolValue?: GetBoolValue }) {
  const showPremium = getBoolValue("pricing.showPremiumPlans", true);
  const subtitle = getValue("pricing.subtitle");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">
        Homepage pricing preview ({locale})
      </p>

      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-3">
          {getValue("pricing.title")}
        </h2>
        {subtitle ? (
          <p className="mx-auto max-w-3xl text-sm text-[#1a1a1a]/70">{subtitle}</p>
        ) : null}
      </div>

      <div className="mb-10">
        <div className="flex justify-center mb-6">
          <div className="relative px-6 py-2.5 rounded-lg border-[3px] border-gray-300 bg-gray-100">
            <div className="absolute inset-0 bg-[#2563eb] rounded-lg" />
            <span className="relative z-10 font-semibold text-sm text-white uppercase tracking-wide">
              {getValue("pricing.standardPlansLabel") || getValue("pricing.oneConnection")}
            </span>
          </div>
        </div>
        <PlanPreviewGrid plans={STANDARD_PLAN_KEYS} getValue={getValue} variant="standard" />
      </div>

      {showPremium ? (
        <div>
          <div className="flex justify-center mb-6">
            <div className="relative px-6 py-2.5 rounded-lg border-[3px] border-gray-300 bg-gray-100">
              <div className="absolute inset-0 bg-[#2563eb] rounded-lg" />
              <span className="relative z-10 font-semibold text-sm text-white uppercase tracking-wide">
                {getValue("pricing.premiumPlansLabel") ||
                  getValue("pricing.twoConnectionsPremium")}
              </span>
            </div>
          </div>
          <PlanPreviewGrid plans={PREMIUM_PLAN_KEYS} getValue={getValue} variant="premium" />
        </div>
      ) : (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Premium plans are hidden on the live site (toggle Show on website to display them).
        </p>
      )}
    </div>
  );
}
