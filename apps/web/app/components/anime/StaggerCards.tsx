"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";

type Props = {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
};

// Revela los hijos directos de este contenedor en cascada apenas entra en
// viewport (a diferencia de RevealOnScroll, que anima el wrapper entero de
// una sola vez). Pensado para grillas/carruseles de tarjetas — acá, las
// tarjetas de danzas, que hoy aparecen todas de golpe sin ninguna entrada.
// Las tarjetas quedan visibles desde el HTML servido; la animación es un
// detalle progresivo y no debe ocultarlas si el navegador no la soporta.
export default function StaggerCards({
  children,
  className = "",
  staggerMs = 80,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animado = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = Array.from(el.children) as HTMLElement[];

    const prefiereMenosMovimiento =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefiereMenosMovimiento) {
      items.forEach((item) => {
        item.style.opacity = "1";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || animado.current) return;
        animado.current = true;

        animate(items, {
          opacity: [0, 1],
          translateY: [28, 0],
          scale: [0.96, 1],
          duration: 700,
          delay: stagger(staggerMs),
          easing: "easeOutExpo",
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerMs]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
