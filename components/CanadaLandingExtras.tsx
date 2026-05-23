"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Canada-only blocks inspired by Canadian IPTV landing patterns (stats + setup steps).
 */
export default function CanadaLandingExtras() {
  const { locale, t } = useLanguage();
  if (locale !== "ca") return null;

  const stats = [
    { value: t("canadaLanding.stat1Value"), label: t("canadaLanding.stat1Label") },
    { value: t("canadaLanding.stat2Value"), label: t("canadaLanding.stat2Label") },
    { value: t("canadaLanding.stat3Value"), label: t("canadaLanding.stat3Label") },
    { value: t("canadaLanding.stat4Value"), label: t("canadaLanding.stat4Label") },
  ];

  const steps = [
    {
      n: "1",
      title: t("canadaLanding.step1Title"),
      body: t("canadaLanding.step1Body"),
    },
    {
      n: "2",
      title: t("canadaLanding.step2Title"),
      body: t("canadaLanding.step2Body"),
    },
    {
      n: "3",
      title: t("canadaLanding.step3Title"),
      body: t("canadaLanding.step3Body"),
    },
  ];

  return (
    <>
      <section
        aria-label="IPTV Canada service highlights"
        className="border-y border-gray-100 bg-gradient-to-b from-gray-50/50 to-white py-10 sm:py-12"
      >
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-[#2563eb] mb-6">
            {t("canadaLanding.statsEyebrow")}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a]">
                  {item.value}
                </p>
                <p className="mt-1 text-sm sm:text-base text-[#1a1a1a]/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#2563eb] mb-2">
              {t("canadaLanding.stepsEyebrow")}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a]">
              {t("canadaLanding.stepsTitle")}
            </h2>
            <p className="mt-3 text-[#1a1a1a]/70 text-sm sm:text-base">
              {t("canadaLanding.stepsSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step) => (
              <div
                key={step.n}
                className="rounded-3xl border border-slate-200/90 bg-slate-50/60 p-6 sm:p-8 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white font-bold text-lg">
                  {step.n}
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#1a1a1a]">{step.title}</h3>
                <p className="mt-2 text-sm sm:text-base text-[#1a1a1a]/75 leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors shadow-md"
            >
              {t("canadaLanding.ctaPlans")}
            </Link>
            <Link
              href="#cta"
              className="inline-flex items-center rounded-xl border border-[#2563eb]/30 bg-white px-6 py-3 text-sm font-semibold text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-colors"
            >
              {t("canadaLanding.ctaTrial")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
