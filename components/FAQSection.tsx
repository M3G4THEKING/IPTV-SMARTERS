"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocaleSurface } from "@/lib/i18n/locale-surface";

interface FAQItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

const faqData: FAQItem[] = [
  {
    id: "payment-methods",
    questionKey: "faq.paymentMethods.question",
    answerKey: "faq.paymentMethods.answer",
  },
  {
    id: "two-devices",
    questionKey: "faq.twoDevices.question",
    answerKey: "faq.twoDevices.answer",
  },
  {
    id: "bandwidth",
    questionKey: "faq.bandwidth.question",
    answerKey: "faq.bandwidth.answer",
  },
  {
    id: "devices-supported",
    questionKey: "faq.devicesSupported.question",
    answerKey: "faq.devicesSupported.answer",
  },
  {
    id: "satellite",
    questionKey: "faq.satellite.question",
    answerKey: "faq.satellite.answer",
  },
  {
    id: "advantages",
    questionKey: "faq.advantages.question",
    answerKey: "faq.advantages.answer",
  },
  {
    id: "fundamentals",
    questionKey: "faq.fundamentals.question",
    answerKey: "faq.fundamentals.answer",
  },
  {
    id: "what-is-iptv",
    questionKey: "faq.whatIsIptv.question",
    answerKey: "faq.whatIsIptv.answer",
  },
  {
    id: "support-response",
    questionKey: "faq.supportResponse.question",
    answerKey: "faq.supportResponse.answer",
  },
  {
    id: "smart-tv-channels",
    questionKey: "faq.smartTvChannels.question",
    answerKey: "faq.smartTvChannels.answer",
  },
  {
    id: "vlc-siptrv",
    questionKey: "faq.vlcSiptrv.question",
    answerKey: "faq.vlcSiptrv.answer",
  },
  {
    id: "android-tv-box",
    questionKey: "faq.androidTvBox.question",
    answerKey: "faq.androidTvBox.answer",
  },
  {
    id: "wifi-ethernet",
    questionKey: "faq.wifiEthernet.question",
    answerKey: "faq.wifiEthernet.answer",
  },
  {
    id: "android-tv-box-install",
    questionKey: "faq.androidTvBoxInstall.question",
    answerKey: "faq.androidTvBoxInstall.answer",
  },
  {
    id: "free-trial",
    questionKey: "faq.freeTrial.question",
    answerKey: "faq.freeTrial.answer",
  },
];

export default function FAQSection() {
  const { t, locale } = useLanguage();
  const surface = getLocaleSurface(locale);
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <section
      id="faq"
      className={`pt-0 pb-0 xl:pt-4 2xl:pt-6 ${locale === "ca" ? "bg-slate-50/30" : "bg-white"}`}
    >
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-center mb-12 xl:mb-16 2xl:mb-20 text-[#1a1a1a] font-heading"
        >
          {t("faq.title")}
        </motion.h2>

        {/* FAQ Accordion */}
        <div className={`bg-white overflow-hidden ${surface.faqWrapper}`}>
          {faqData.map((faq, index) => {
            const isOpen = openIndices.has(index);

            return (
              <div
                key={faq.id}
                className={`border-b-2 border-[#e5e7eb] last:border-b-0 ${
                  isOpen ? "bg-[#2563eb]/5" : ""
                } transition-all duration-300`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleItem(index)}
                  className={`w-full py-4 xl:py-5 2xl:py-6 px-6 xl:px-8 2xl:px-10 text-left flex items-center justify-between gap-4 xl:gap-6 2xl:gap-8 transition-all duration-300 cursor-pointer ${
                    isOpen 
                      ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]" 
                      : "bg-white hover:bg-[#2563eb]/10"
                  }`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <h3 className={`text-sm sm:text-base xl:text-lg 2xl:text-xl font-semibold font-heading pr-4 flex-1 ${
                    isOpen ? "text-white" : "text-[#1a1a1a]"
                  }`}>
                    {t(faq.questionKey)}
                  </h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${
                      isOpen ? "text-white" : "text-[#2563eb]"
                    }`} />
                  </motion.div>
                </button>

                {/* Answer Content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden bg-gradient-to-b from-white to-[#f8fafc]"
                    >
                      <div
                        className={`px-6 xl:px-8 2xl:px-10 py-5 xl:py-6 2xl:py-8 bg-white/50 ${surface.faqAnswerBorder}`}
                      >
                        <p className="text-[#1a1a1a]/80 leading-relaxed text-sm sm:text-base xl:text-lg 2xl:text-xl">
                          {t(faq.answerKey)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

