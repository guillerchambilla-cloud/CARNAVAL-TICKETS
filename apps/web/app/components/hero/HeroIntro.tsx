"use client";

import { useMemo, useRef } from "react";
import HeroVideo from "./HeroVideo";
import HeroBalls from "./HeroBalls";
import HeroFlash from "./HeroFlash";
import HeroShockwave from "./HeroShockwave";
import HeroParticles from "./HeroParticles";
import HeroContent from "./HeroContent";
import { useHeroTimeline } from "./hooks/useHeroTimeline";
import type { HeroRefs } from "./types";

type Props = { videoSrc: string };

// Único componente dueño de la cinemática del Hero: dos esferas colisionan
// en el centro, la explosión arma el título, y recién ahí aparece el resto
// del contenido — todo coordinado por una sola HeroTimeline (ver
// ./HeroTimeline.ts). Cada hijo de acá es puramente visual.
export default function HeroIntro({ videoSrc }: Props) {
  const heroRef = useRef<HTMLElement>(null);
  const ballLeftRef = useRef<HTMLDivElement>(null);
  const ballRightRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaLinkRef = useRef<HTMLAnchorElement>(null);
  const ctaGlowRef = useRef<HTMLSpanElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const refs: HeroRefs = useMemo(
    () => ({
      heroRef,
      ballLeftRef,
      ballRightRef,
      flashRef,
      shockwaveRef,
      particlesRef,
      titleRef,
      ctaRef,
      ctaLinkRef,
      ctaGlowRef,
      buttonsRef,
      contentRef,
      scrollIndicatorRef,
    }),
    [],
  );

  useHeroTimeline(refs);

  return (
    <section
      ref={heroRef}
      className="relative h-[100dvh] w-full overflow-hidden"
      style={{ willChange: "transform" }}
    >
      <HeroVideo src={videoSrc} poster="" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      <HeroBalls leftRef={ballLeftRef} rightRef={ballRightRef} />
      <HeroShockwave innerRef={shockwaveRef} />
      <HeroParticles containerRef={particlesRef} />

      {/* pt-(--header-h): el fondo (video + degradados arriba) sigue llegando
          a top:0 — es solo el contenido el que se corre para no meterse
          debajo de la nav del header, que acá flota transparente encima. */}
      <div className="relative z-10 grid h-full grid-rows-[auto_1fr] gap-4 px-6 pt-(--header-h) pb-6 sm:px-12 sm:pb-8 lg:px-24">
        <HeroContent
          contentRef={contentRef}
          titleRef={titleRef}
          ctaRef={ctaRef}
          ctaLinkRef={ctaLinkRef}
          ctaGlowRef={ctaGlowRef}
          buttonsRef={buttonsRef}
        />
      </div>

      <HeroFlash innerRef={flashRef} />

      {/* Indicador de scroll */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce opacity-0 sm:block"
      >
        <svg
          className="h-6 w-6 text-white/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
