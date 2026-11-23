"use client";

import type { RefObject } from "react";
import Link from "next/link";

type Props = {
  ctaRef: RefObject<HTMLDivElement | null>;
  ctaLinkRef: RefObject<HTMLAnchorElement | null>;
  ctaGlowRef: RefObject<HTMLSpanElement | null>;
};

// Puramente visual: sin useEffect, sin animate(). La HeroTimeline anima
// ctaRef (entrada) y por separado ctaLinkRef/ctaGlowRef (pulso + glow en loop).
export default function HeroCTA({ ctaRef, ctaLinkRef, ctaGlowRef }: Props) {
  return (
    <div ref={ctaRef} className="relative inline-block">
      <span
        ref={ctaGlowRef}
        className="absolute inset-0 -z-10 rounded-full bg-brand-600 blur-2xl opacity-0"
      />
      <Link
        ref={ctaLinkRef}
        href="/graderias"
        className="relative z-10 inline-block whitespace-nowrap rounded-full bg-brand-600 px-10 py-4 text-lg font-black uppercase tracking-wide text-white shadow-2xl transition-colors hover:bg-brand-700 sm:px-12 sm:py-5 sm:text-xl"
      >
        Comprar Asientos
      </Link>
    </div>
  );
}
