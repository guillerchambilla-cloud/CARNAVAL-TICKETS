"use client";

import type { RefObject } from "react";

export const SHOCKWAVE_SIZE = 90;

type Props = { innerRef: RefObject<HTMLDivElement | null> };

export default function HeroShockwave({ innerRef }: Props) {
  return (
    <div
      ref={innerRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 rounded-full opacity-0"
      style={{
        width: SHOCKWAVE_SIZE,
        height: SHOCKWAVE_SIZE,
        marginLeft: -SHOCKWAVE_SIZE / 2,
        marginTop: -SHOCKWAVE_SIZE / 2,
        border: "2px solid rgba(255,140,60,.85)",
        boxShadow:
          "0 0 40px 10px rgba(255,80,30,.5), inset 0 0 30px 4px rgba(255,180,90,.4)",
      }}
    />
  );
}
