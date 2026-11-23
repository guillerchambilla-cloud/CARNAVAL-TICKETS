"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
};

// Micro-interacción compartida para los CTAs principales del sitio: un leve
// "levante" al pasar el mouse y una compresión al hacer click/tap, con
// spring en vez de una curva lineal. El <Link> queda intacto adentro (no
// hace falta reenviar refs a través de motion()) — el wrapper solo aporta el
// gesto, nunca intercepta el click.
export default function MotionLink({ href, children, className = "", wrapperClassName = "inline-block" }: Props) {
  return (
    <motion.div
      className={wrapperClassName}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}
