'use client';

import { motion } from 'motion/react';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number; // ms
  direction?: 'up' | 'none';
  className?: string;
};

/**
 * Envuelve cualquier contenido y lo anima con fade + slide al montarse.
 * Antes resuelto a mano con un timer + transition-* de Tailwind; ahora usa
 * Motion (spring) para que el mismo fade-in-on-mount tenga algo de cuerpo
 * en vez de una curva lineal/ease plana.
 */
export default function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: FadeInProps) {
  const offsetY = direction === 'up' ? 16 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: offsetY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24, delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
