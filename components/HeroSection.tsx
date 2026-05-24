"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { isMobile } from "@/lib/utils/performance";
import {
  OFFICIAL_IBO_PLAYER_URL,
  OFFICIAL_IPTV_SMARTERS_DOWNLOADS_URL,
} from "@/lib/constants/official-player-links";
import { isRegionalEnglishLocale } from "@/lib/i18n/regional-locales";
import { DefaultHeroDescription } from "@/components/hero/DefaultHeroDescription";
import { normalizeInlineHeroText } from "@/lib/i18n/normalize-hero-text";

function HeroImage({
  mobile,
  className = "",
}: {
  mobile: boolean;
  className?: string;
}) {
  const variantClass =
    "aspect-[16/10] max-h-[175px] sm:max-h-[220px] md:max-h-[250px] lg:aspect-[16/10] lg:max-h-[min(340px,46vh)] xl:max-h-[min(380px,50vh)]";

  return (
    <div className={`relative w-full ${variantClass} ${className}`}>
      <Image
        src="/images/hero.png"
        alt="IPTV on TV, laptop, tablet and phone"
        fill
        className="object-contain object-top lg:object-center"
        priority={!mobile}
        fetchPriority={mobile ? "low" : "high"}
        sizes="(max-width: 1024px) 90vw, 40vw"
        quality={mobile ? 24 : 50}
        loading={mobile ? "lazy" : "eager"}
        decoding="async"
      />
    </div>
  );
}

function RegionalHeroContent({
  onViewPlans,
}: {
  onViewPlans: (e: { preventDefault: () => void }) => void;
}) {
  const { t } = useLanguage();

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
        {t("hero.eyebrow")}
      </p>

      <h1 className="text-2xl sm:text-3xl md:text-[1.85rem] lg:text-[2.1rem] xl:text-[2.65rem] font-bold leading-[1.12] text-[#1a1a1a] font-heading tracking-tight max-w-xl">
        <span className="block">{t("hero.title")}</span>
        <span className="block mt-1 sm:mt-1.5 text-[0.95em] sm:text-[1em] font-semibold text-neutral-600">
          {t("hero.subtitlePart1")}{" "}
          <span className="text-[#2563eb]">{t("hero.subtitlePart2")}</span>
        </span>
      </h1>

      <p className="text-sm sm:text-base text-[#1a1a1a]/80 leading-relaxed max-w-xl">
        {normalizeInlineHeroText(t("hero.lead"))}{" "}
        <a href="#pricing" className="font-medium text-[#2563eb] hover:underline">
          {normalizeInlineHeroText(t("hero.channelsLink"))}
        </a>
        {normalizeInlineHeroText(t("hero.lead2"))}{" "}
        <a
          href={OFFICIAL_IPTV_SMARTERS_DOWNLOADS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#2563eb] hover:underline"
        >
          {normalizeInlineHeroText(t("hero.officialSmartersLinkText"))}
        </a>
        {normalizeInlineHeroText(t("hero.lead3"))}{" "}
        <a
          href={OFFICIAL_IBO_PLAYER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#2563eb] hover:underline"
        >
          {normalizeInlineHeroText(t("hero.officialIboLinkText"))}
        </a>
        {normalizeInlineHeroText(t("hero.lead4"))}{" "}
        <a href="#features" className="font-medium text-[#2563eb] hover:underline">
          {normalizeInlineHeroText(t("hero.m3uLink"))}
        </a>
        {normalizeInlineHeroText(t("hero.lead5"))}
      </p>

      <div className="pt-0.5 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
        <a
          href="#pricing"
          onClick={onViewPlans}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#2563eb] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1d4ed8] transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
        >
          {t("hero.cta")}
          <ArrowRight className="w-4 h-4 shrink-0" />
        </a>
        <span className="text-xs sm:text-sm text-neutral-500">{t("hero.ctaNote")}</span>
      </div>
    </>
  );
}

export default function HeroSection() {
  const { t, locale } = useLanguage();
  const mobile = typeof window !== "undefined" ? isMobile() : false;
  const isRegional = isRegionalEnglishLocale(locale);

  const scrollToPricing = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const element = document.querySelector("#pricing");
    if (element) {
      const headerHeight = 80;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  if (isRegional) {
    return (
      <section
        id="home"
        className="relative overflow-hidden bg-white pt-20 pb-4 sm:pt-[5.25rem] sm:pb-5 lg:pt-20 lg:pb-6"
      >
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,44%)] xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,42%)] gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 items-start lg:items-center">
            <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-3.5 min-w-0 text-left lg:py-1">
              <div className="lg:hidden w-full max-w-[min(100%,22rem)] sm:max-w-md md:max-w-lg mx-auto">
                <HeroImage mobile={mobile} />
              </div>
              <RegionalHeroContent onViewPlans={scrollToPricing} />
            </div>

            <div className="hidden lg:flex min-w-0 items-center justify-center self-center">
              <div className="w-full max-w-[min(100%,28rem)] xl:max-w-[30rem]">
                <HeroImage mobile={mobile} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white pt-20 pb-4 sm:pt-[5.25rem] sm:pb-5 lg:pt-20 lg:pb-6"
    >
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,44%)] xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,42%)] gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 items-start lg:items-center">
          <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-3.5 min-w-0 text-center lg:text-left lg:py-1">
            <h1 className="text-2xl sm:text-3xl md:text-[1.85rem] lg:text-[2.1rem] xl:text-[2.65rem] font-bold leading-[1.12] text-[#1a1a1a] font-heading tracking-tight">
              <span className="block underline decoration-[#2563eb] decoration-2 underline-offset-3">
                {t("hero.title")}
              </span>
              <span className="block mt-1 sm:mt-1.5 text-[0.95em] sm:text-[1em]">
                {t("hero.subtitlePart1")}{" "}
                <span className="text-[#2563eb]">{t("hero.subtitlePart2")}</span>
              </span>
            </h1>

            <div className="lg:hidden w-full max-w-[min(100%,22rem)] sm:max-w-md md:max-w-lg mx-auto -mt-0.5">
              <HeroImage mobile={mobile} />
            </div>

            <div className="w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none text-left">
              <DefaultHeroDescription />
            </div>

            <div className="pt-0.5 flex justify-center lg:justify-start">
              <a
                href="#pricing"
                onClick={scrollToPricing}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#2563eb] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1d4ed8] transition-all duration-200 text-sm sm:text-base group w-full sm:w-auto max-w-md lg:max-w-none cursor-pointer"
              >
                <span className="whitespace-nowrap">{t("common.viewOffers")}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </a>
            </div>
          </div>

          <div className="hidden lg:flex min-w-0 items-center justify-center self-center">
            <div className="w-full max-w-[min(100%,28rem)] xl:max-w-[30rem]">
              <HeroImage mobile={mobile} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
