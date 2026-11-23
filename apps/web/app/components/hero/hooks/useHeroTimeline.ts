"use client";

import { useEffect, useRef } from "react";
import type { Timeline } from "animejs";
import { buildHeroTimeline } from "../HeroTimeline";
import type { HeroRefs } from "../types";

// Nombre del evento que dispara un replay de la cinemática. Next.js reusa
// (no remonta) la página "/" al volver a ella por navegación cliente dentro
// de la ventana del Router Cache, así que el useEffect de montaje no vuelve
// a correr — por eso el Header (persistente, nunca se desmonta) dispara este
// evento cada vez que la ruta activa vuelve a ser "/". Debe coincidir con la
// misma constante en packages/ui/src/header.tsx.
const HERO_REPLAY_EVENT = "hero:replay";

// Único punto donde HeroIntro conecta refs -> timeline. Respeta
// prefers-reduced-motion: en ese caso no hay colisión ni explosión, todo el
// contenido aparece directamente en su estado final.
export function useHeroTimeline(refs: HeroRefs): void {
  const timelineRef = useRef<Timeline | null>(null);

  useEffect(() => {
    function play() {
      timelineRef.current?.revert();
      timelineRef.current = null;

      const prefiereMenosMovimiento =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefiereMenosMovimiento) {
        revealInstantly(refs);
        return;
      }

      const heroWidth =
        refs.heroRef.current?.getBoundingClientRect().width ??
        window.innerWidth;
      const ballTravel = heroWidth / 2 + 120;

      // Celulares (viewport angosto) suelen ser gama baja: 160 partículas
      // animando transform+opacity a la vez sobrecargan el hilo principal y
      // el hero se "cuelga" un par de segundos. Se reduce la cantidad ahí en
      // vez de en desktop, donde no hace falta.
      const reduceEffects = window.matchMedia("(max-width: 639px)").matches;

      try {
        timelineRef.current = buildHeroTimeline(refs, {
          ballTravel,
          reduceEffects,
        });
      } catch (error) {
        // Keep the hero usable if animation setup fails in an older browser
        // or while the animation dependency is unavailable.
        console.error("No se pudo iniciar la animación del hero:", error);
        revealInstantly(refs);
      }
    }

    play();
    window.addEventListener(HERO_REPLAY_EVENT, play);

    return () => {
      window.removeEventListener(HERO_REPLAY_EVENT, play);
      timelineRef.current?.revert();
      timelineRef.current = null;
    };
  }, [refs]);
}

function revealInstantly(refs: HeroRefs) {
  const letters = refs.titleRef.current?.querySelectorAll<HTMLElement>(
    "[data-letter]",
  );
  const secondary = refs.contentRef.current?.querySelectorAll<HTMLElement>(
    "[data-secondary]",
  );

  if (letters && letters.length > 0) {
    letters.forEach((letter) => {
      letter.style.opacity = "1";
      letter.style.transform = "translateY(0) scale(1)";
      letter.style.filter = "blur(0px)";
    });
  }
  if (secondary && secondary.length > 0) {
    secondary.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    });
  }
  if (refs.ctaRef.current) {
    refs.ctaRef.current.style.opacity = "1";
    refs.ctaRef.current.style.transform = "translateY(0)";
  }
  if (refs.buttonsRef.current) {
    refs.buttonsRef.current.style.opacity = "1";
    refs.buttonsRef.current.style.transform = "translateY(0)";
  }
  if (refs.scrollIndicatorRef.current) {
    refs.scrollIndicatorRef.current.style.opacity = "1";
  }
}
