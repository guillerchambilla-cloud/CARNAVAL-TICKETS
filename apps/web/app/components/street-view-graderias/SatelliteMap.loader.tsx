// components/street-view-graderias/SatelliteMap.loader.tsx
"use client";

import dynamic from "next/dynamic";
import type { Gradia } from "../../lib/street-view-graderias/config";

const SatelliteMap = dynamic(() => import("./SatelliteMap"), {
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
      Cargando satelital...
    </div>
  ),
});

interface Props {
  graderias: Gradia[];
  selectedId: string;
  onSelect: (gradia: Gradia) => void;
  center: [number, number];
}

export default function SatelliteMapLoader(props: Props) {
  return <SatelliteMap {...props} />;
}