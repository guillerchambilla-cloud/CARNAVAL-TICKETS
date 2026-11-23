// components/HeroCTA.tsx
"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import Link from "next/link";

export default function HeroCTA() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!btnRef.current || !glowRef.current) return;

    // Entrada desde la derecha
    animate(btnRef.current, {
      translateX: [120, 0],
      opacity: [0, 1],
      duration: 900,
      easing: "easeOutExpo",
      delay: 400,
    });

    // Pulso infinito, empieza cuando termina de entrar
    animate(btnRef.current, {
      scale: [1, 1.06, 1],
      duration: 1600,
      loop: true,
      easing: "easeInOutSine",
      delay: 1300,
    });

    // Glow respirando
    animate(glowRef.current, {
      opacity: [0.4, 0.9, 0.4],
      scale: [1, 1.25, 1],
      duration: 1800,
      loop: true,
      easing: "easeInOutSine",
      delay: 1300,
    });
  }, []);

  return (
    <div className="relative inline-block">
      <span
        ref={glowRef}
        className="absolute inset-0 -z-10 rounded-full bg-brand-600 blur-2xl opacity-0"
      />
      <Link
        ref={btnRef}
        href="/graderias"
        className="relative z-10 inline-block whitespace-nowrap rounded-full bg-brand-600 px-10 py-4 text-lg font-black uppercase tracking-wide text-white opacity-0 shadow-2xl transition-colors hover:bg-brand-700 sm:px-12 sm:py-5 sm:text-xl"
      >
        Comprar Asientos
      </Link>
    </div>
  );
}