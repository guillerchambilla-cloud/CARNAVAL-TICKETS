"use client";

import type { RefObject } from "react";
import type { ParticleType } from "./types";

export const PARTICLE_COUNT = 160;

const TYPES: ParticleType[] = ["dot", "spark", "line", "dust", "glow"];

const TYPE_GEOMETRY: Record<
  ParticleType,
  { width: number; height: number; className: string }
> = {
  dot: { width: 6, height: 6, className: "rounded-full bg-[#ff8a3d]" },
  spark: { width: 8, height: 8, className: "rounded-full bg-[#fff3c4]" },
  line: { width: 22, height: 2, className: "rounded-full bg-[#ff5a3d]" },
  dust: { width: 4, height: 4, className: "rounded-full bg-[#ffb37a]" },
  glow: {
    width: 12,
    height: 12,
    className: "rounded-full bg-[#ff3131] blur-[2px]",
  },
};

type Props = { containerRef: RefObject<HTMLDivElement | null> };

// Puramente visual: 160 nodos ya ubicados en el centro del Hero, todos en
// opacity 0. La HeroTimeline es la única que decide hacia dónde vuela cada
// uno (dirección/velocidad/tamaño/duración aleatorios se calculan ahí, en
// tiempo de animación — nunca acá, para no arriesgar un mismatch de
// hidratación por valores aleatorios calculados durante el render).
export default function HeroParticles({ containerRef }: Props) {
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-0 w-0"
    >
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const type = TYPES[i % TYPES.length] as ParticleType;
        const geo = TYPE_GEOMETRY[type];
        return (
          <span
            key={i}
            data-particle
            data-particle-type={type}
            className={`absolute left-0 top-0 opacity-0 ${geo.className}`}
            style={{
              width: geo.width,
              height: geo.height,
              marginLeft: -geo.width / 2,
              marginTop: -geo.height / 2,
            }}
          />
        );
      })}
    </div>
  );
}
