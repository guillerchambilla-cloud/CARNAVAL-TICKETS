// components/HeroTitle.tsx
"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

const LINE_1 = "Carnaval";
const LINE_2 = "de Oruro";

function splitToSpans(text: string, keyPrefix: string) {
  return text.split("").map((char, i) => (
    <span
      key={`${keyPrefix}-${i}`}
      data-letter
      className="inline-block opacity-0"
      style={{ willChange: "transform, opacity" }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export default function HeroTitle() {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const letters = containerRef.current.querySelectorAll("[data-letter]");

    animate(letters, {
      opacity: [0, 1],
      translateY: [40, 0],
      rotate: [() => (Math.random() > 0.5 ? 12 : -12), 0],
      scale: [0.5, 1],
      duration: 700,
      delay: stagger(35, { start: 250 }),
      easing: "easeOutBack",
    });
  }, []);

  return (
    <h1
      ref={containerRef}
      className="text-left font-black uppercase leading-[0.95] tracking-tight text-white"
      style={{ fontSize: "clamp(1.75rem, 5vw + 1vh, 4.5rem)" }}
    >
      <span
        className="block drop-shadow-2xl"
        style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
      >
        {splitToSpans(LINE_1, "l1")}
      </span>
      <span
        className="block text-[#ff4d4d]"
        style={{
          textShadow:
            "0 0 20px rgba(255,77,77,0.6), 0 2px 12px rgba(0,0,0,0.9)",
          WebkitTextStroke: "1px rgba(255,255,255,0.15)",
        }}
      >
        {splitToSpans(LINE_2, "l2")}
      </span>
    </h1>
  );
}