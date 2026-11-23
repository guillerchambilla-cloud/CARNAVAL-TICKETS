"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Asiento as AsientoType } from "../../../../../../packages/types/asiento";
import { Zona } from "../../../../../../packages/types/zona";

import Asiento from "./asiento";
import MarqueeBanner from "../../../components/anime/MarqueeBanner";

type Props = {
  zonas: Zona[];
  seleccionados: AsientoType[];
  onToggle: (asiento: AsientoType) => void;
};

const TAMANO_ASIENTO = 40;
const ESPACIO = 8;
const ANCHO_FILA = 40;

const COLOR_OCUPADO = "#9ca3af";
const COLOR_REVENDIDO = "#a855f7";

type AsientoDeZona = { zona: Zona; asiento: AsientoType };

// Color de cada celda en la vista general en miniatura — mismo criterio de
// estados que Asiento.tsx (asiento.tsx), condensado a un solo color plano
// porque acá no hay lugar para bordes/tooltip, solo un vistazo rápido.
// "Seleccionado" usa el dorado de acento (nunca el color de una zona real)
// para que no se confunda con una zona que el dueño haya pintado de rojo —
// mismo motivo por el que el asiento real ya no usa un rojo fijo tampoco.
function colorMiniCelda(asiento: AsientoType, colorZona: string, seleccionado: boolean): string {
  if (seleccionado) return "#e8a33d";
  if (asiento.estado === "ocupado") return COLOR_OCUPADO;
  if (asiento.estado === "revendido") return COLOR_REVENDIDO;
  if (asiento.estado === "inhabilitado" && asiento.motivoInhabilitado) return "#ffffff";
  // disponible, o inhabilitado sin motivo (todavía no en ninguna fase de venta)
  return asiento.estado === "inhabilitado" ? `${colorZona}55` : colorZona;
}

