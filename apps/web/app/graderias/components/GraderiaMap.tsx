"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { Graderia, EstadoGraderia } from "../../../../../packages/types/graderia";
import { redDeCalles } from "../../data/redDeCalles";
import GraderiaFiltersSidebar from "./GraderiaFiltersSidebar";
import GraderiaMapListItem from "./GraderiaMapListItem";
import { PredioStreetView } from "./PredioStreetView";
import { ORDEN_OPCIONES, type Orden } from "./ordenGraderias";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-50 text-sm text-ink-subtle">
      Cargando mapa...
    </div>
  ),
});

type Props = {
  graderias: Graderia[];
  selected: Graderia | null;
  onSelect: (graderia: Graderia) => void;
  onClose: () => void;

  search: string;
  onSearchChange: (value: string) => void;
  estado: "todos" | EstadoGraderia;
  onEstadoChange: (value: "todos" | EstadoGraderia) => void;
  precioMaximo: number;
  onPrecioMaximoChange: (value: number) => void;
  conteoPorEstado: Record<EstadoGraderia, number>;
  conteoPorPrecio: Record<number, number>;

  orden: Orden;
  onOrdenChange: (value: Orden) => void;
};

// Vista "Mapa" a pantalla casi completa, al estilo "Mostrar en el mapa" de
// Booking: se monta como overlay fijo por encima del resto del sitio (mismo
// sidebar de filtros + una lista angosta sincronizada + un mapa grande),
// en vez de ser una sección más dentro del layout normal de la página.
export default function GraderiaMap({
  graderias,
  selected,
  onSelect,
  onClose,
  search,
  onSearchChange,
  estado,
  onEstadoChange,
  precioMaximo,
  onPrecioMaximoChange,
  conteoPorEstado,
  conteoPorPrecio,
  orden,
  onOrdenChange,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [verCalleDe, setVerCalleDe] = useState<Graderia | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!montado) return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 top-(--header-h) z-100 flex bg-white">
      {/* Sidebar de filtros — el mismo que en la vista Lista */}
      <div className="hidden w-70 shrink-0 overflow-y-auto border-r border-brand-200 p-5 lg:block">
        <GraderiaFiltersSidebar
          search={search}
          onSearchChange={onSearchChange}
          estado={estado}
          onEstadoChange={onEstadoChange}
          precioMaximo={precioMaximo}
          onPrecioMaximoChange={onPrecioMaximoChange}
          conteoPorEstado={conteoPorEstado}
          conteoPorPrecio={conteoPorPrecio}
        />
      </div>

      {/* Lista angosta sincronizada con los pines del mapa */}
      <div className="scrollbar-plano hidden w-90 shrink-0 flex-col overflow-y-auto border-r border-brand-100 lg:flex">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-brand-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            Ordenar por
            <select
              value={orden}
              onChange={(e) => onOrdenChange(e.target.value as Orden)}
              className="cursor-pointer rounded-full border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink outline-none transition-colors focus:border-brand-600"
            >
              {ORDEN_OPCIONES.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </label>
          <span className="shrink-0 text-xs text-ink-subtle">{graderias.length} resultados</span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          {graderias.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-100 p-8 text-center">
              <p className="text-ink-muted">No hay graderías para mostrar en el mapa.</p>
            </div>
          ) : (
            graderias.map((graderia) => (
              <GraderiaMapListItem
                key={graderia.id}
                graderia={graderia}
                activo={selected?.id === graderia.id}
                resaltado={hoveredId === graderia.id}
                onMouseEnter={() => setHoveredId(graderia.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(graderia)}
              />
            ))
          )}
        </div>
      </div>

      {/* Mapa grande — protagonista de esta vista */}
      <div className="relative flex-1">
        <LeafletMap
          graderias={graderias}
          selected={selected}
          hoveredId={hoveredId}
          onHover={setHoveredId}
        />

        {/* Buscador + cerrar en una sola fila flex (no dos elementos
            absolutos con anchos calculados a mano): así nunca se pisan,
            sea cual sea el ancho de pantalla — antes el buscador centrado
            con un w-[calc(100%-8rem)] se superponía con el botón de cerrar
            en celulares angostos. */}
        <div className="absolute inset-x-3 top-3 z-1000 flex items-center gap-2 sm:inset-x-4 sm:top-4">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en el mapa..."
              className="w-full rounded-full border border-brand-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink shadow-lg outline-none focus:border-brand-600 sm:py-3"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el mapa"
            className="flex shrink-0 items-center gap-2 rounded-full bg-night px-3.5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-night-soft sm:px-4"
          >
            <span className="hidden sm:inline">Cerrar el mapa</span> ✕
          </button>
        </div>

        {selected && (
          <button
            type="button"
            onClick={() => setVerCalleDe(selected)}
            className="absolute bottom-4 left-3 right-3 z-1000 truncate rounded-full bg-white px-4 py-2 text-center text-xs font-bold text-brand-900 shadow-lg transition-colors hover:bg-brand-100 sm:left-auto sm:right-4 sm:w-auto"
          >
            📍 Ver en Street View
          </button>
        )}
      </div>

      {verCalleDe && <StreetViewModal graderia={verCalleDe} onClose={() => setVerCalleDe(null)} />}
    </div>,
    document.body,
  );
}

function StreetViewModal({ graderia, onClose }: { graderia: Graderia; onClose: () => void }) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4"
    >
      <div
        className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 text-3xl leading-none text-white/80 transition hover:text-white"
        >
          ×
        </button>
        <div className="absolute left-4 top-4 z-10 max-w-[70%] truncate rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white">
          {graderia.nombre}
        </div>
        <PredioStreetView
          predio={{
            id: graderia.id,
            center: graderia.center,
            coordinates: graderia.coords,
            ubicacion: graderia.ubicacion,
          }}
          redCalles={redDeCalles}
          className="h-full w-full"
        />
      </div>
    </div>,
    document.body,
  );
}
