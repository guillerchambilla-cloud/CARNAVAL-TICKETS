// app/street-view-graderias/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import StreetViewGraderiaLoader from "../components/street-view-graderias/StreetViewGraderia.loader";
import SatelliteMapLoader from "../components/street-view-graderias/SatelliteMap.loader";
import { SAMPLE_GRADERIAS } from "../lib/street-view-graderias/config";

export default function StreetViewGraderiasPage() {
  // Non-null assertion segura: SAMPLE_GRADERIAS es un array literal no vacío definido en config.ts
  const [selected, setSelected] = useState(SAMPLE_GRADERIAS[0]!);

  return (
    // Apilado en columna hasta lg (los dos paneles lado a lado antes eran
    // flexDirection:"row" fijo por inline style, sin ningún breakpoint —
    // en celular quedaban dos columnas angostísimas, inusables).
    <main className="relative flex h-[calc(100vh-var(--header-h))] w-full flex-col lg:flex-row">
      {/* Panel: Street View */}
      <div className="relative min-h-0 min-w-0 flex-1 lg:flex-[3_1_60%]">
        <Link
          href="/dashboard"
          className="absolute left-3 top-3 z-10 rounded-lg bg-black/85 px-3.5 py-2 text-xs font-semibold text-white no-underline sm:left-4 sm:top-4"
        >
          ← Panel de administración
        </Link>

        <div className="absolute right-3 top-3 z-10 flex max-w-[70%] flex-wrap justify-end gap-2 sm:right-4 sm:top-4 sm:max-w-[60%]">
          {SAMPLE_GRADERIAS.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelected(g)}
              className="rounded-lg px-3.5 py-2 text-xs font-semibold text-white"
              style={{ background: g.id === selected.id ? "#c71f1f" : "rgba(20,20,25,0.85)" }}
            >
              {g.name}
            </button>
          ))}
        </div>

        <StreetViewGraderiaLoader gradia={selected} />
      </div>

      {/* Panel: vista satelital */}
      <div className="relative min-h-0 min-w-0 flex-1 border-t-2 border-[#222] lg:flex-[2_1_40%] lg:border-l-2 lg:border-t-0">
        <SatelliteMapLoader
          graderias={SAMPLE_GRADERIAS}
          selectedId={selected.id}
          onSelect={setSelected}
          center={selected.coords}
        />
      </div>
    </main>
  );
}
