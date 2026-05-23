"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { Monitor, Check } from "lucide-react";
import PricingCard from "@/components/PricingCard";
import { openWhatsApp } from "@/lib/whatsapp";
import { shouldReduceAnimations, isMobile, getImageQuality } from "@/lib/utils/performance";
import RelatedPagesStrip from "@/components/RelatedPagesStrip";
import SeoLinksPanel from "@/components/SeoLinksPanel";

const Footer = lazy(() => import("@/components/Footer"));
const FloatingWhatsAppButton = lazy(() => import("@/components/FloatingWhatsAppButton"));

const ComponentLoader = () => <div className="w-full h-32 bg-gray-50 animate-pulse rounded-lg" />;

export default function ResellerPage() {
  const { t, locale } = useLanguage();
  const reduceAnimations = shouldReduceAnimations();
  const mobile = isMobile();
  const imageQuality = getImageQuality();

  const handleScrollToPricing = () => {
    const element = document.querySelector("#pricing");
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const resellerPlans = [
    {
      name: t("reseller.credit10Title"),
      price: t("reseller.credit10Price"),
      period: "",
      features: [
        t("reseller.credit10Feature1"),
        t("reseller.credit10Feature2"),
        t("reseller.credit10Feature3"),
        t("reseller.credit10Feature4"),
        t("reseller.credit10Feature5"),
        t("reseller.credit10Feature6"),
      ],
    },
    {
      name: t("reseller.credit20Title"),
      price: t("reseller.credit20Price"),
      period: "",
      features: [
        t("reseller.credit20Feature1"),
        t("reseller.credit20Feature2"),
        t("reseller.credit20Feature3"),
        t("reseller.credit20Feature4"),
        t("reseller.credit20Feature5"),
        t("reseller.credit20Feature6"),
      ],
      popular: true,
    },
    {
      name: t("reseller.credit30Title"),
      price: t("reseller.credit30Price"),
      period: "",
      features: [
        t("reseller.credit30Feature1"),
        t("reseller.credit30Feature2"),
        t("reseller.credit30Feature3"),
        t("reseller.credit30Feature4"),
        t("reseller.credit30Feature5"),
        t("reseller.credit30Feature6"),
      ],
    },
  ];

  const whyFeatures = [
    t("reseller.whyFeature1"),
    t("reseller.whyFeature2"),
    t("reseller.whyFeature3"),
    t("reseller.whyFeature4"),
    t("reseller.whyFeature5"),
    t("reseller.whyFeature6"),
    t("reseller.whyFeature7"),
    t("reseller.whyFeature8"),
  ];

  const benefits = [
    t("reseller.benefit1"),
    t("reseller.benefit2"),
    t("reseller.benefit3"),
    t("reseller.benefit4"),
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-16 sm:pt-20 pb-10 sm:pb-14">
        {/* Hero Section */}
        <section className="relative max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-8 sm:mb-10">
          {/* Blue background accent */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-48 sm:h-64 bg-gradient-to-b from-[#2563eb]/8 via-[#2563eb]/4 to-transparent blur-3xl"></div>
          </div>
          
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={reduceAnimations ? {} : { duration: 0.5 }}
            className="text-center space-y-4 sm:space-y-5 py-6 sm:py-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl mx-auto px-2">
              {(() => {
                const title = t("reseller.heroTitle");
                const parts = title.split(/(IPTV)/g);
                return (
                  <>
                    {parts.map((part, i) => 
                      part === "IPTV" ? (
                        <span key={i} className="text-[#2563eb]">IPTV</span>
                      ) : (
                        <span key={i} className="text-[#1a1a1a]">{part}</span>
                      )
                    )}
                  </>
                );
              })()}
            </h1>
            <motion.p
              initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={reduceAnimations ? {} : { duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-base md:text-lg text-[#1a1a1a]/70 max-w-2xl mx-auto leading-relaxed px-2"
            >
              {t("reseller.heroSubtitle")}
            </motion.p>
            <motion.div
              initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 10 }}
              animate={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={reduceAnimations ? {} : { duration: 0.5, delay: 0.2 }}
              className="pt-1 sm:pt-2"
            >
              <motion.button
                onClick={handleScrollToPricing}
                whileHover={reduceAnimations ? {} : { scale: 1.02 }}
                whileTap={reduceAnimations ? {} : { scale: 0.98 }}
                className="inline-flex items-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#2563eb] text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-[#1d4ed8] transition-all duration-200 text-sm sm:text-base cursor-pointer group"
              >
                <span>{t("reseller.heroButton")}</span>
                <Monitor className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* Pricing Section Intro */}
        <section id="pricing" className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-12">
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.4 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-[#1a1a1a]">
              {t("reseller.pricingSectionTitle")}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#1a1a1a]/70 max-w-3xl mx-auto leading-relaxed mb-3">
              {t("reseller.pricingSectionDescription")}
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-[#1a1a1a]/70 max-w-3xl mx-auto leading-relaxed">
              {t("reseller.pricingSectionDescription2")}
            </p>
          </motion.div>

          {/* Compatible Devices Image */}
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.4, delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-0">
              <Image
                src="/reseller/Compatible-iptv-devices-systems.webp"
                alt="Compatible IPTV devices and systems"
                width={1200}
                height={675}
                className="w-full h-auto object-contain"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                quality={imageQuality}
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Why Become Reseller Section */}
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.4, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-3 sm:mb-4 text-center px-2">
              {t("reseller.whyTitle")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {whyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, x: -10 }}
                  whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={reduceAnimations ? {} : { duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Check className="w-4 h-4 text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm md:text-base text-[#1a1a1a]/80 leading-relaxed">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.4, delay: 0.3 }}
            className="mb-6 sm:mb-8"
          >
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#1a1a1a] mb-2 sm:mb-3 text-center px-2">
              {t("reseller.pricingTitle")}
            </h3>
            {t("reseller.pricingCurrencyNote") &&
            !t("reseller.pricingCurrencyNote").startsWith("reseller.") ? (
              <p className="text-center text-sm text-[#1a1a1a]/70 font-medium mb-4 sm:mb-6 px-2">
                {t("reseller.pricingCurrencyNote")}
              </p>
            ) : (
              <div className="mb-4 sm:mb-6" />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {resellerPlans.map((plan, index) => (
                <PricingCard
                  key={index}
                  name={plan.name}
                  price={plan.price}
                  period={plan.period}
                  features={plan.features}
                  popular={plan.popular}
                  delay={index * 0.05}
                  guaranteeText={t("reseller.guarantee")}
                  buttonText={t("reseller.buyNow")}
                />
              ))}
            </div>
          </motion.div>
        </section>

        {/* Service Quality Section */}
        <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-8 sm:mb-10">
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.4 }}
            className="text-center space-y-3 sm:space-y-4 bg-gradient-to-br from-[#2563eb]/5 to-transparent rounded-xl p-5 sm:p-6 lg:p-8 border border-[#2563eb]/10"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#1a1a1a]">
              {t("reseller.serviceTitle")}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#1a1a1a]/70 max-w-2xl mx-auto leading-relaxed px-2">
              {t("reseller.serviceDescription")}
            </p>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-8 sm:mb-10">
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.4 }}
            className="text-center space-y-3 sm:space-y-4"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#1a1a1a] px-2">
              {t("reseller.ctaTitle")}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#1a1a1a]/70 max-w-3xl mx-auto leading-relaxed px-2">
              {t("reseller.ctaDescription")}
            </p>
            <motion.button
              onClick={() => {
                openWhatsApp(t("whatsapp.resellerInterest"));
              }}
              whileHover={reduceAnimations ? {} : { scale: 1.02 }}
              whileTap={reduceAnimations ? {} : { scale: 0.98 }}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#2563eb] text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:bg-[#1d4ed8] transition-all duration-200 text-sm sm:text-base cursor-pointer group"
            >
              <span>{t("reseller.heroButton")}</span>
              <Monitor className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </section>

        <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-8 sm:mb-10">
          <RelatedPagesStrip showTitle className="p-4 sm:p-6 rounded-xl border border-gray-100 bg-gray-50/80" />
          <SeoLinksPanel variant="reseller" className="mt-4" />
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mb-8 sm:mb-10">
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.4 }}
            className="space-y-3 sm:space-y-4"
          >
            <p className="text-sm sm:text-base lg:text-lg text-[#1a1a1a]/70 max-w-4xl mx-auto leading-relaxed text-center px-2">
              {t("reseller.benefitsTitle")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, x: -10 }}
                  whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={reduceAnimations ? {} : { duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-2 sm:gap-2.5 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Check className="w-4 h-4 text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm md:text-base text-[#1a1a1a]/80 leading-relaxed">
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      <Suspense fallback={<ComponentLoader />}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingWhatsAppButton />
      </Suspense>
    </div>
  );
}
