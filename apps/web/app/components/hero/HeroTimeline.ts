import { createTimeline, stagger, type Timeline, type FunctionValue } from "animejs";
import type { HeroRefs, HeroMetrics } from "./types";

// --- Momentos clave de la cinemática (ms desde que arranca la timeline) ---
// Todo lo demás se deriva de estas pocas constantes para que la secuencia
// se pueda reajustar sin tener que tocar cada `.add()` a mano.
const BALL_ENTER_AT = 200; // 1. pantalla "a oscuras", solo video, ~200ms
const BALL_TRAVEL_MS = 850; // 2-3. entran y aceleran (no lineal) hacia el centro
const IMPACT_AT = BALL_ENTER_AT + BALL_TRAVEL_MS; // 4. colisión
const TITLE_AT = IMPACT_AT + 300; // 7. el título se arma desde la explosión
const LETTER_STAGGER_MS = 40;

/** Hash determinístico (sin Math.random) para que cada partícula tenga un
 * ángulo/distancia de vuelo estable — así translateX/translateY/rotate del
 * mismo índice quedan correlacionados y la trayectoria es una línea recta
 * desde el centro, en vez de que cada eje "tire" para un lado distinto. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function particleAngle(index: number, total: number): number {
  const base = (index / total) * Math.PI * 2;
  const jitter = (pseudoRandom(index + 0.37) - 0.5) * 0.6;
  return base + jitter;
}

function particleDistance(index: number): number {
  return 70 + pseudoRandom(index + 91.7) * 260;
}

export function buildHeroTimeline(
  refs: HeroRefs,
  metrics: HeroMetrics,
): Timeline {
  const {
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
  } = refs;

  const tl = createTimeline({ autoplay: true });

  // 2-3. Las esferas aparecen y aceleran hacia el centro. Un solo tween con
  // ease "inExpo" en translateX ya da esa sensación de arranque lento y
  // cierre brutal — más natural que animar "aparece" y "acelera" por
  // separado. opacity/scale usan su propio timing (más corto) vía el
  // shorthand de objeto por propiedad.
  const ballLeft = ballLeftRef.current;
  const ballRight = ballRightRef.current;
  if (ballLeft) {
    tl.add(
      ballLeft,
      {
        opacity: { to: 1, from: 0, duration: 200, ease: "outQuad" },
        scale: { to: 1, from: 0.4, duration: 300, ease: "outBack" },
        translateX: {
          to: 0,
          from: -metrics.ballTravel,
          duration: BALL_TRAVEL_MS,
          ease: "inExpo",
        },
      },
      BALL_ENTER_AT,
    );
  }
  if (ballRight) {
    tl.add(
      ballRight,
      {
        opacity: { to: 1, from: 0, duration: 200, ease: "outQuad" },
        scale: { to: 1, from: 0.4, duration: 300, ease: "outBack" },
        translateX: {
          to: 0,
          from: metrics.ballTravel,
          duration: BALL_TRAVEL_MS,
          ease: "inExpo",
        },
      },
      BALL_ENTER_AT,
    );
  }

  // 4. Impacto: flash blanco, vibración del Hero, y las esferas desaparecen
  // en un pequeño estallido de escala antes de esfumarse.
  if (ballLeft && ballRight) {
    tl.add(
      [ballLeft, ballRight],
      {
        scale: [1, 1.7, 0],
        opacity: [1, 1, 0],
        duration: 280,
        ease: "inExpo",
      },
      IMPACT_AT,
    );
  }
  if (flashRef.current) {
    tl.add(
      flashRef.current,
      { opacity: [0, 0.45, 0], duration: 380, ease: "outQuad" },
      IMPACT_AT,
    );
  }
  if (heroRef.current) {
    tl.add(
      heroRef.current,
      {
        translateX: [0, -6, 6, -3, 3, -1, 1, 0],
        duration: 320,
        ease: "outQuad",
      },
      IMPACT_AT,
    );
  }

  // 6. Onda expansiva: crece rápido mientras se desvanece.
  if (shockwaveRef.current) {
    tl.add(
      shockwaveRef.current,
      {
        scale: [0, 12],
        opacity: [0.7, 0],
        duration: 750,
        ease: "outExpo",
      },
      IMPACT_AT,
    );
  }

  // 5. Explosión: 150-200 partículas, cada una con dirección/velocidad/
  // tamaño/duración/opacidad propios. La dirección sale de un hash por
  // índice (línea recta y pareja alrededor del centro); duración/escala/
  // opacidad final sí son puramente aleatorias entre partículas.
  const particlesEncontradas = particlesRef.current
    ? Array.from(
        particlesRef.current.querySelectorAll<HTMLElement>("[data-particle]"),
      )
    : [];
  // En mobile solo se anima un tercio: el resto se queda en opacity 0 (ya su
  // estado inicial), invisible y sin costo.
  const particles = metrics.reduceEffects
    ? particlesEncontradas.slice(0, Math.ceil(particlesEncontradas.length / 3))
    : particlesEncontradas;
  if (particles.length > 0) {
    const total = particles.length;
    const translateXFn: FunctionValue<number> = (_target, index = 0) =>
      Math.cos(particleAngle(index, total)) * particleDistance(index);
    const translateYFn: FunctionValue<number> = (_target, index = 0) =>
      Math.sin(particleAngle(index, total)) * particleDistance(index);
    const rotateFn: FunctionValue<number> = (_target, index = 0) =>
      (particleAngle(index, total) * 180) / Math.PI;
    const scaleFn: FunctionValue<number> = () => 0.4 + Math.random() * 1.4;
    const durationFn: FunctionValue<number> = () => 650 + Math.random() * 550;

    tl.add(
      particles,
      {
        translateX: translateXFn,
        translateY: translateYFn,
        rotate: rotateFn,
        scale: scaleFn,
        opacity: [1, 1, 0],
        duration: durationFn,
        delay: stagger(2, { from: "center" }),
        ease: "outExpo",
      },
      IMPACT_AT,
    );
  }

  // 7. El título se construye letra por letra, como si emergiera de la
  // explosión: blur + translateY + scale + opacity, con un pequeño rebote.
  const letters = titleRef.current
    ? Array.from(titleRef.current.querySelectorAll<HTMLElement>("[data-letter]"))
    : [];
  let titleEndsAt = TITLE_AT;
  if (letters.length > 0) {
    const letterDuration = 650;
    tl.add(
      letters,
      {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.4, 1],
        filter: ["blur(14px)", "blur(0px)"],
        duration: letterDuration,
        delay: stagger(LETTER_STAGGER_MS),
        ease: "outBack",
      },
      TITLE_AT,
    );
    titleEndsAt =
      TITLE_AT + (letters.length - 1) * LETTER_STAGGER_MS + letterDuration;
  }

  // 8. HeroCTA aparece, y una vez asentado arrancan sus loops de pulso/glow.
  const ctaAt = titleEndsAt - 250;
  const ctaDuration = 700;
  if (ctaRef.current) {
    tl.add(
      ctaRef.current,
      { opacity: [0, 1], translateY: [24, 0], duration: ctaDuration, ease: "outExpo" },
      ctaAt,
    );
  }
  if (ctaLinkRef.current) {
    tl.add(
      ctaLinkRef.current,
      { scale: [1, 1.06, 1], duration: 1600, loop: true, ease: "inOutSine" },
      ctaAt + ctaDuration,
    );
  }
  if (ctaGlowRef.current) {
    tl.add(
      ctaGlowRef.current,
      {
        opacity: [0.4, 0.9, 0.4],
        scale: [1, 1.25, 1],
        duration: 1800,
        loop: true,
        ease: "inOutSine",
      },
      ctaAt + ctaDuration,
    );
  }

  // 9. Botones secundarios.
  const buttonsAt = ctaAt + 250;
  if (buttonsRef.current) {
    tl.add(
      buttonsRef.current,
      { opacity: [0, 1], translateY: [18, 0], duration: 600, ease: "outExpo" },
      buttonsAt,
    );
  }

  // 10. Texto secundario (párrafo descriptivo + tagline bajo el CTA).
  const secondaryAt = buttonsAt + 200;
  const secondaryEls = contentRef.current
    ? Array.from(
        contentRef.current.querySelectorAll<HTMLElement>("[data-secondary]"),
      )
    : [];
  if (secondaryEls.length > 0) {
    tl.add(
      secondaryEls,
      {
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 600,
        delay: stagger(120),
        ease: "outExpo",
      },
      secondaryAt,
    );
  }

  // 11. Indicador de scroll, al final de todo.
  const scrollAt = secondaryAt + 500;
  if (scrollIndicatorRef.current) {
    tl.add(
      scrollIndicatorRef.current,
      { opacity: [0, 1], duration: 500, ease: "outQuad" },
      scrollAt,
    );
  }

  return tl;
}
