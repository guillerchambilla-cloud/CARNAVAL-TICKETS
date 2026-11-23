"use client";

import Link from "next/link";
import { Graderia } from "../../../../../packages/types/graderia";

type Props = {
  graderia: Graderia;
  activo: boolean;
  resaltado: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
};

const ESTADO_BADGE: Record<Graderia["estado"], string> = {
  disponible: "bg-green-100 text-green-700",
  agotado: "bg-red-100 text-red-700",
  proximamente: "bg-yellow-100 text-yellow-700",
};

const ESTADO_LABEL: Record<Graderia["estado"], string> = {
  disponible: "Disponible",
  agotado: "Agotada",
  proximamente: "Próximamente",
};

// Tarjeta compacta al estilo de una fila de resultados de Booking: foto a la
// izquierda, datos + precio a la derecha. El hover resalta el pin
// correspondiente en el mapa (ver LeafletMap); el clic centra el mapa en
// esta gradería y abre su popup — "Ver detalles" es lo único que navega.
export default function GraderiaMapListItem({
  graderia,
  activo,
  resaltado,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: Props) {
  const destacado = activo || resaltado;

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={`flex w-full cursor-pointer gap-3 rounded-2xl border bg-white p-3 text-left shadow-sm transition-all duration-200 ${
        destacado
          ? "border-brand-600 shadow-md ring-2 ring-brand-600/20"
          : "border-brand-200 hover:border-brand-300 hover:shadow-md"
      }`}
    >
      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-100">
        {graderia.banner ? (
          <img src={graderia.banner} alt={graderia.nombre} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `${graderia.colorMapa}22` }}
          >
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: graderia.colorMapa }} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-bold text-brand-900">{graderia.nombre}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${ESTADO_BADGE[graderia.estado]}`}
          >
            {ESTADO_LABEL[graderia.estado]}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-subtle">{graderia.ubicacion}</p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="text-xs text-ink-subtle">
            {graderia.capacidad} asientos · {graderia.zonas.length}{" "}
            {graderia.zonas.length === 1 ? "zona" : "zonas"}
          </span>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-brand-600">Bs {graderia.precioMin}</p>
            <Link
              href={`/graderias/${graderia.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-semibold text-brand-900 underline decoration-brand-300 underline-offset-2 hover:text-brand-600"
            >
              Ver detalles →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
