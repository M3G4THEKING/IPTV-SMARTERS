"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInstallationUrl } from "@/lib/utils/installation-slugs";

export default function Header() {
  const { t, locale } = useLanguage();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopInstallationOpen, setIsDesktopInstallationOpen] =
    useState(false);
  const [isMobileInstallationOpen, setIsMobileInstallationOpen] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Check if we're on the home page
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      
      // Always show header on mobile or at the top
      if (isMobile || currentScrollY < 50) {
        setIsVisible(true);
        setIsScrolled(currentScrollY > 10);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide when scrolling down, show when scrolling up (desktop only)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 10);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDesktopInstallationOpen(false);
      }
    };

    if (isDesktopInstallationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopInstallationOpen]);

  // Installation dropdown links (5 options: "How to install?" first, then 4 device-specific options)
  // Use language-specific URLs for installation pages
  const installationLinks = [
    { href: getInstallationUrl('iptv-installation-guide', locale), label: t("installation.howToInstall") },
    { href: getInstallationUrl('iptv-installation-ios', locale), label: t("installation.appleIos") },
    { href: getInstallationUrl('iptv-installation-smart-tv', locale), label: t("installation.smartTv") },
    { href: getInstallationUrl('iptv-installation-windows', locale), label: t("installation.windows") },
    {
      href: getInstallationUrl('iptv-installation-firestick', locale),
      label: t("installation.firestickAndroid"),
    },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Close mobile menu
    setIsMobileMenuOpen(false);
    
    // If we're not on the home page, navigate to home page with hash
    if (!isHomePage) {
      const homeUrl = `/${locale}${href}`;
      // Use window.location for static export compatibility
      window.location.href = homeUrl;
      return;
    }
    
    // If we're on the home page, just scroll to the element
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      // Use requestAnimationFrame for smoother scroll
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        });
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full max-w-[100vw] overflow-x-clip transition-transform duration-300 ease-in-out ${
        isScrolled ? "bg-white shadow-md" : "bg-white"
      } ${isVisible ? "translate-y-0" : "lg:-translate-y-full"}`}
    >
      <nav
        className="max-w-[1280px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a
            href={`/${locale}`}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/${locale}`;
            }}
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Logo - slightly bigger on desktop without changing header height */}
            <div className="relative h-10 sm:h-11 w-auto">
              <Image
                src="/logo/IPTVSMARTERSNL-LOGO.png"
                alt="IPTV Logo"
                width={135}
                height={36}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
            {/* Home */}
            <motion.a
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              className="relative font-medium text-[#1a1a1a]/80 hover:text-[#2563eb] transition-colors duration-200 group"
            >
              {t("common.home")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
            </motion.a>

            {/* Pricing */}
            <motion.a
              href="#pricing"
              onClick={(e) => handleNavClick(e, "#pricing")}
              className="relative font-medium text-[#1a1a1a]/80 hover:text-[#2563eb] transition-colors duration-200 group"
            >
              {t("common.pricing")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
            </motion.a>

            {/* Installation Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setIsDesktopInstallationOpen(true)}
              onMouseLeave={() => setIsDesktopInstallationOpen(false)}
            >
              <motion.button
                onClick={() =>
                  setIsDesktopInstallationOpen((prev) => !prev)
                }
                className="relative font-medium text-[#1a1a1a]/80 hover:text-[#2563eb] transition-colors duration-200 group flex items-center gap-1 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                {t("common.installation")}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDesktopInstallationOpen ? "rotate-180" : ""
                  }`}
                />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDesktopInstallationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 mt-3 w-60 rounded-xl bg-black text-white shadow-2xl border border-white/10 py-3 z-50"
                  >
                    {installationLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsDesktopInstallationOpen(false)}
                        className="block px-5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors duration-150 cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* IPTV Reseller */}
            <motion.a
              href={getInstallationUrl('iptv-reseller-program', locale)}
              className="relative font-medium text-[#1a1a1a]/80 hover:text-[#2563eb] transition-colors duration-200 group"
            >
              {t("common.iptvReseller")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
            </motion.a>

            {/* Blog */}
            <motion.a
              href={`/${locale}/blog`}
              className="relative font-medium text-[#1a1a1a]/80 hover:text-[#2563eb] transition-colors duration-200 group"
            >
              {t("common.blog")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
            </motion.a>

            {/* FAQ */}
            <motion.a
              href="#faq"
              onClick={(e) => handleNavClick(e, "#faq")}
              className="relative font-medium text-[#1a1a1a]/80 hover:text-[#2563eb] transition-colors duration-200 group"
            >
              {t("common.faq")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
            </motion.a>

            {/* Contact (Blue color) */}
            <motion.a
              href="#cta"
              onClick={(e) => handleNavClick(e, "#cta")}
              className="relative font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-200 group"
            >
              {t("common.contactUs")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full" />
            </motion.a>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden lg:block">
            <motion.button
              onClick={() => {
                if (!isHomePage) {
                  const homeUrl = `/${locale}#pricing`;
                  window.location.href = homeUrl;
                  return;
                }
                
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
              }}
              className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] shadow-md hover:shadow-lg hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all duration-150 cursor-pointer border border-white/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("common.getIptvNow")}
            </motion.button>
          </div>

          {/* Mobile Hamburger Button */}
          <motion.button
            className="md:hidden relative w-8 h-8 flex items-center justify-center z-50 cursor-pointer"
            onClick={() => {
              const next = !isMobileMenuOpen;
              setIsMobileMenuOpen(next);
              if (!next) {
                setIsMobileInstallationOpen(false);
              }
            }}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-6 h-5">
              {/* Top line */}
              <motion.span
                className="absolute top-0 left-0 w-full h-0.5 bg-[#1a1a1a] rounded-full origin-center"
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 10 : 0,
                  scale: isMobileMenuOpen ? 1.1 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.5,
                }}
              />
              {/* Middle line */}
              <motion.span
                className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1a1a1a] rounded-full -translate-y-1/2 origin-center"
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  scaleX: isMobileMenuOpen ? 0 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
              {/* Bottom line */}
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a1a1a] rounded-full origin-center"
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -10 : 0,
                  scale: isMobileMenuOpen ? 1.1 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.5,
                }}
              />
            </div>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className="overflow-hidden bg-white md:hidden shadow-lg border-b border-[#e5e7eb]"
          >
            <div className="max-w-[1280px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
              <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                {/* Home */}
                <motion.a
                  href="#home"
                  onClick={(e) => handleNavClick(e, "#home")}
                  className="text-base font-medium text-[#1a1a1a] hover:text-[#2563eb] py-3 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  {t("common.home")}
                </motion.a>

                {/* Pricing */}
                <motion.a
                  href="#pricing"
                  onClick={(e) => handleNavClick(e, "#pricing")}
                  className="text-base font-medium text-[#1a1a1a] hover:text-[#2563eb] py-3 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.14, duration: 0.2 }}
                >
                  {t("common.pricing")}
                </motion.a>

                {/* Installation Dropdown */}
                <div>
                  <motion.button
                    onClick={() =>
                      setIsMobileInstallationOpen((prev) => !prev)
                    }
                    className="w-full text-base font-medium text-[#1a1a1a] hover:text-[#2563eb] py-3 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200 flex items-center justify-between cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18, duration: 0.2 }}
                  >
                    <span>{t("common.installation")}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isMobileInstallationOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>
                  <AnimatePresence>
                    {isMobileInstallationOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-4"
                      >
                        {installationLinks.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            onClick={() => {
                              setIsMobileInstallationOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                            className="block text-sm text-[#1a1a1a]/80 hover:text-[#2563eb] py-2 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200"
                          >
                            {link.label}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* IPTV Reseller */}
                <motion.a
                  href={getInstallationUrl('iptv-reseller-program', locale)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-[#1a1a1a] hover:text-[#2563eb] py-3 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22, duration: 0.2 }}
                >
                  {t("common.iptvReseller")}
                </motion.a>

                {/* Blog */}
                <motion.a
                  href={`/${locale}/blog`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-medium text-[#1a1a1a] hover:text-[#2563eb] py-3 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.26, duration: 0.2 }}
                >
                  {t("common.blog")}
                </motion.a>

                {/* FAQ */}
                <motion.a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, "#faq")}
                  className="text-base font-medium text-[#1a1a1a] hover:text-[#2563eb] py-3 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                >
                  {t("common.faq")}
                </motion.a>

                {/* Contact (Blue color) */}
                <motion.a
                  href="#cta"
                  onClick={(e) => handleNavClick(e, "#cta")}
                  className="text-base font-medium text-[#2563eb] hover:text-[#1d4ed8] py-3 px-4 rounded-lg hover:bg-[#f5f5f5] transition-all duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.34, duration: 0.2 }}
                >
                  {t("common.contactUs")}
                </motion.a>

                {/* Mobile CTA Button */}
                <motion.button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    
                    if (!isHomePage) {
                      const homeUrl = `/${locale}#pricing`;
                      window.location.href = homeUrl;
                      return;
                    }
                    
                    const element = document.querySelector("#pricing");
                    if (element) {
                      const headerHeight = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                      
                      // Use requestAnimationFrame for smoother scroll (minimal delay)
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth",
                          });
                        });
                      });
                    }
                  }}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-md hover:shadow-lg hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all duration-150 cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.38, duration: 0.2 }}
                >
                  {t("common.getIptvNow")}
                </motion.button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
