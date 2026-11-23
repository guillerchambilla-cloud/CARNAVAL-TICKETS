// components/street-view-graderias/StreetViewGraderia.loader.tsx
"use client";

import dynamic from "next/dynamic";
import type { Gradia } from "../../lib/street-view-graderias/config";

const StreetViewGraderia = dynamic(() => import("./StreetViewGraderia"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#999",
        background: "#0b0b0f",
      }}
    >
      Cargando Street View...
    </div>
  ),
});

export default function StreetViewGraderiaLoader({ gradia }: { gradia: Gradia }) {
  return <StreetViewGraderia gradia={gradia} />;
}