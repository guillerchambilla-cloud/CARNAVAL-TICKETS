// packages/ui/src/RevealOnScroll.tsx
"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number; // en ms
  threshold?: number; // 0 a 1
}

// Mismo comportamiento que la versión anterior (IntersectionObserver a
// mano + transition-* de Tailwind): fade + slide-up al entrar en viewport,
// se re-anima cada vez que vuelve a entrar (no "once"). Ahora resuelto con
// Motion para un easing con más cuerpo (spring) que un ease-out plano.
export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  threshold = 0.2,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ type: "spring", stiffness: 220, damping: 26, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
