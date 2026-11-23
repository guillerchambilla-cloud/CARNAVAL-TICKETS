"use client";

import { motion } from "motion/react";
import { EVENTOS, type EventoId } from "../../../../../../packages/types/evento";

type Props = {
  value: EventoId;
  onChange: (eventoId: EventoId) => void;
};

// Primer Convite y Carnaval de Oruro son dos eventos distintos con su propia
// disponibilidad de asientos: este selector decide para cuál de los dos se
// arma la compra. Cambiar de evento recalcula el plano (AsientosGrid) y
// limpia la selección en curso (ver graderias/[id]/page.tsx).
export default function EventoSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-brand-900">¿Para qué evento comprás?</p>
      <div className="inline-flex rounded-full border border-brand-200 bg-brand-100 p-1">
        {EVENTOS.map((evento) => (
          <button
            key={evento.id}
            type="button"
            onClick={() => onChange(evento.id)}
            className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              value === evento.id ? "text-white" : "text-ink-muted hover:text-brand-900"
            }`}
          >
            {value === evento.id && (
              <motion.span
                layoutId="evento-selector-pill"
                className="absolute inset-0 rounded-full bg-brand-600"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            )}
            <span className="relative">{evento.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
