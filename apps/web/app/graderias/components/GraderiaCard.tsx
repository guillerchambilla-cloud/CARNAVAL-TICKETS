"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Graderia } from "../../../../../packages/types/graderia";

type Props = {
  graderia: Graderia;
  // Replica el link "Mostrar en el mapa" de cada fila de Booking: cambia a
  // la vista de mapa centrada en esta gradería sin salir de la página.
  onVerEnMapa?: (graderia: Graderia) => void;
};

const ESTADO: Record<Graderia["estado"], { label: string; clases: string }> = {
  disponible: { label: "Disponible", clases: "bg-green-100 text-green-700" },
  agotado: { label: "Agotada", clases: "bg-red-100 text-red-700" },
  proximamente: { label: "Próximamente", clases: "bg-yellow-100 text-yellow-700" },
};

// Fila horizontal al estilo de un resultado de búsqueda de Booking: foto a
// la izquierda, datos al medio, precio + CTA a la derecha — reemplaza la
// tarjeta vertical de grilla que tenía antes GraderiaList.
export default function GraderiaCard({ graderia, onVerEnMapa }: Props) {
  const estado = ESTADO[graderia.estado];

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-lg sm:flex-row"
    >
      <Link
        href={`/graderias/${graderia.id}`}
        className="relative block h-48 shrink-0 overflow-hidden bg-brand-100 sm:h-auto sm:w-64"
      >
        {graderia.banner ? (
          <img
            src={graderia.banner}
            alt={graderia.nombre}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `${graderia.colorMapa}22` }}
          >
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: graderia.colorMapa }} />
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${estado.clases}`}
        >
          {estado.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="min-w-0">
            <Link href={`/graderias/${graderia.id}`}>
              <h2 className="text-lg font-bold text-brand-900 transition-colors hover:text-brand-600">
                {graderia.nombre}
              </h2>
            </Link>

            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-ink-subtle">
              📍 {graderia.ubicacion}
              {onVerEnMapa && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => onVerEnMapa(graderia)}
                    className="font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2 hover:text-brand-700"
                  >
                    Mostrar en el mapa
                  </button>
                </>
              )}
            </p>

            {graderia.descripcion && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                {graderia.descripcion}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{graderia.capacidad} asientos</Badge>
              <Badge>{graderia.metrosLineales} m lineales</Badge>
              <Badge>
                {graderia.zonas.length} {graderia.zonas.length === 1 ? "zona" : "zonas"}
              </Badge>
            </div>
          </div>

          <div className="flex shrink-0 flex-row items-end justify-between gap-3 border-t border-brand-100 pt-3 sm:w-40 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0 sm:text-right">
            <div>
              <p className="text-xs text-ink-subtle">Desde</p>
              <p className="text-xl font-extrabold text-brand-600">Bs {graderia.precioMin}</p>
              <p className="text-xs text-ink-subtle">hasta Bs {graderia.precioMax}</p>
            </div>

            <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
              <Link
                href={`/graderias/${graderia.id}`}
                className="block rounded-full bg-brand-600 px-5 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-brand-700"
              >
                Ver detalles
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-900">
      {children}
    </span>
  );
}
