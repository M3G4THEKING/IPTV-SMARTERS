"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { isMobile, getImageQuality } from "@/lib/utils/performance";

// Image list - will be replaced with Sanity CMS data later
const carouselImages = [
  "/carouselle-shows/1876.webp",
  "/carouselle-shows/3f8e093cd2b2aa6993c1d936a154831c-1.webp",
  "/carouselle-shows/asteroid-city-movie-poster-7030.webp",
  "/carouselle-shows/bob-marley-one-love-movie-poster.webp",
  "/carouselle-shows/boxing-4679822_640-1.webp",
  "/carouselle-shows/dune-part-two-movie-poster.webp",
  "/carouselle-shows/FJdfCjyXsAEBxsP.jpg",
  "/carouselle-shows/furiosa-a-mad-max-saga-movie-poster.webp",
  "/carouselle-shows/gettyimages-2168236843-612x612-1.webp",
  "/carouselle-shows/gettyimages-2176226053-612x612-1.webp",
  "/carouselle-shows/ghostbusters-frozen-empire-movie-poster.webp",
  "/carouselle-shows/godzilla-x-kong-the-new-empire-movie-poster.webp",
  "/carouselle-shows/guardians-of-the-galaxy-vol-3-movie-poster.webp",
  "/carouselle-shows/gygy-1.webp",
  "/carouselle-shows/heuhe.webp",
  "/carouselle-shows/hjh-1.webp",
  "/carouselle-shows/jjf-1.webp",
  "/carouselle-shows/jkjnhbg.webp",
  "/carouselle-shows/kingdom-of-the-planet-of-the-apes-malaysian-movie-poster.webp",
  "/carouselle-shows/kung-fu-panda-4-chinese-movie-poster.webp",
  "/carouselle-shows/llk-1.webp",
  "/carouselle-shows/los-angeles-lakers-v-milwaukee-bucks-gary-dineen-1.webp",
  "/carouselle-shows/luciferver3xlgjpg-fe465d.jpg",
  "/carouselle-shows/M7SUK85sKjaStg4TKhlAVyGlz3-scaled-1.jpg",
  "/carouselle-shows/mean-girls-movie-poster.webp",
  "/carouselle-shows/motor-sports-excitement-formula-1-racing-car-high-speed-vertical-mobile-wallpaper_795881-32675.webp",
  "/carouselle-shows/MV5BM2EwMmRhMmUtMzBmMS00ZDQ3LTg4OGEtNjlkODk3ZTMxMmJlXkEyXkFqcGdeQXVyMjM5ODk1NDU@._V1_.jpg",
  "/carouselle-shows/MV5BNWYwNzhhNzMtMWM2Yi00NzdlLTgxNmUtYWI2YTdiNmFmNzQwXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg",
  "/carouselle-shows/no-hard-feelings-movie-poster.webp",
  "/carouselle-shows/p12022_p_v8_aa.jpg",
  "/carouselle-shows/p159678_p_v8_av.jpg",
  "/carouselle-shows/re.jpg",
  "/carouselle-shows/res.jpg",
  "/carouselle-shows/resurrection-movie-poster-6927.jpg",
  "/carouselle-shows/ruby-gillman-teenage-kraken-movie-poster.webp",
  "/carouselle-shows/s-l1200-1.webp",
  "/carouselle-shows/ssdcsd.jpg",
  "/carouselle-shows/stranger-things-movie-poster.webp",
  "/carouselle-shows/tgfrde.jpg",
  "/carouselle-shows/the_beekeeper-593721159-large.jpg",
  "/carouselle-shows/the-beekeeper-movie-poster.webp",
  "/carouselle-shows/the-fabelmans-movie-poster-6995.jpg",
  "/carouselle-shows/the-fall-guy-movie-poster.webp",
  "/carouselle-shows/the-garfield-movie-movie-poster.webp",
  "/carouselle-shows/the-queens-gambit-movie-poster.webp",
  "/carouselle-shows/the-witcher-movie-poster.webp",
  "/carouselle-shows/transformers-rise-of-the-beasts-movie-poster.webp",
  "/carouselle-shows/violent-night-movie-poster-6996.jpg",
  "/carouselle-shows/wednesday-movie-poster.webp",
  "/carouselle-shows/WhatsApp-Image-2023-04-27-at-23.15.37-3.jpg",
];

export default function ContentCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const imageQuality = getImageQuality();
  
  // Optimize scroll speed based on device
  const scrollSpeed = useRef(
    isMobile() ? 0.3 : 0.6 // Even slower on mobile for better performance
  );

  // Optimize: Use all images but limit initial render
  // Duplicate images for seamless infinite scroll
  const duplicatedImages = [...carouselImages, ...carouselImages];

  // Intersection Observer to pause animation when not visible
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(scrollContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Infinite scroll animation - Optimized for mobile performance
  useEffect(() => {
    if (!scrollContainerRef.current || isPaused || isDragging || !isInView) return;

    // Reduce animation frequency on mobile for better performance
    const mobile = isMobile();
    const frameSkip = mobile ? 3 : 1; // Skip more frames on mobile
    let frameCount = 0;

    const animate = () => {
      frameCount++;
      if (frameCount % frameSkip === 0 && scrollContainerRef.current && !isPaused && !isDragging && isInView) {
        scrollContainerRef.current.scrollLeft += scrollSpeed.current;
        
        // Reset scroll position for seamless loop
        if (scrollContainerRef.current.scrollLeft >= scrollContainerRef.current.scrollWidth / 2) {
          scrollContainerRef.current.scrollLeft = 0;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, isDragging, isInView]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setIsPaused(true);
    const rect = scrollContainerRef.current.getBoundingClientRect();
    setStartX(e.clientX - rect.left);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPaused(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setIsPaused(false);
  }, []);

  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    const rect = scrollContainerRef.current.getBoundingClientRect();
    setStartX(e.touches[0].clientX - rect.left);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsPaused(false);
  }, []);

  return (
    <section className="pt-12 pb-4 sm:pt-16 sm:pb-6 xl:pt-20 xl:pb-8 2xl:pt-24 2xl:pb-10 bg-white overflow-x-hidden">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full min-w-0">
        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Carousel */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-hidden scrollbar-hide cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => {
              if (!isDragging) setIsPaused(true);
            }}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            aria-label="Content carousel"
          >
            <div className="flex w-max">
              {duplicatedImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[240px] xl:w-[280px] 2xl:w-[320px]"
                >
                  <div className="relative w-full aspect-2/3 overflow-hidden bg-gray-100">
                    <Image
                      src={image}
                      alt={`Content ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, (max-width: 1280px) 240px, 280px"
                      className="object-cover"
                      quality={imageQuality}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
