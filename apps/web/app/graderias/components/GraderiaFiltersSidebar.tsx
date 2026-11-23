"use client";

import type { EstadoGraderia } from "../../../../../packages/types/graderia";

type Estado = "todos" | EstadoGraderia;

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  estado: Estado;
  onEstadoChange: (value: Estado) => void;

  precioMaximo: number;
  onPrecioMaximoChange: (value: number) => void;

  conteoPorEstado: Record<EstadoGraderia, number>;
  conteoPorPrecio: Record<number, number>;
};

const ESTADOS: { value: EstadoGraderia; label: string }[] = [
  { value: "disponible", label: "Disponible" },
  { value: "proximamente", label: "Próximamente" },
  { value: "agotado", label: "Agotada" },
];

const RANGOS_PRECIO = [300, 500, 800, 1000];

// Sidebar de filtros al estilo "Filtrar por" de Booking: checkboxes con el
// conteo de resultados al lado de cada opción, en vez de los <select>
// desplegables que tenía SearchBar. El estado (estado/precioMaximo) sigue
// siendo single-select como antes — clickear la opción ya activa la
// desactiva (vuelve a "todos"/0), así que visualmente son checkboxes pero
// se comportan como el mismo filtro exclusivo de siempre.
export default function GraderiaFiltersSidebar({
  search,
  onSearchChange,
  estado,
  onEstadoChange,
  precioMaximo,
  onPrecioMaximoChange,
  conteoPorEstado,
  conteoPorPrecio,
}: Props) {
  return (
    <aside className="space-y-6">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-subtle"
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
          placeholder="Buscar por nombre o ubicación..."
          className="w-full rounded-xl border border-brand-200 py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
        />
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-5">
        <p className="text-sm font-bold text-brand-900">Filtrar por</p>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Disponibilidad</p>
          <div className="mt-3 space-y-2.5">
            {ESTADOS.map((opcion) => (
              <FiltroCheckbox
                key={opcion.value}
                label={opcion.label}
                cantidad={conteoPorEstado[opcion.value]}
                checked={estado === opcion.value}
                onChange={() => onEstadoChange(estado === opcion.value ? "todos" : opcion.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-brand-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">Precio</p>
          <div className="mt-3 space-y-2.5">
            {RANGOS_PRECIO.map((rango) => (
              <FiltroCheckbox
                key={rango}
                label={`Hasta Bs ${rango}`}
                cantidad={conteoPorPrecio[rango] ?? 0}
                checked={precioMaximo === rango}
                onChange={() => onPrecioMaximoChange(precioMaximo === rango ? 0 : rango)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function FiltroCheckbox({
  label,
  cantidad,
  checked,
  onChange,
}: {
  label: string;
  cantidad: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm text-ink">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-600/40"
        />
        <span className={checked ? "font-semibold text-brand-900" : ""}>{label}</span>
      </span>
      <span className="text-xs text-ink-subtle">{cantidad}</span>
    </label>
  );
}
