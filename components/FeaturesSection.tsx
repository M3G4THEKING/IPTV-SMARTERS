"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Tv,
  Video,
  Film,
  Zap,
  Server,
  Headphones,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { shouldReduceAnimations, isMobile, getImageQuality } from "@/lib/utils/performance";
import { getLocaleSurface } from "@/lib/i18n/locale-surface";

interface Feature {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

export default function FeaturesSection() {
  const { t, locale } = useLanguage();
  const surface = getLocaleSurface(locale);
  const reduceAnimations = shouldReduceAnimations();
  const mobile = isMobile();
  const imageQuality = getImageQuality();
  
  const features: Feature[] = [
    {
      id: "premium-channels",
      icon: <Tv className="w-12 h-12 sm:w-14 sm:h-14" strokeWidth={1.5} />,
      titleKey: "features.premiumChannels.title",
      descriptionKey: "features.premiumChannels.description",
    },
    {
      id: "vod-movies",
      icon: <Video className="w-14 h-14 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      titleKey: "features.vodMovies.title",
      descriptionKey: "features.vodMovies.description",
    },
    {
      id: "vod-series",
      icon: <Film className="w-14 h-14 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      titleKey: "features.vodSeries.title",
      descriptionKey: "features.vodSeries.description",
    },
    {
      id: "anti-freezing",
      icon: <Zap className="w-14 h-14 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      titleKey: "features.antiFreezing.title",
      descriptionKey: "features.antiFreezing.description",
    },
    {
      id: "availability",
      icon: <Server className="w-14 h-14 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      titleKey: "features.availability.title",
      descriptionKey: "features.availability.description",
    },
    {
      id: "support",
      icon: <Headphones className="w-14 h-14 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      titleKey: "features.support.title",
      descriptionKey: "features.support.description",
    },
  ];

  const featureItems =
    locale === "ca" || locale === "uk" ? [...features].reverse() : features;

  return (
    <section
      id="features"
      className={`pt-12 pb-6 sm:pt-16 sm:pb-8 lg:pt-20 lg:pb-10 xl:pt-24 xl:pb-12 2xl:pt-28 2xl:pb-16 ${surface.sectionSoftBg || "bg-white"}`}
    >
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Section Heading - Simple h2 for accessibility */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-center mb-4 xl:mb-6 2xl:mb-8 text-[#1a1a1a] font-heading">
          {t("features.sectionTitle") || t("common.features")}
        </h2>
        {t("features.sectionSubtitle") ? (
          <p className="text-center text-base sm:text-lg text-[#1a1a1a]/70 max-w-3xl mx-auto mb-12 xl:mb-16 2xl:mb-20">
            {t("features.sectionSubtitle")}
          </p>
        ) : (
          <div className="mb-12 xl:mb-16 2xl:mb-20" />
        )}
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-12 lg:gap-16 xl:gap-20 2xl:gap-24 min-w-0">
          {featureItems.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
              transition={reduceAnimations ? {} : {
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              className="bg-white flex flex-col items-center text-center px-4"
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-6 text-[#2563eb]">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold mb-5 xl:mb-6 2xl:mb-8 text-[#1a1a1a] text-xl sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl tracking-tight">
                {t(feature.titleKey)}
              </h3>

              {/* Description */}
              <p className="text-[#1a1a1a]/75 leading-relaxed text-base sm:text-lg lg:text-lg xl:text-xl 2xl:text-2xl max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto font-bold">
                {t(feature.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Image */}
        <motion.div
          initial={reduceAnimations ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={reduceAnimations ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: mobile ? "-50px" : "-100px" }}
          transition={reduceAnimations ? {} : { duration: 0.3, delay: 0.2 }}
          className="mt-8 lg:mt-10 flex justify-center"
        >
          <div className="relative w-full max-w-3xl xl:max-w-4xl 2xl:max-w-5xl h-auto">
            <Image
              src="/images/trust.png-1536x61.webp"
              alt="Trust badges and certifications"
              width={1536}
              height={61}
              className="w-full h-auto object-contain"
              quality={imageQuality}
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