// Todas las zonas se muestran juntas en un solo plano (no una por una,
// eligiendo primero cuál ver): cada asiento se marca con un borde del color
// de su zona, y el relleno sigue mostrando su estado (disponible/ocupado/
// seleccionado/etc.) igual que antes.
export default function AsientosGrid({ zonas, seleccionados, onToggle }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const arrastrandoRef = useRef(false);
  const [scrollInfo, setScrollInfo] = useState({ left: 0, clientWidth: 0, scrollWidth: 0 });

  const todos: AsientoDeZona[] = zonas.flatMap((zona) =>
    zona.asientos.map((asiento) => ({ zona, asiento })),
  );

  const filas = todos.reduce(
    (acc, item) => {
      (acc[item.asiento.fila] ??= []).push(item);
      return acc;
    },
    {} as Record<string, AsientoDeZona[]>,
  );

  // La fila "A" va pegada al recorrido (abajo del plano), así que se ordena
  // descendente: las letras más altas quedan arriba, cerca del ingreso.
  const filasOrdenadas = Object.entries(filas).sort(([a], [b]) => b.localeCompare(a));

  const columnas = Math.max(0, ...filasOrdenadas.map(([, items]) => items.length));

  const anchoGrid = columnas * (TAMANO_ASIENTO + ESPACIO) + ANCHO_FILA + 40;

  const seleccionadosIds = useMemo(() => new Set(seleccionados.map((a) => a.id)), [seleccionados]);

  // Vista general: toda la gradería en miniatura, mismas filas/columnas
  // reales, para que se vea "de frente" de un vistazo — a diferencia del
  // plano de abajo (a tamaño real, con scroll), esta nunca scrollea: la
  // altura queda fija y el ancho de cada asiento se achica solo según
  // cuántas columnas haya. No es clickeable asiento por asiento (son
  // px de un par de píxeles); sirve para ubicarse y para saltar de lugar.
  const vistaGeneral = useMemo(
    () => (
      <div
        className="grid h-full w-full gap-px"
        style={{
          gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${filasOrdenadas.length}, 1fr)`,
        }}
      >
        {filasOrdenadas.flatMap(([, items]) =>
          items
            .slice()
            .sort((a, b) => a.asiento.columna - b.asiento.columna)
            .map(({ zona, asiento }) => (
              <div
                key={asiento.id}
                style={{
                  backgroundColor: colorMiniCelda(asiento, zona.color, seleccionadosIds.has(asiento.id)),
                }}
              />
            )),
        )}
      </div>
    ),
    [filasOrdenadas, columnas, seleccionadosIds],
  );

  // Radar de scroll: con planos de cientos de asientos en una sola fila
  // horizontal, es fácil perder de vista en qué parte del ancho total estás
  // parado. La vista general de arriba marca qué porción está visible ahora
  // mismo — clic o arrastre saltan directo ahí.
  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;

    function medir() {
      if (!el) return;
      setScrollInfo({ left: el.scrollLeft, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth });
    }

    medir();
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [anchoGrid]);

  function irARatio(ratio: number) {
    const el = contenedorRef.current;
    if (!el) return;
    const maximo = Math.max(0, el.scrollWidth - el.clientWidth);
    const destino = ratio * el.scrollWidth - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, Math.min(destino, maximo)), behavior: arrastrandoRef.current ? "auto" : "smooth" });
  }

  function ratioDesdeEvento(clientX: number): number {
    const radar = radarRef.current;
    if (!radar) return 0;
    const rect = radar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function iniciarArrastre(e: React.PointerEvent) {
    arrastrandoRef.current = true;
    irARatio(ratioDesdeEvento(e.clientX));
  }

  useEffect(() => {
    function mover(e: PointerEvent) {
      if (!arrastrandoRef.current) return;
      irARatio(ratioDesdeEvento(e.clientX));
    }
    function soltar() {
      arrastrandoRef.current = false;
    }
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
    };
  }, []);

  const necesitaRadar = scrollInfo.scrollWidth > scrollInfo.clientWidth + 8;
  const ratioInicio = scrollInfo.scrollWidth > 0 ? scrollInfo.left / scrollInfo.scrollWidth : 0;
  const ratioAncho =
    scrollInfo.scrollWidth > 0 ? Math.min(1, scrollInfo.clientWidth / scrollInfo.scrollWidth) : 1;

  // El scroll horizontal mueve la vista por columnas (el ancho de la
  // gradería), no por filas — todas las filas se ven siempre a la vez. El
  // sector describe en criollo qué tramo de ese ancho estás mirando, y el
  // rango de columnas da el dato exacto para quien prefiere números.
  const ratioCentro = ratioInicio + ratioAncho / 2;
  const sector =
    ratioCentro < 0.22
      ? "extremo izquierdo"
      : ratioCentro < 0.42
        ? "sector izquierdo"
        : ratioCentro < 0.58
          ? "centro"
          : ratioCentro < 0.78
            ? "sector derecho"
            : "extremo derecho";
  const columnaDesde = Math.max(1, Math.round(ratioInicio * columnas));
  const columnaHasta = Math.min(columnas, Math.max(columnaDesde, Math.round((ratioInicio + ratioAncho) * columnas)));

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-brand-900">
          Selecciona tus asientos
        </h2>

        <p className="text-ink-muted">
          Tocá un asiento para elegirlo. Podés combinar asientos de distintas zonas en una misma compra.
        </p>
      </div>

      <div className="flex flex-wrap gap-5">
        <Legend color="bg-gray-400" text="Ocupado" />
        <Legend color="bg-purple-500" text="Asientos en Reventa" />
        <Legend color="border-2 border-gray-300 bg-white" text="No disponible" />
        {/* "Seleccionado" no tiene un color propio (ver colorMiniCelda /
            asiento.tsx) — se marca con anillo + check sobre el color real de
            la zona, así que la leyenda muestra eso en vez de un color fijo. */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-4 w-4 items-center justify-center rounded bg-brand-300 ring-2 ring-white ring-offset-1 ring-offset-gold-500">
            <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm">Seleccionado</span>
        </div>
      </div>

      {/* Zonas + radar quedan pegados (sticky) arriba mientras se scrollea la
          página: antes la leyenda de zonas solo aparecía una vez al
          principio y se perdía apenas bajabas — con varias zonas de colores
          parecidos, no tener siempre a la vista "qué color es cuál" es
          justo lo que hacía confusa la selección. */}
      <div className="sticky top-(--header-h) z-20 space-y-3 rounded-xl border border-brand-200 bg-white/95 p-3 backdrop-blur-sm">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-faint">Zonas</p>
          <div className="flex flex-wrap gap-2">
            {zonas.map((zona) => {
              const precioMin = zona.asientos.length > 0 ? Math.min(...zona.asientos.map((a) => a.precio)) : 0;
              return (
                <span
                  key={zona.id}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-900"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: zona.color }}
                  />
                  {zona.nombre} · Desde Bs {precioMin}
                </span>
              );
            })}
          </div>
        </div>

        {necesitaRadar && (
          <div className="border-t border-brand-100 pt-3">
            <p className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
              <span className="font-semibold text-ink">
                📍 Viendo el <span className="text-brand-600">{sector}</span> de la gradería
                <span className="font-normal text-ink-subtle">
                  {" "}
                  · columnas {columnaDesde}–{columnaHasta} de {columnas}
                </span>
              </span>
              <span className="font-normal text-ink-faint">Tocá o arrastrá la gradería de abajo para moverte</span>
            </p>

            <div
              ref={radarRef}
              onPointerDown={iniciarArrastre}
              className="relative h-20 w-full cursor-pointer overflow-hidden rounded-lg bg-brand-50 p-1 ring-1 ring-brand-200 sm:h-24"
            >
              {vistaGeneral}
              <div
                className="pointer-events-none absolute inset-y-1 rounded-sm ring-2 ring-brand-900 transition-all duration-75"
                style={{
                  left: `${ratioInicio * 100}%`,
                  width: `${Math.max(ratioAncho * 100, 3)}%`,
                  boxShadow: "0 0 0 1000px rgba(255,255,255,0.35)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white shadow-sm">
        <div ref={contenedorRef} className="overflow-x-auto overflow-y-hidden p-4">
          <div
            className="space-y-4"
            style={{
              width: `${anchoGrid}px`,
            }}
          >
            <MarqueeBanner texto="Ingreso Graderia" variante="entrada" />

            {filasOrdenadas.map(([fila, items]) => (
              <div key={fila} className="flex items-center gap-2">
                <div className="w-8 text-center font-bold text-brand-900">
                  {fila}
                </div>

                <div className="flex gap-2">
                  {items
                    .sort((a, b) => a.asiento.columna - b.asiento.columna)
                    .map(({ zona, asiento }) => (
                      <Asiento
                        key={asiento.id}
                        asiento={asiento}
                        colorZona={zona.color}
                        nombreZona={zona.nombre}
                        seleccionado={seleccionados.some(
                          (s) => s.id === asiento.id,
                        )}
                        onClick={onToggle}
                      />
                    ))}
                </div>
              </div>
            ))}

            <MarqueeBanner texto="Entrada del Carnaval de Oruro" variante="recorrido" />
          </div>
        </div>

        <div className="border-t border-brand-100 bg-brand-100 px-4 py-2 text-center text-sm text-ink-subtle lg:hidden">
          ← Desliza horizontalmente para ver todos los asientos →
        </div>
      </div>
    </section>
  );
}

type LegendProps = {
  color: string;
  text: string;
};

function Legend({ color, text }: LegendProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-4 rounded ${color}`} />
      <span className="text-sm">{text}</span>
    </div>
  );
}
