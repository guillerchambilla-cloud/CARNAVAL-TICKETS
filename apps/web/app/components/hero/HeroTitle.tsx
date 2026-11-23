"use client";

import type { RefObject } from "react";

const LINE_1 = "Carnaval";
const LINE_2 = "de Oruro";

function splitToSpans(text: string, keyPrefix: string) {
  return text.split("").map((char, i) => (
    <span
      key={`${keyPrefix}-${i}`}
      data-letter
      className="inline-block"
      style={{ willChange: "transform, opacity, filter" }}
    >
      {char === " " ? " " : char}
    </span>
  ));
}

type Props = { titleRef: RefObject<HTMLHeadingElement | null> };

// Puramente visual: sin useEffect, sin animate(). La HeroTimeline es quien
// consulta `[data-letter]` dentro de titleRef y decide cómo aparecen.
export default function HeroTitle({ titleRef }: Props) {
  return (
    <h1
      ref={titleRef}
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
