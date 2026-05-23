"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { useLanguage } from "@/contexts/LanguageContext";
import { getContactEmailForLocale } from "@/lib/utils/contact-email";
import { getLocaleSurface } from "@/lib/i18n/locale-surface";

export default function CTASection() {
  const { t, locale } = useLanguage();
  const surface = getLocaleSurface(locale);
  const email = getContactEmailForLocale(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;
    setMousePosition({ x: xPos, y: yPos });
  };

  return (
    <section id="cta" className="pt-2 pb-12 lg:pb-16 xl:pb-20 2xl:pb-24 bg-white relative">
      <div className="max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          className={`relative overflow-hidden ${surface.ctaPanel}`}
        >
          {/* Mouse tracking gradient - kept as requested */}
          <motion.div
            className={`absolute inset-0 ${surface.cardRadius} pointer-events-none transition-opacity duration-500`}
            style={{
              opacity: isHovering ? 1 : 0,
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.06), transparent 60%)`,
            }}
          />

          <div className="relative z-10 text-center">
            {/* Heading */}
            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-[#1a1a1a] mb-3 xl:mb-4 2xl:mb-5 leading-tight font-heading tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span className="block">{t("cta.title")}</span>
              <span className="block mt-1.5">
                <span className="underline decoration-[#2563eb] decoration-3 underline-offset-4">{t("cta.title2")}</span>{" "}
                <span className="text-[#2563eb]">{t("cta.title3")}</span>
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-[#1a1a1a]/70 text-sm sm:text-base xl:text-lg 2xl:text-xl mb-7 xl:mb-8 2xl:mb-10 max-w-xl xl:max-w-2xl 2xl:max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              {t("cta.description")}
            </motion.p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* WhatsApp Button */}
              <motion.a
                href={getWhatsAppUrl(t("whatsapp.ctaSection"))}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 xl:gap-3 2xl:gap-4 px-7 xl:px-8 2xl:px-10 py-3.5 xl:py-4 2xl:py-5 bg-[#25D366] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#25D366]/30 transition-all duration-300 cursor-pointer text-sm sm:text-base xl:text-lg 2xl:text-xl"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{t("cta.whatsapp")}</span>
              </motion.a>

              {/* Email Button */}
              <motion.a
                href={`mailto:${email}`}
                className="group relative inline-flex items-center gap-2.5 xl:gap-3 2xl:gap-4 px-7 xl:px-8 2xl:px-10 py-3.5 xl:py-4 2xl:py-5 bg-white border-2 border-[#1a1a1a]/15 hover:border-[#2563eb] text-[#1a1a1a] hover:text-[#2563eb] font-semibold rounded-xl shadow-md hover:shadow-lg hover:shadow-[#2563eb]/20 transition-all duration-300 text-sm sm:text-base xl:text-lg 2xl:text-xl"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.25 }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-5 h-5" />
                <span>{t("cta.email")}</span>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
