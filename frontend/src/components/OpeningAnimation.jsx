// src/components/OpeningAnimation.jsx - Minimal Kinetic Typography Opening Animation
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

export default function OpeningAnimation({ onFinish }) {
  const { t } = useAuth();
  const containerRef = useRef(null);
  const phrase1Ref = useRef(null);
  const phrase2Ref = useRef(null);
  const iconRef = useRef(null);
  const [skipped, setSkipped] = useState(false);

  const phrase1Text = "Hello Farmer";
  const phrase2Text = "Welcome to Sasya";

  useEffect(() => {
    if (skipped) return;

    const ctx = gsap.context(() => {
      const p1Chars = phrase1Ref.current.querySelectorAll('.char');
      const p2Chars = phrase2Ref.current.querySelectorAll('.char');

      // Initial setup
      gsap.set(p1Chars, { y: 45, opacity: 0, rotateX: -30 });
      gsap.set(p2Chars, { y: 45, opacity: 0, rotateX: -30 });
      gsap.set(phrase2Ref.current, { display: 'none', opacity: 0 });
      gsap.set(iconRef.current, { scale: 0, opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            y: -15,
            duration: 0.35,
            ease: "power2.inOut",
            onComplete: onFinish
          });
        }
      });

      // ── Sequence 1: "Hello Farmer" Letters Cascading In ────────────────────
      tl.to(p1Chars, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.45,
        stagger: 0.03,
        ease: "back.out(1.4)"
      })
      // Subtle float wave across the letters
      .to(p1Chars, {
        y: -4,
        duration: 0.25,
        stagger: {
          each: 0.02,
          yoyo: true,
          repeat: 1
        },
        ease: "sine.inOut"
      }, "+=0.1")
      // Letters glide up & exit
      .to(p1Chars, {
        y: -35,
        opacity: 0,
        duration: 0.25,
        stagger: 0.015,
        ease: "power2.in"
      }, "+=0.2")

      // ── Sequence 2: Switch to "Welcome to Sasya" ───────────────────────────
      .add(() => {
        gsap.set(phrase1Ref.current, { display: 'none' });
        gsap.set(phrase2Ref.current, { display: 'flex', opacity: 1 });
      })
      // Letters cascade in
      .to(p2Chars, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.45,
        stagger: 0.028,
        ease: "back.out(1.5)"
      })
      // Sprout icon pops in next to Sasya
      .to(iconRef.current, {
        scale: 1,
        opacity: 1,
        rotation: 8,
        duration: 0.35,
        ease: "back.out(2)"
      }, "-=0.2")
      // Brief gentle settle (0.4s) before transition
      .to({}, { duration: 0.45 });

    }, containerRef);

    return () => ctx.revert();
  }, [onFinish, skipped]);

  const handleSkip = () => {
    setSkipped(true);
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.15,
        onComplete: onFinish
      });
    } else {
      onFinish();
    }
  };

  // Helper to split string into animated character spans
  const splitLetters = (text) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className="char inline-block transform-gpu will-change-transform"
        style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
      >
        {char}
      </span>
    ));
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F9F9F6] text-[#275637] select-none px-6"
    >
      {/* Corner Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-xs font-semibold text-[#556B5C] hover:text-[#275637] px-3 py-1.5 rounded-full border border-[#D8E5DA] bg-white transition-colors"
      >
        {t('skip_intro')}
      </button>

      {/* Animated Typography Container (No Loadbar) */}
      <div className="flex flex-col items-center justify-center text-center max-w-lg min-h-[140px]">
        
        {/* Phrase 1: "Hello Farmer" */}
        <div
          ref={phrase1Ref}
          className="flex flex-wrap justify-center items-center text-3xl sm:text-4xl font-extrabold tracking-tight text-[#275637]"
          style={{ perspective: '800px' }}
        >
          {splitLetters(phrase1Text)}
        </div>

        {/* Phrase 2: "Welcome to Sasya" + 🌱 */}
        <div
          ref={phrase2Ref}
          className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E462B]"
          style={{ perspective: '800px' }}
        >
          <div className="flex flex-wrap justify-center">
            {splitLetters(phrase2Text)}
          </div>
          <span
            ref={iconRef}
            className="inline-block text-3xl transform-gpu will-change-transform origin-bottom"
          >
            🌱
          </span>
        </div>

      </div>
    </div>
  );
}
