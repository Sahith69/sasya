// src/components/OpeningAnimation.jsx - Minimal Hackathon Opening Splash
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

export default function OpeningAnimation({ onFinish }) {
  const { lang, t } = useAuth();
  const containerRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const iconRef = useRef(null);
  const lineRef = useRef(null);

  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (skipped) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            y: -20,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: onFinish
          });
        }
      });

      // 1. Initial Icon Pop
      tl.fromTo(iconRef.current, 
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.7)" }
      )
      // 2. "Hello Farmer" Fade Up
      .fromTo(text1Ref.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.1"
      )
      // 3. Subtle Pause then "Welcome to Sasya"
      .fromTo(text2Ref.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
        "+=0.2"
      )
      // 4. Clean minimal green progress line expands
      .fromTo(lineRef.current,
        { width: "0%" },
        { width: "100%", duration: 0.5, ease: "power1.inOut" },
        "-=0.3"
      )
      // 5. Brief hold (0.4s) before transition
      .to({}, { duration: 0.4 });

    }, containerRef);

    return () => ctx.revert();
  }, [onFinish, skipped]);

  const handleSkip = () => {
    setSkipped(true);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: onFinish
      });
    } else {
      onFinish();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F9F9F6] text-[#275637] select-none px-6"
    >
      {/* Corner Skip for Fast Pitch */}
      <button 
        onClick={handleSkip}
        className="absolute top-6 right-6 text-xs font-semibold text-[#556B5C] hover:text-[#275637] px-3 py-1.5 rounded-full border border-[#D8E5DA] bg-white transition-colors"
      >
        {t('skip_intro')}
      </button>

      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Minimal Botanical Symbol */}
        <div ref={iconRef} className="w-14 h-14 mb-4 rounded-2xl bg-[#E8F2EA] border border-[#91BA94] flex items-center justify-center text-2xl shadow-sm">
          🌱
        </div>

        {/* Text 1: Hello Farmer */}
        <h2 
          ref={text1Ref} 
          className="text-xl sm:text-2xl font-bold tracking-tight text-[#275637] mb-1"
        >
          {t('welcome_farmer')}
        </h2>

        {/* Text 2: Welcome to Sasya */}
        <h1 
          ref={text2Ref} 
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E462B] mb-4"
        >
          {t('welcome_sub')}
        </h1>

        {/* Minimalist Progress Line */}
        <div className="w-40 h-1 bg-[#E8F0E9] rounded-full overflow-hidden mt-2">
          <div ref={lineRef} className="h-full bg-[#275637] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
