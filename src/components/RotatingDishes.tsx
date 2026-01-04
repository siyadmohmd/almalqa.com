'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dishes = [
  { src: '/images/menu/madghut-chicken.jpg', alt: 'Madghut Chicken', nameEn: 'Madghut Chicken', nameAr: 'دجاج مضغوط' },
  { src: '/images/menu/amber-chicken.jpg', alt: 'Amber Chicken', nameEn: 'Amber Chicken', nameAr: 'دجاج أمبار' },
  { src: '/images/menu/madghut-lamb.jpg', alt: 'Madghut Lamb', nameEn: 'Madghut Lamb', nameAr: 'لحم مضغوط' },
  { src: '/images/menu/amber-meat.jpg', alt: 'Amber Meat', nameEn: 'Amber Meat', nameAr: 'لحم أمبار' },
  { src: '/images/menu/madghut-hashi.jpg', alt: 'Madghut Hashi', nameEn: 'Madghut Hashi', nameAr: 'مضغوط هاشي' },
];

export default function RotatingDishes() {
  const [currentDish, setCurrentDish] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollCooldown = useRef(false);
  const touchStartY = useRef(0);
  const autoRotateTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate dishes every 6 seconds if user doesn't scroll
  const resetAutoRotate = useCallback(() => {
    if (autoRotateTimer.current) {
      clearInterval(autoRotateTimer.current);
    }
    autoRotateTimer.current = setInterval(() => {
      setCurrentDish((prev) => (prev + 1) % dishes.length);
    }, 6000);
  }, []);

  useEffect(() => {
    resetAutoRotate();
    return () => {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current);
      }
    };
  }, [resetAutoRotate]);

  const handleScrollEvent = useCallback((deltaY: number) => {
    if (scrollCooldown.current) return;
    
    // Reset auto-rotate timer on user interaction
    resetAutoRotate();
    
    scrollCooldown.current = true;
    setTimeout(() => {
      scrollCooldown.current = false;
    }, 400);

    if (deltaY > 0) {
      if (currentDish < dishes.length - 1) {
        setCurrentDish(prev => prev + 1);
      } else {
        setIsLocked(false);
      }
    } else {
      if (currentDish > 0) {
        setCurrentDish(prev => prev - 1);
      }
    }
  }, [currentDish, resetAutoRotate]);

  useEffect(() => {
    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    const handleWheel = (e: WheelEvent) => {
      const rect = heroSection.getBoundingClientRect();
      const isInHero = rect.top <= 0 && rect.bottom > window.innerHeight * 0.5;
      
      if (window.scrollY < 100 || isInHero) {
        if (isLocked || (currentDish < dishes.length - 1 && e.deltaY > 0)) {
          e.preventDefault();
          handleScrollEvent(e.deltaY);
        }
      }
      
      if (e.deltaY < 0 && window.scrollY < window.innerHeight && !isLocked) {
        if (currentDish === dishes.length - 1) {
          setIsLocked(true);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = heroSection.getBoundingClientRect();
      const isInHero = rect.top <= 0 && rect.bottom > window.innerHeight * 0.5;
      
      if (window.scrollY < 100 || isInHero) {
        const deltaY = touchStartY.current - e.touches[0].clientY;
        if (Math.abs(deltaY) > 30) {
          if (isLocked || (currentDish < dishes.length - 1 && deltaY > 0)) {
            e.preventDefault();
            handleScrollEvent(deltaY);
            touchStartY.current = e.touches[0].clientY;
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentDish, isLocked, handleScrollEvent]);

  useEffect(() => {
    if (window.scrollY < 100) {
      setCurrentDish(0);
      setIsLocked(true);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative h-[550px] md:h-[650px] lg:h-[750px] flex items-center justify-center">
      {/* Progress Indicators */}
      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        {dishes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentDish(idx);
              resetAutoRotate();
            }}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              idx === currentDish 
                ? 'bg-maroon scale-125' 
                : idx < currentDish 
                  ? 'bg-carrot/60' 
                  : 'bg-licorice/30 hover:bg-licorice/50'
            }`}
            aria-label={`View dish ${idx + 1}`}
          />
        ))}
      </div>

      {/* Main Dish Display with Floating Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDish}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Floating/Jumping Animation Container */}
          <motion.div
            className="relative w-80 md:w-[26rem] lg:w-[32rem]"
            animate={{ y: [0, -20, 0] }}
            transition={{ 
              duration: 3, 
              ease: 'easeInOut', 
              repeat: Infinity 
            }}
          >
            <img
              src={dishes[currentDish].src}
              alt={dishes[currentDish].alt}
              className="w-full aspect-square object-cover rounded-3xl shadow-2xl"
            />
            {/* Glow effect */}
            <div className="absolute -inset-6 bg-gradient-to-r from-carrot/20 via-maroon/20 to-carrot/20 rounded-3xl blur-2xl -z-10" />
            {/* Shadow that moves with float */}
            <motion.div 
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-licorice/25 rounded-full blur-xl"
              animate={{ scale: [1, 0.85, 1], opacity: [0.25, 0.15, 0.25] }}
              transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Dish name label - positioned below the floating area */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`name-${currentDish}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-heading text-licorice/80 text-base md:text-lg">
              {dishes[currentDish].nameEn}
            </h3>
            <p className="font-arabic text-maroon/70 text-sm" dir="rtl">
              {dishes[currentDish].nameAr}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative Background Circle */}
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <motion.div 
          className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-carrot/15 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
        />
      </div>

      {/* Scroll hint - at the very bottom with proper spacing */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-licorice/50 text-sm flex flex-col items-center gap-0.5">
        <span className="text-xs">{currentDish + 1} / {dishes.length}</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="flex items-center gap-1"
        >
          <span className="text-xs">Scroll</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
