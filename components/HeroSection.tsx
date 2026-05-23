"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { isMobile } from "@/lib/utils/performance";
import {
  OFFICIAL_IBO_PLAYER_URL,
  OFFICIAL_IPTV_SMARTERS_DOWNLOADS_URL,
} from "@/lib/constants/official-player-links";
import { PRIORITY_CANADA_KEYWORDS } from "@/lib/seo/canada-hub";

function HeroImage({
  mobile,
  variant = "default",
  className = "",
}: {
  mobile: boolean;
  variant?: "default" | "canadaSticky";
  className?: string;
}) {
  const variantClass =
    variant === "canadaSticky"
      ? "aspect-[4/3] sm:aspect-[3/2] max-h-[230px] sm:max-h-[275px] lg:max-h-[min(400px,70vh)] lg:aspect-[5/4] xl:aspect-[4/3] lg:min-h-[280px]"
      : "aspect-[16/10] max-h-[175px] sm:max-h-[220px] md:max-h-[250px] lg:aspect-[16/10] lg:max-h-[min(340px,46vh)] xl:max-h-[min(380px,50vh)]";

  const objectPosition =
    variant === "canadaSticky"
      ? "object-center"
      : "object-contain object-top lg:object-center";

  return (
    <div className={`relative w-full ${variantClass} ${className}`}>
      <Image
        src="/images/hero.png"
        alt="IPTV on TV, laptop, tablet and phone"
        fill
        className={objectPosition}
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

function DefaultHeroDescription() {
  const { t } = useLanguage();

  return (
    <div className="text-sm sm:text-base text-[#1a1a1a]/80 leading-relaxed space-y-2.5 text-left">
      <p>
        {t("hero.description")}{" "}
        <a href="#pricing" className="text-[#2563eb] hover:underline font-medium">
          {t("hero.channelsLink")}
        </a>
        {t("hero.description2")}{" "}
        <span className="font-medium text-[#1a1a1a]/90">
          <a
            href={OFFICIAL_IPTV_SMARTERS_DOWNLOADS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563eb] hover:underline"
          >
            {t("hero.officialSmartersLinkText")}
          </a>
          {", "}
          <a
            href={OFFICIAL_IBO_PLAYER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563eb] hover:underline"
          >
            {t("hero.officialIboLinkText")}
          </a>
        </span>
      </p>
      <p>
        {t("hero.description3")}{" "}
        <a href="#features" className="text-[#2563eb] hover:underline font-medium">
          {t("hero.m3uLink")}
        </a>
        {t("hero.description4")}{" "}
        <span className="font-semibold text-[#1a1a1a]">{t("hero.freeTest")}</span>{" "}
        {t("hero.description5")}
      </p>
    </div>
  );
}

function CanadaHeroKeywords() {
  return (
    <p
      className="text-xs sm:text-sm leading-relaxed text-neutral-500 break-words"
      aria-label="IPTV Canada search topics"
    >
      {PRIORITY_CANADA_KEYWORDS.map((kw, index) => (
        <span key={kw}>
          {index > 0 ? <span className="text-neutral-300"> · </span> : null}
          <a href="#pricing" className="hover:text-neutral-700 hover:underline underline-offset-2">
            {kw}
          </a>
        </span>
      ))}
    </p>
  );
}

function CanadaHeroContent({
  onViewPlans,
}: {
  onViewPlans: (e: { preventDefault: () => void }) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="relative z-10 flex flex-col gap-5 sm:gap-6 min-w-0 w-full text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
        {t("hero.eyebrow")}
      </p>

      <div className="space-y-2.5 sm:space-y-3">
        <h1 className="text-[1.75rem] sm:text-4xl lg:text-[2.65rem] xl:text-[3rem] font-bold text-neutral-900 leading-[1.12] tracking-tight max-w-xl">
          {t("hero.title")}
        </h1>
        <p className="text-base sm:text-lg lg:text-xl font-medium text-neutral-600 leading-snug max-w-lg">
          {t("hero.subtitlePart1")}{" "}
          <span className="text-[#2563eb]">{t("hero.subtitlePart2")}</span>
        </p>
      </div>

      <p className="text-[0.9375rem] sm:text-base text-neutral-600 leading-relaxed max-w-lg">
        {t("hero.lead")}{" "}
        <a href="#pricing" className="font-medium text-[#2563eb] hover:underline">
          {t("hero.channelsLink")}
        </a>
        {t("hero.lead2")}{" "}
        <a
          href={OFFICIAL_IPTV_SMARTERS_DOWNLOADS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#2563eb] hover:underline"
        >
          {t("hero.officialSmartersLinkText")}
        </a>
        {t("hero.lead3")}{" "}
        <a
          href={OFFICIAL_IBO_PLAYER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#2563eb] hover:underline"
        >
          {t("hero.officialIboLinkText")}
        </a>
        {t("hero.lead4")}{" "}
        <a href="#features" className="font-medium text-[#2563eb] hover:underline">
          {t("hero.m3uLink")}
        </a>
        {t("hero.lead5")}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-0.5">
        <a
          href="#pricing"
          onClick={onViewPlans}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2563eb] text-white font-semibold rounded-lg hover:bg-[#1d4ed8] transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          {t("hero.cta")}
          <ArrowRight className="w-4 h-4 shrink-0" />
        </a>
        <span className="text-xs sm:text-sm text-neutral-500">{t("hero.ctaNote")}</span>
      </div>

      <div className="pt-4 mt-1 border-t border-neutral-100 max-w-lg">
        <CanadaHeroKeywords />
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { t, locale } = useLanguage();
  const mobile = typeof window !== "undefined" ? isMobile() : false;
  const isCa = locale === "ca";

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

  if (isCa) {
    return (
      <section
        id="home"
        className="relative overflow-visible bg-gradient-to-b from-slate-50/70 via-white to-white pt-20 pb-8 sm:pt-24 lg:pt-20 lg:pb-12"
      >
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_48%] lg:gap-x-12 xl:gap-x-14 lg:items-center">
            <div className="min-w-0">
              <div className="lg:hidden mb-6 max-w-md mx-auto sm:max-w-xl">
                <HeroImage mobile={mobile} variant="canadaSticky" />
              </div>
              <CanadaHeroContent onViewPlans={scrollToPricing} />
            </div>

            <div className="hidden lg:flex min-w-0 items-center justify-center self-center py-6">
              <div className="w-full scale-[1.15] origin-center">
                <HeroImage mobile={mobile} variant="canadaSticky" />
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
      className="relative bg-white pt-20 pb-4 sm:pt-[5.25rem] sm:pb-5 lg:pt-20 lg:pb-6"
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
