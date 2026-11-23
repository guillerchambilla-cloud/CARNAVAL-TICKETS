"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { setDemoRole, USERS, type User } from "@repo/auth";
import { graderias as graderiasBase } from "../lib/compra/enriquecer-graderias";
import {
  leerAsignaciones,
  asignarGraderia,
  desasignarGraderia,
} from "../lib/admin/asignaciones";

const LIMITE_RESULTADOS = 30;

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [asignaciones, setAsignaciones] = useState<Record<string, string>>({});
  const [busqueda, setBusqueda] = useState("");
  const [duenoActivo, setDuenoActivo] = useState("");

  const duenos = useMemo(() => USERS.filter((item) => item.role === "duenioGrad"), []);

  useEffect(() => {
    const currentUser = setDemoRole("admin");
    setUser(currentUser);
    setAsignaciones(leerAsignaciones());
    setDuenoActivo((actual) => actual || duenos[0]?.id || "");
  }, [duenos]);

  function duenoDe(graderiaId: string, duenoIdBase?: string): string | undefined {
    return asignaciones[graderiaId] ?? duenoIdBase;
  }

  function nombreDueno(duenoId?: string): string {
    if (!duenoId) return "Sin asignar";
    return duenos.find((item) => item.id === duenoId)?.name ?? "Desconocido";
  }

  function asignar(graderiaId: string) {
    if (!duenoActivo) return;
    asignarGraderia(graderiaId, duenoActivo);
    setAsignaciones((actuales) => ({ ...actuales, [graderiaId]: duenoActivo }));
  }

  function quitar(graderiaId: string) {
    desasignarGraderia(graderiaId);
    setAsignaciones((actuales) => {
      const restantes = { ...actuales };
      delete restantes[graderiaId];
      return restantes;
    });
  }

  const { resultados, total } = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return { resultados: [], total: 0 };
    const coincidencias = graderiasBase.filter(
      (g) =>
        g.nombre.toLowerCase().includes(termino) ||
        g.ubicacion.toLowerCase().includes(termino) ||
        (g.codigo?.toLowerCase().includes(termino) ?? false),
    );
    return {
      resultados: coincidencias.slice(0, LIMITE_RESULTADOS),
      total: coincidencias.length,
    };
  }, [busqueda]);

  const graderiasPorDueno = useMemo(() => {
    const mapa = new Map<string, number>();
    graderiasBase.forEach((g) => {
      const id = duenoDe(g.id, g.duenoId);
      if (id) mapa.set(id, (mapa.get(id) ?? 0) + 1);
    });
    return mapa;
  }, [asignaciones]);

  const graderiasDelDuenoActivo = useMemo(
    () => graderiasBase.filter((g) => duenoDe(g.id, g.duenoId) === duenoActivo),
    [asignaciones, duenoActivo],
  );

  if (!user)
    return (
      <main className="mx-auto flex min-h-[60vh] items-center justify-center">
        <p className="text-ink-muted">Cargando panel…</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-brand-50">
      <section className="bg-brand-950 px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gold-500">
              <span className="h-px w-8 bg-gold-500" />
              Panel de administración
            </p>
            <h1 className="font-display mt-3 text-4xl uppercase sm:text-5xl">
              Asignar graderías a dueños
            </h1>
            <p className="mt-2 text-white/70">
              Elegí un dueño y buscá entre las graderías reales del catálogo para asignárselas.
            </p>
          </div>
          <Link
            href="/street-view-graderias"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Ver graderías en street view →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">
              Dueños de la demo
            </p>
            {duenos.map((dueno) => (
              <button
                key={dueno.id}
                onClick={() => setDuenoActivo(dueno.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  duenoActivo === dueno.id
                    ? "border-brand-600 bg-brand-100"
                    : "border-brand-200 bg-white hover:border-brand-300"
                }`}
              >
                <p className="font-bold text-brand-900">{dueno.name}</p>
                <p className="text-xs text-ink-subtle">{dueno.numeroCelular}</p>
                <p className="mt-2 text-xs font-semibold text-brand-600">
                  {graderiasPorDueno.get(dueno.id) ?? 0} gradería(s) asignada(s)
                </p>
              </button>
            ))}
          </aside>

          <div className="space-y-8">
            <div className="rounded-[24px] border border-brand-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Buscar en el catálogo
              </p>
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Nombre, ubicación o código del predio…"
                className="campo mt-3"
              />
              {busqueda.trim() && (
                <p className="mt-2 text-xs text-ink-subtle">
                  {total === 0
                    ? "Sin resultados."
                    : total > LIMITE_RESULTADOS
                      ? `Mostrando ${LIMITE_RESULTADOS} de ${total} resultados — afiná la búsqueda para ver el resto.`
                      : `${total} resultado(s).`}
                </p>
              )}
              <div className="mt-4 space-y-2">
                {resultados.map((graderia) => {
                  const actual = duenoDe(graderia.id, graderia.duenoId);
                  const asignadaAlActivo = actual === duenoActivo;
                  return (
                    <div
                      key={graderia.id}
                      className="flex flex-col gap-2 rounded-xl bg-brand-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-900">{graderia.nombre}</p>
                        <p className="truncate text-xs text-ink-subtle">
                          {graderia.ubicacion} · Dueño actual: {nombreDueno(actual)}
                        </p>
                      </div>
                      {asignadaAlActivo ? (
                        <button
                          onClick={() => quitar(graderia.id)}
                          className="shrink-0 rounded-full border border-brand-200 px-4 py-2 text-xs font-bold text-brand-600 transition-colors hover:bg-brand-100"
                        >
                          Quitar asignación
                        </button>
                      ) : (
                        <button
                          onClick={() => asignar(graderia.id)}
                          disabled={!duenoActivo}
                          className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
                        >
                          Asignar a {nombreDueno(duenoActivo)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-brand-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Graderías de {nombreDueno(duenoActivo)}
              </p>
              {graderiasDelDuenoActivo.length === 0 ? (
                <p className="mt-3 text-sm text-ink-subtle">
                  Este dueño todavía no tiene graderías asignadas.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {graderiasDelDuenoActivo.map((graderia) => (
                    <div
                      key={graderia.id}
                      className="flex items-center justify-between rounded-xl bg-brand-100 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-900">{graderia.nombre}</p>
                        <p className="truncate text-xs text-ink-subtle">{graderia.ubicacion}</p>
                      </div>
                      <button
                        onClick={() => quitar(graderia.id)}
                        className="shrink-0 text-xs font-bold text-brand-600 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
