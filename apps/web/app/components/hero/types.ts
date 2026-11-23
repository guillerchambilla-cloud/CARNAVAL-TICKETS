import type { RefObject } from "react";

export type HeroRefs = {
  heroRef: RefObject<HTMLElement | null>;
  ballLeftRef: RefObject<HTMLDivElement | null>;
  ballRightRef: RefObject<HTMLDivElement | null>;
  flashRef: RefObject<HTMLDivElement | null>;
  shockwaveRef: RefObject<HTMLDivElement | null>;
  particlesRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  ctaRef: RefObject<HTMLDivElement | null>;
  ctaLinkRef: RefObject<HTMLAnchorElement | null>;
  ctaGlowRef: RefObject<HTMLSpanElement | null>;
  buttonsRef: RefObject<HTMLDivElement | null>;
  /** Contenedor de la grilla de contenido — la timeline busca dentro de él
   * los nodos `[data-secondary]` (párrafo descriptivo + tagline bajo el
   * CTA), que viven en dos columnas distintas y por eso no comparten un
   * único ref propio. */
  contentRef: RefObject<HTMLDivElement | null>;
  scrollIndicatorRef: RefObject<HTMLDivElement | null>;
};

// Todo lo que depende del tamaño real del Hero en pantalla (nunca constantes
// fijas tipo `translateX: 700`, que se rompen en móvil/ultrawide).
export type HeroMetrics = {
  /** px que cada esfera recorre desde su borde hasta el centro. */
  ballTravel: number;
  /** Viewport angosto/gama baja: anima menos partículas para no colgar el
   * hilo principal en celulares. */
  reduceEffects: boolean;
};

export type ParticleType = "dot" | "spark" | "line" | "dust" | "glow";
