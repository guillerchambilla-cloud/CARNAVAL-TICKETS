"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useGraderiasResumen } from "../lib/hooks/useGraderia";

import ViewSwitcher from "./components/ViewSwitcher";
import GraderiaFiltersSidebar from "./components/GraderiaFiltersSidebar";
import GraderiaList from "./components/GraderiaList";
import GraderiaMap from "./components/GraderiaMap";
import { ORDEN_OPCIONES, type Orden } from "./components/ordenGraderias";

import { Graderia, EstadoGraderia } from "../../../../packages/types/graderia";

// useSearchParams() obliga a envolver la página en Suspense: sin esto,
// `next build` falla al intentar prerenderizar la ruta (mismo motivo que en
// app/login/page.tsx).
export default function GraderiasPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6">
          <p className="text-ink-muted">Cargando graderías…</p>
        </main>
      }
    >
      <GraderiasContent />
    </Suspense>
  );
}

function GraderiasContent() {
  const searchParams = useSearchParams();
  const { graderias, cargando } = useGraderiasResumen();
  // Deep link desde el detalle de una gradería ("Ver en el mapa" en
  // GraderiaHero, ?vista=mapa&id=xxx): abre directo en la vista de mapa. La
  // gradería en sí recién se puede seleccionar más abajo, cuando el catálogo
  // ya cargó (ver el useEffect que lee ?id=).
  const [view, setView] = useState<"list" | "map">(
    searchParams.get("vista") === "mapa" ? "map" : "list",
  );
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"todos" | EstadoGraderia>("todos");

  // 💰 NUEVO ESTADO: Precio máximo (0 significa que no hay límite/filtro activo)
  const [precioMaximo, setPrecioMaximo] = useState<number>(0);
  const [orden, setOrden] = useState<Orden>("recomendado");

  const [selected, setSelected] = useState<Graderia | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const idParam = searchParams.get("id");
    if (!idParam || graderias.length === 0) return;
    const encontrada = graderias.find((g) => g.id === idParam);
    if (encontrada) setSelected(encontrada);
    // Solo nos importa una vez, cuando el catálogo recién cargó — no en
    // cada cambio de searchParams (p. ej. al tocar filtros más adelante).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graderias]);

  // Coincidencia solo por texto — base para los contadores del sidebar (cada
  // filtro de estado/precio se cuenta sobre este subconjunto, no sobre el ya
  // filtrado por los otros dos, igual que los contadores de Booking no caen
  // a 0 apenas marcás una opción de la misma categoría).
  const graderiasPorBusqueda = useMemo(() => {
    const termino = search.toLowerCase();
    return graderias.filter(
      (g) =>
        g.nombre.toLowerCase().includes(termino) ||
        g.ubicacion.toLowerCase().includes(termino) ||
        (g.codigo && g.codigo.toLowerCase().includes(termino)) ||
        (g.cuadra && g.cuadra.toLowerCase().includes(termino)) ||
        (g.propietario && g.propietario.toLowerCase().includes(termino)),
    );
  }, [graderias, search]);

  const conteoPorEstado = useMemo(() => {
    const conteo: Record<EstadoGraderia, number> = { disponible: 0, agotado: 0, proximamente: 0 };
    for (const g of graderiasPorBusqueda) conteo[g.estado]++;
    return conteo;
  }, [graderiasPorBusqueda]);

  const conteoPorPrecio = useMemo(() => {
    const conteo: Record<number, number> = {};
    for (const rango of [300, 500, 800, 1000]) {
      conteo[rango] = graderiasPorBusqueda.filter((g) => g.precioMin <= rango).length;
    }
    return conteo;
  }, [graderiasPorBusqueda]);

  // 🔍 Filtro optimizado incluyendo el precio
  const graderiasFiltradas = useMemo(() => {
    const filtradas = graderiasPorBusqueda.filter((g) => {
      const coincideEstado = estado === "todos" || g.estado === estado;
      // Evalúa si el precio mínimo de la gradería entra en el presupuesto del usuario
      const coincidePrecio = precioMaximo === 0 || g.precioMin <= precioMaximo;
      return coincideEstado && coincidePrecio;
    });

    if (orden === "precio-asc") return [...filtradas].sort((a, b) => a.precioMin - b.precioMin);
    if (orden === "precio-desc") return [...filtradas].sort((a, b) => b.precioMin - a.precioMin);
    if (orden === "capacidad-desc") return [...filtradas].sort((a, b) => b.capacidad - a.capacidad);
    return filtradas;
  }, [graderiasPorBusqueda, estado, precioMaximo, orden]);

  // 🛡️ Seguridad de selección al filtrar
  useEffect(() => {
    if (selected) {
      const sigueExistiendo = graderiasFiltradas.some((g) => g.id === selected.id);
      if (!sigueExistiendo) {
        setSelected(graderiasFiltradas[0] || null);
      }
    }
  }, [graderiasFiltradas, selected]);

  if (cargando) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6">
        <p className="text-ink-muted">Cargando graderías…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-360 px-6 pb-16 pt-10 sm:pb-20 lg:px-15 xl:px-30">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
          Carnaval de Oruro
        </p>
        <h1 className="font-display mt-2 text-5xl uppercase text-brand-900 sm:text-6xl">
          Graderías
        </h1>
        <p className="mt-2 max-w-xl text-ink-muted">
          Elegí dónde vas a vivir la Entrada — buscá por ubicación, precio o
          disponibilidad.
        </p>
      </div>

      <div className="mb-5 lg:hidden">
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="graderia-filters-mobile"
          onClick={() => setFiltersOpen((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-900 shadow-sm"
        >
          <span>Filtros y búsqueda</span>
          <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
        </button>
        {filtersOpen && (
          <div id="graderia-filters-mobile" className="mt-3">
            <GraderiaFiltersSidebar
              search={search}
              onSearchChange={setSearch}
              estado={estado}
              onEstadoChange={setEstado}
              precioMaximo={precioMaximo}
              onPrecioMaximoChange={setPrecioMaximo}
              conteoPorEstado={conteoPorEstado}
              conteoPorPrecio={conteoPorPrecio}
            />
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <GraderiaFiltersSidebar
            search={search}
            onSearchChange={setSearch}
            estado={estado}
            onEstadoChange={setEstado}
            precioMaximo={precioMaximo}
            onPrecioMaximoChange={setPrecioMaximo}
            conteoPorEstado={conteoPorEstado}
            conteoPorPrecio={conteoPorPrecio}
          />
        </div>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-ink">
              <span className="text-brand-900">{graderiasFiltradas.length}</span>{" "}
              {graderiasFiltradas.length === 1 ? "gradería encontrada" : "graderías encontradas"}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                Ordenar por
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as Orden)}
                  className="cursor-pointer rounded-full border border-brand-200 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none transition-colors focus:border-brand-600"
                >
                  {ORDEN_OPCIONES.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </label>

              <ViewSwitcher view={view} onChange={setView} />
            </div>
          </div>

          {view === "list" && (
            <GraderiaList
              graderias={graderiasFiltradas}
              onVerEnMapa={(graderia) => {
                setSelected(graderia);
                setView("map");
              }}
            />
          )}

          {view === "map" && (
            <GraderiaMap
              graderias={graderiasFiltradas}
              selected={selected}
              onSelect={setSelected}
              onClose={() => setView("list")}
              search={search}
              onSearchChange={setSearch}
              estado={estado}
              onEstadoChange={setEstado}
              precioMaximo={precioMaximo}
              onPrecioMaximoChange={setPrecioMaximo}
              conteoPorEstado={conteoPorEstado}
              conteoPorPrecio={conteoPorPrecio}
              orden={orden}
              onOrdenChange={setOrden}
            />
          )}
        </div>
      </div>
    </main>
  );
}
