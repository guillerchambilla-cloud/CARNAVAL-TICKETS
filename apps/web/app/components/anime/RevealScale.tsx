"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

// Como RevealOnScroll (@repo/ui), pero con una entrada más "física" — fade +
// escala vía anime.js en vez de una transición CSS lineal — para piezas
// puntuales donde vale la pena el extra de vida, como la foto del recorrido.
export default function RevealScale({
  children,
  className = "",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const animado = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefiereMenosMovimiento =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefiereMenosMovimiento) {
      el.style.opacity = "1";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || animado.current) return;
        animado.current = true;

        animate(el, {
          opacity: [0, 1],
          scale: [0.94, 1],
          duration: 800,
          delay,
          easing: "easeOutExpo",
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
