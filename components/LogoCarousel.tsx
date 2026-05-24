"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { isMobile, getImageQuality } from "@/lib/utils/performance";

interface LogoCarouselProps {
  images: string[];
  size?: "default" | "large";
  direction?: "left" | "right";
  speed?: number;
}

export default function LogoCarousel({ images, size = "default", direction = "left", speed = 0.5 }: LogoCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const imageQuality = getImageQuality();
  const mobile = isMobile();
  const scrollSpeed = useRef(mobile ? speed * 0.5 : speed); // Slower on mobile
  const scrollDirection = direction === "right" ? -1 : 1;

  // Duplicate images for seamless infinite scroll
  const duplicatedImages = [...images, ...images];

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

  // Initialize scroll position for reverse direction
  useEffect(() => {
    if (scrollContainerRef.current && direction === "right") {
      // Start from the middle for reverse scrolling
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth / 2;
    }
  }, [direction]);

  // Infinite scroll animation
  useEffect(() => {
    if (!scrollContainerRef.current || isPaused || isDragging || !isInView) return;

    const frameSkip = mobile ? 2 : 1; // Skip frames on mobile
    let frameCount = 0;

    const animate = () => {
      frameCount++;
      if (frameCount % frameSkip === 0 && scrollContainerRef.current && !isPaused && !isDragging && isInView) {
        scrollContainerRef.current.scrollLeft += scrollSpeed.current * scrollDirection;
        
        // Reset scroll position for seamless loop (handle both directions)
        if (scrollDirection === 1) {
          // Moving left (normal)
          if (scrollContainerRef.current.scrollLeft >= scrollContainerRef.current.scrollWidth / 2) {
            scrollContainerRef.current.scrollLeft = 0;
          }
        } else {
          // Moving right (reverse)
          if (scrollContainerRef.current.scrollLeft <= 0) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth / 2;
          }
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
  }, [isPaused, isDragging, isInView, mobile, scrollDirection]);

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
    const walk = (x - startX) * 2;
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

  const heightClass = size === "large" 
    ? "h-[90px] sm:h-[110px] md:h-[130px] lg:h-[150px] xl:h-[170px] 2xl:h-[190px]" 
    : "h-[60px] sm:h-[70px] md:h-[80px] lg:h-[90px] xl:h-[100px] 2xl:h-[110px]";
  
  const widthClass = size === "large"
    ? "w-[180px] sm:w-[200px] md:w-[220px] lg:w-[250px] xl:w-[280px] 2xl:w-[300px]"
    : "w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px] 2xl:w-[240px]";

  return (
    <section className="py-0 xl:py-2 2xl:py-4 bg-white overflow-x-hidden">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full min-w-0">
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
            aria-label="Logo carousel"
          >
            <div className="flex w-max items-center">
              {duplicatedImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`shrink-0 ${widthClass}`}
                >
                  <div className={`relative w-full ${heightClass} overflow-hidden bg-white flex items-center justify-center`}>
                    <Image
                      src={image}
                      alt={`Logo ${index + 1}`}
                      fill
                      sizes={size === "large" 
                        ? "(max-width: 640px) 180px, (max-width: 768px) 200px, (max-width: 1024px) 220px, (max-width: 1280px) 250px, (max-width: 1536px) 280px, 300px"
                        : "(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, (max-width: 1280px) 200px, (max-width: 1536px) 220px, 240px"}
                      className="object-contain"
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

