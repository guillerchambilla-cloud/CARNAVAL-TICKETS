"use client";

import type { RefObject } from "react";

export const BALL_SIZE = 46;

type BallProps = { innerRef: RefObject<HTMLDivElement | null> };

// Centrado por margen negativo (no por `transform: translate(-50%,-50%)`):
// la timeline anima translateX/scale de este mismo div, y un transform de
// centrado en la clase competiría con el que anime.js escribe en línea.
function Ball({ innerRef }: BallProps) {
  return (
    <div
      ref={innerRef}
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 opacity-0"
      style={{
        width: BALL_SIZE,
        height: BALL_SIZE,
        marginLeft: -BALL_SIZE / 2,
        marginTop: -BALL_SIZE / 2,
      }}
    >
      {/* estela */}
      <div
        className="absolute inset-0 rounded-full blur-md sm:blur-xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,49,49,.9), transparent 70%)",
          transform: "scale(2.6)",
        }}
      />
      {/* halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow:
            "0 0 25px 8px rgba(255,49,49,.55), 0 0 55px 20px rgba(220,20,20,.35)",
        }}
      />
      {/* núcleo brillante */}
      <div
        className="absolute inset-0 rounded-full blur-[1px]"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #fff5d0, #ff4d1a 45%, #7a0d0d 100%)",
        }}
      />
    </div>
  );
}

type Props = {
  leftRef: RefObject<HTMLDivElement | null>;
  rightRef: RefObject<HTMLDivElement | null>;
};

export default function HeroBalls({ leftRef, rightRef }: Props) {
  return (
    <>
      <Ball innerRef={leftRef} />
      <Ball innerRef={rightRef} />
    </>
  );
}
