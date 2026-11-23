"use client";

import type { RefObject } from "react";

type Props = { innerRef: RefObject<HTMLDivElement | null> };

export default function HeroFlash({ innerRef }: Props) {
  return (
    <div
      ref={innerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-40 bg-white opacity-0"
    />
  );
}
