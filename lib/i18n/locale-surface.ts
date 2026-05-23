import type { Locale } from "@/lib/i18n";

/** Subtle layout tokens so /ca/ differs slightly from /en/ (same brand, different surfaces). */
export type LocaleSurface = {
  cardRadius: string;
  btnRadius: string;
  planBadgeRadius: string;
  sectionSoftBg: string;
  faqWrapper: string;
  faqAnswerBorder: string;
  ctaPanel: string;
  blogCard: string;
  testimonialCard: string;
};

const defaultSurface: LocaleSurface = {
  cardRadius: "rounded-2xl",
  btnRadius: "rounded-lg",
  planBadgeRadius: "rounded-lg",
  sectionSoftBg: "",
  faqWrapper: "rounded-2xl shadow-lg border-2 border-[#e5e7eb]",
  faqAnswerBorder: "border-l-4 border-[#2563eb]",
  ctaPanel:
    "rounded-2xl bg-white border border-[#1a1a1a]/10 p-7 sm:p-8 lg:p-10 overflow-hidden shadow-sm",
  blogCard: "rounded-xl border border-gray-200",
  testimonialCard:
    "p-5 rounded-2xl border border-[#e5e7eb] bg-white/80 backdrop-blur-sm hover:border-[#2563eb]/30 shadow-sm",
};

const canadaSurface: LocaleSurface = {
  cardRadius: "rounded-3xl",
  btnRadius: "rounded-xl",
  planBadgeRadius: "rounded-full",
  sectionSoftBg: "bg-gradient-to-b from-slate-50/90 via-white to-white",
  faqWrapper: "rounded-3xl shadow-md border border-slate-200/90",
  faqAnswerBorder: "border-l-[3px] border-[#2563eb]/75",
  ctaPanel:
    "rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-white border border-[#2563eb]/15 p-7 sm:p-8 lg:p-10 overflow-hidden shadow-md",
  blogCard: "rounded-2xl border border-slate-200/90 shadow-sm",
  testimonialCard:
    "p-5 rounded-3xl border border-slate-200/80 bg-slate-50/40 backdrop-blur-sm hover:border-[#2563eb]/25 shadow-md",
};

export function getLocaleSurface(locale: Locale): LocaleSurface {
  return locale === "ca" ? canadaSurface : defaultSurface;
}
