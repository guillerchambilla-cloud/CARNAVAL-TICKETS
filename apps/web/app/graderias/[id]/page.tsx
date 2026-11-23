"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useGraderias } from "../../lib/hooks/useGraderia";

import { Asiento } from "../../../../../packages/types/asiento";
import { EVENTO_POR_DEFECTO, type EventoId } from "../../../../../packages/types/evento";

import GraderiaHero from "./components/GraderiaHero";
import EventoSelector from "./components/EventoSelector";
import AsientosGrid from "./components/AsientosGrid";
import ResumenCompra from "./components/ResumenCompra";


export default function GraderiaPage() {
  const { id } = useParams<{ id: string }>();
  const [eventoId, setEventoId] = useState<EventoId>(EVENTO_POR_DEFECTO);
  const { graderias, cargando } = useGraderias(eventoId, 0, id);

  const graderia = useMemo(() => graderias.find((g) => g.id === id), [graderias, id]);

  const [seleccionados, setSeleccionados] = useState<Asiento[]>([]);

  // Primer Convite y Carnaval de Oruro tienen disponibilidad independiente:
  // al cambiar de evento el plano se recalcula (otro asiento puede estar
  // ocupado), así que la selección en curso ya no es válida.
  useEffect(() => {
    setSeleccionados([]);
  }, [eventoId]);

  if (cargando) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6">
        <p className="text-ink-muted">Cargando gradería…</p>
      </main>
    );
  }

  if (!graderia) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-display text-4xl uppercase text-brand-900">
          Gradería no encontrada
        </h1>
      </main>
    );
  }

  const toggleAsiento = (asiento: Asiento) => {
    if (asiento.estado === "ocupado" || asiento.estado === "inhabilitado" || asiento.estado === "revendido") return;

    const existe = seleccionados.some((a) => a.id === asiento.id);

    if (existe) {
      setSeleccionados((prev) => prev.filter((a) => a.id !== asiento.id));
    } else {
      setSeleccionados((prev) => [...prev, asiento]);
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
      <GraderiaHero graderia={graderia} />

      <EventoSelector value={eventoId} onChange={setEventoId} />

      {graderia.zonas.length > 0 && (
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <AsientosGrid
              zonas={graderia.zonas}
              seleccionados={seleccionados}
              onToggle={toggleAsiento}
            />
          </div>

          <ResumenCompra
            graderia={graderia}
            zonas={graderia.zonas}
            seleccionados={seleccionados}
            eventoId={eventoId}
            onQuitar={toggleAsiento}
          />
        </section>
      )}
    </main>
  );
}
