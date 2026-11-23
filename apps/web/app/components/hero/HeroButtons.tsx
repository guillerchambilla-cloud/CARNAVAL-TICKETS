"use client";

import type { RefObject } from "react";
import Link from "next/link";

type Props = { buttonsRef: RefObject<HTMLDivElement | null> };

export default function HeroButtons({ buttonsRef }: Props) {
  return (
    <div ref={buttonsRef} className="flex flex-wrap gap-3">
      <Link
        href="/#ruta"
        className="group inline-flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/5 px-5 py-2 text-xs font-bold tracking-wide text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white hover:text-black sm:px-7 sm:py-3 sm:text-sm"
      >
        Ver Ruta
        <span className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>
      <Link
        href="/programa"
        className="inline-flex items-center gap-2 rounded-full border-2 border-transparent bg-white/5 px-5 py-2 text-xs font-bold tracking-wide text-white/90 backdrop-blur-sm transition-all hover:bg-white/15 sm:px-7 sm:py-3 sm:text-sm"
      >
        Programa Oficial
      </Link>
    </div>
  );
}
