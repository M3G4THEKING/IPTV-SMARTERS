"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Monitor, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CanadaLandingExtras from "@/components/CanadaLandingExtras";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPremiumPlansSectionEnabled } from "@/lib/i18n/pricing-display";
import { openWhatsApp } from "@/lib/whatsapp";
import { shouldReduceAnimations, isMobile } from "@/lib/utils/performance";
import { getBlogUrl, isBlogAvailableInLocale } from "@/lib/utils/blog-slugs";
import type { BlogPost } from "@/lib/admin/blog-shared";
import { getLocaleSurface } from "@/lib/i18n/locale-surface";

// Lazy load non-critical components - use dynamic imports with ssr: false for better performance
const ContentCarousel = lazy(() => import("@/components/ContentCarousel"));
const LogoCarousel = lazy(() => import("@/components/LogoCarousel"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const DeviceCarousel = lazy(() => import("@/components/DeviceCarousel"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Footer = lazy(() => import("@/components/Footer"));
const PricingCard = lazy(() => import("@/components/PricingCard"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FloatingWhatsAppButton = lazy(() => import("@/components/FloatingWhatsAppButton"));
const CTASection = lazy(() => import("@/components/CTASection"));

// Loading placeholder component
const ComponentLoader = () => (
  <div className="w-full h-64 bg-gray-50 animate-pulse rounded-lg" />
);

export default function Home() {
  const { t, locale, translations } = useLanguage();
  const pricingContent = translations.pricing as Record<string, string | boolean> | undefined;
  const showPremiumPlans = isPremiumPlansSectionEnabled(pricingContent);
  const pricingSubtitle =
    typeof pricingContent?.subtitle === "string" ? pricingContent.subtitle : "";
  const isCanadaHome = locale === "ca";
  const surface = getLocaleSurface(locale);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([]);

  // Detect mobile and defer non-critical resources
  useEffect(() => {
    const mobile = isMobile();
    setIsMobileDevice(mobile);
    setReduceAnimations(shouldReduceAnimations());
    
    // Note: ScrollToTop component handles hash navigation on route changes
    // This only handles initial page load without hash (scroll to top)
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo(0, 0);
    }
    
    // On mobile, defer loading of heavy components
    if (isMobileDevice) {
      // Use requestIdleCallback to defer non-critical work
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Trigger lazy loading of below-fold components
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                // Component will load when needed
              }
            });
          }, { rootMargin: '200px' });
          
          // Observe sections that are below the fold
          setTimeout(() => {
            document.querySelectorAll('section').forEach(section => {
              if (section.offsetTop > window.innerHeight) {
                observer.observe(section);
              }
            });
          }, 100);
        }, { timeout: 2000 });
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BlogPost[]) => {
        if (!Array.isArray(data)) {
          setLatestBlogs([]);
          return;
        }
        const available = data
          .filter((blog) => isBlogAvailableInLocale(blog, locale))
          .sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          )
          .slice(0, 3);
        setLatestBlogs(available);
      })
      .catch(() => setLatestBlogs([]));
  }, [locale]);

  const pricingPlans = [
    {
      name: t("pricing.plan3Months"),
      price: t("pricing.plan3MonthsPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
      ],
    },
    {
      name: t("pricing.plan6Months"),
      price: t("pricing.plan6MonthsPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
      ],
    },
    {
      name: t("pricing.plan12Months"),
      price: t("pricing.plan12MonthsPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
      ],
      popular: true,
    },
    {
      name: t("pricing.plan24Months"),
      price: t("pricing.plan24MonthsPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
      ],
    },
  ];


  // Channel logos
  const channelLogos = [
    "/carouselle-channels/abc-tv-logo-Copy.webp",
    "/carouselle-channels/ae-tv-logo-1.png",
    "/carouselle-channels/AMC-tv-logo.webp",
    "/carouselle-channels/cbs-tv-logo.png",
    "/carouselle-channels/discovery-channel-tv-logo.png",
    "/carouselle-channels/fox-tv-logo.png",
    "/carouselle-channels/hbo-tv-logo.webp",
    "/carouselle-channels/history-tv-logo.png",
    "/carouselle-channels/national-geographic-tv-logo.png",
    "/carouselle-channels/nbc-tv-logo.png",
    "/carouselle-channels/tnt-tv-logo.png",
    "/carouselle-channels/usa-network-logo.webp",
  ];

  // Streaming service logos
  const streamingLogos = [
    "/carouselle-streaming/580b57fcd9996e24bc43c529-300x169-min-1.png",
    "/carouselle-streaming/Bein_sport_logo-1024x595-1-min-300x174-2.png",
    "/carouselle-streaming/canal-logo-png-transparent-385x385-1-e1677705689705-min-300x149-2.webp",
    "/carouselle-streaming/FOX_Sports_logo.svg-1024x606-min-300x178-2.png",
    "/carouselle-streaming/HBO-Max-Logo-768x432-2-min-300x169-2.png",
    "/carouselle-streaming/pngegg-2-e1677705730772-min-300x155-2.png",
    "/carouselle-streaming/sky-sports-logo-png-8-768x432-1-min-300x169-2.png",
  ];

  // Premium plans
  const premiumPlans = [
    {
      name: t("pricing.plan3MonthsPremium"),
      price: t("pricing.plan3MonthsPremiumPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
      ],
    },
    {
      name: t("pricing.plan6MonthsPremium"),
      price: t("pricing.plan6MonthsPremiumPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
      ],
    },
    {
      name: t("pricing.plan12MonthsPremium"),
      price: t("pricing.plan12MonthsPremiumPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.adultContent"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
        t("pricing.freeMonth"),
      ],
      popular: true,
    },
    {
      name: t("pricing.plan24MonthsPremium"),
      price: t("pricing.plan24MonthsPremiumPrice"),
      period: "",
      features: [
        t("pricing.instantActivation"),
        t("pricing.freeUpdates"),
        t("pricing.liveChannels"),
        t("pricing.moviesSeries"),
        t("pricing.adultContent"),
        t("pricing.antiFreezing"),
        t("pricing.quality"),
        t("pricing.fastStable"),
        t("pricing.formats"),
        t("pricing.compatible"),
        t("pricing.serverAvailable"),
        t("pricing.support"),
        t("pricing.freeMonths"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CanadaLandingExtras />
      <ContentCarousel />
      <LogoCarousel images={channelLogos} size="large" direction="right" speed={0.4} />
      <LogoCarousel images={streamingLogos} direction="left" speed={0.7} />
      <FeaturesSection />
      <DeviceCarousel />

      <div className="flex flex-col">
      {/* Latest from blog - drive traffic to blog and main pages */}
      <section
        id="latest-blog"
        className={`py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50/50 ${isCanadaHome ? "order-2" : ""}`}
      >
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-3">
              {t("home.latestFromBlog")}
            </h2>
            <p className="text-base sm:text-lg text-[#1a1a1a]/70 max-w-xl mx-auto">
              {t("home.latestFromBlogSubtitle")}
            </p>
          </motion.div>
          {latestBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {latestBlogs.map((blog, index) => {
                const displayTitle = (blog.title[locale] || "").trim() || "Untitled";
                const displayExcerpt = (blog.excerpt[locale] || "").trim();
                return (
                  <motion.div
                    key={blog.id}
                    initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
                    whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={getBlogUrl(blog, locale)}
                      className={`group block h-full bg-white p-5 sm:p-6 hover:border-[#2563eb]/30 hover:shadow-lg transition-all duration-300 ${surface.blogCard}`}
                    >
                      {blog.featuredImage && !blog.featuredImage.startsWith("blob:") && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-gray-100">
                          <Image
                            src={blog.featuredImage}
                            alt={displayTitle}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-[#2563eb] transition-colors line-clamp-2">
                        {displayTitle}
                      </h3>
                      <p className="text-sm text-[#1a1a1a]/70 line-clamp-2 mb-4">{displayExcerpt}</p>
                      <span className="inline-flex items-center gap-2 text-[#2563eb] font-medium text-sm group-hover:gap-3 transition-all">
                        {t("blog.readMore")}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#1a1a1a]/60 text-sm">{t("blog.noPosts")}</p>
            </div>
          )}
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link
              href={`/${locale}/blog/`}
              className={`inline-flex items-center gap-2 px-6 py-3 ${isCanadaHome ? "rounded-xl" : "rounded-full"} bg-[#2563eb] text-white font-semibold text-sm hover:bg-[#1d4ed8] transition-colors shadow-md hover:shadow-lg`}
            >
              {t("home.viewAllArticles")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className={`pt-8 pb-0 sm:pt-12 sm:pb-0 lg:pt-16 lg:pb-0 xl:pt-20 xl:pb-0 bg-white ${isCanadaHome ? "order-1" : ""}`}
      >
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: isMobileDevice ? "-50px" : "-100px" }}
            transition={reduceAnimations ? {} : { duration: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 xl:mb-6 2xl:mb-8 text-[#1a1a1a]">
              {t("pricing.title")}
            </h2>
            {pricingSubtitle ? (
              <p className="mx-auto max-w-3xl text-sm sm:text-base text-[#1a1a1a]/70 mb-6">
                {pricingSubtitle}
              </p>
            ) : null}
          </motion.div>

          {/* 1 Connection Plans */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.3 }}
              className="flex justify-center mb-8"
            >
              <div
                className={`relative px-6 py-2.5 border-[3px] border-gray-300 bg-gray-100 ${surface.planBadgeRadius}`}
              >
                <div className={`absolute inset-0 bg-[#2563eb] ${surface.planBadgeRadius}`}></div>
                <span className="relative z-10 font-semibold text-base text-white uppercase tracking-wide">
                  {t("pricing.standardPlansLabel") || t("pricing.oneConnection")}
                </span>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6 xl:gap-8 2xl:gap-10">
              {pricingPlans.map((plan, index) => (
                <Suspense key={index} fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
                  <PricingCard
                    name={plan.name}
                    price={plan.price}
                    period={plan.period}
                    features={plan.features}
                    popular={plan.popular}
                    delay={index * 0.05}
                  />
                </Suspense>
              ))}
            </div>
          </div>

          {/* 2 Connections + Premium Plans */}
          {showPremiumPlans ? (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.3 }}
                className="flex justify-center mb-8"
              >
                <div
                  className={`relative px-6 py-2.5 border-[3px] border-gray-300 bg-gray-100 ${surface.planBadgeRadius}`}
                >
                  <div className={`absolute inset-0 bg-[#2563eb] ${surface.planBadgeRadius}`}></div>
                  <span className="relative z-10 font-semibold text-base text-white uppercase tracking-wide">
                    {t("pricing.premiumPlansLabel") || t("pricing.twoConnectionsPremium")}
                  </span>
                </div>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6 xl:gap-8 2xl:gap-10">
                {premiumPlans.map((plan, index) => (
                  <Suspense key={index} fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg" />}>
                    <PricingCard
                      name={plan.name}
                      price={plan.price}
                      period={plan.period}
                      features={plan.features}
                      popular={plan.popular}
                      delay={index * 0.05}
                    />
                  </Suspense>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      </div>

      {/* Payment Methods Section */}
      <section id="payment-methods" className="pt-2 pb-0 bg-white">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-[304px] h-auto">
              <Image
                src="/images/Methode-de-paiment.webp"
                alt="Payment methods accepted"
                width={1536}
                height={61}
                className="w-full h-auto object-contain"
                quality={75}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials">
        <Suspense fallback={<ComponentLoader />}>
          <TestimonialsSection />
        </Suspense>
      </section>

      {/* Channels Section */}
      <section id="channels" className="pt-2 pb-12 lg:pt-4 lg:pb-16 xl:pt-6 xl:pb-20 2xl:pt-8 2xl:pb-24 bg-white">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-8"
          >
            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-[#1a1a1a]">
              {t("common.channelsWorldwide")}
            </h2>

            {/* Image */}
            <div className="flex justify-center py-4 xl:py-6 2xl:py-8">
              <div className="relative w-full max-w-2xl xl:max-w-4xl 2xl:max-w-5xl h-auto">
                <Image
                  src="/asset-6.png"
                  alt="Worldwide channels coverage"
                  width={1200}
                  height={600}
                  className="w-full h-auto object-contain"
                  quality={75}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Text */}
            <p className="text-lg sm:text-xl xl:text-2xl 2xl:text-3xl text-[#1a1a1a]/70 max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto font-bold">
              {t("common.joinCustomers")}
            </p>

            {/* Button */}
            <div className="pt-1">
              <motion.button
                onClick={() => {
                  openWhatsApp(t("whatsapp.homePage"));
                }}
                whileHover={{ 
                  scale: 1.03,
                  y: -2
                }}
                whileTap={{ scale: 0.97 }}
                className={`bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg hover:shadow-xl hover:ring-2 hover:ring-[#2563eb]/30 py-3 xl:py-4 2xl:py-5 px-8 xl:px-10 2xl:px-12 ${surface.btnRadius} font-semibold text-base sm:text-lg xl:text-xl 2xl:text-2xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group mx-auto`}
              >
                <span>{t("common.buyNow")}</span>
                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<ComponentLoader />}>
        <FAQSection />
      </Suspense>
      <Suspense fallback={<ComponentLoader />}>
        <CTASection />
      </Suspense>
      <Suspense fallback={<ComponentLoader />}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingWhatsAppButton />
      </Suspense>
    </div>
  );
}
