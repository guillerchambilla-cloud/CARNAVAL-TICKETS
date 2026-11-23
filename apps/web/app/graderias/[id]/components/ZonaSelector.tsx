"use client";

import { Zona } from "../../../../../../packages/types/zona";

type Props = {
  zonas: Zona[];
  zonaSeleccionada: Zona;
  onSelect: (zona: Zona) => void;
};

export default function ZonaSelector({
  zonas,
  zonaSeleccionada,
  onSelect,
}: Props) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-brand-900">
          Selecciona una zona
        </h2>

        <p className="mt-1 text-gray-500">
          Elige la zona desde donde deseas disfrutar el Carnaval.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {zonas
          .sort((a, b) => a.orden - b.orden)
          .map((zona) => {
            const activa = zona.id === zonaSeleccionada.id;

            const precioMin =
              zona.asientos.length > 0
                ? Math.min(...zona.asientos.map((a) => a.precio))
                : 0;

            return (
              <button
                key={zona.id}
                onClick={() => onSelect(zona)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  activa
                    ? "border-brand-600 bg-red-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-red-300 hover:shadow"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-5 w-5 rounded-full"
                      style={{
                        backgroundColor: zona.color,
                      }}
                    />

                    <div>
                      <h3 className="font-bold text-lg">{zona.nombre}</h3>

                      <p className="text-sm text-gray-500">
                        {zona.capacidad} asientos
                      </p>
                    </div>
                  </div>

                  {activa && (
                    <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                      Seleccionada
                    </span>
                  )}
                </div>

                <div className="mt-5 flex justify-between text-sm">
                  <span className="text-gray-500">Desde</span>

                  <span className="font-semibold text-brand-600">
                    Bs {precioMin}
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </section>
  );
}
