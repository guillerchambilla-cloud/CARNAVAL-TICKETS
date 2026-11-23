"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { setDemoRole, type User } from "@repo/auth";
import { useGraderias } from "../lib/hooks/useGraderia";
import type { Graderia } from "../../../../packages/types/graderia";
import { EVENTOS, EVENTO_POR_DEFECTO, type EventoId } from "../../../../packages/types/evento";
import GestorVentas from "./components/GestorVentas";
import EditorZonas from "./components/EditorZonas";

export default function PanelGraderiaPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  // Primer Convite y Carnaval de Oruro se gestionan por separado: cada uno
  // tiene sus propias fases de venta y reservas del dueño (ver
  // lib/panel-graderia/disponibilidad.ts y asientos-reservados.ts).
  const [eventoId, setEventoId] = useState<EventoId>(EVENTO_POR_DEFECTO);
  const { graderias: graderiasCompletas, cargando } = useGraderias(eventoId, refreshKey);
  const [user, setUser] = useState<User | null>(null);
  const [gestionando, setGestionando] = useState<Graderia | null>(null);
  const [editandoZonas, setEditandoZonas] = useState<Graderia | null>(null);

  useEffect(() => {
    const currentUser = setDemoRole("duenioGrad");
    setUser(currentUser);
  }, []);

  const graderiasAsignadas = useMemo(
    () => graderiasCompletas.filter((graderia) => graderia.duenoId === user?.id),
    [graderiasCompletas, user],
  );

  function refrescar() {
    setRefreshKey((k) => k + 1);
  }

  if (!user || cargando)
    return (
      <main className="mx-auto flex min-h-[60vh] items-center justify-center">
        <p className="text-ink-muted">Cargando panel…</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-brand-50">
      <section className="bg-brand-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Panel de propietario
          </p>
          <h1 className="font-display mt-3 text-5xl uppercase sm:text-6xl">Hola, {user.name}</h1>
          <p className="mt-2 text-white/70">Gestiona la distribución y venta de tus graderías.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="inline-flex rounded-full border border-brand-200 bg-white p-1 shadow-sm">
          {EVENTOS.map((evento) => (
            <button
              key={evento.id}
              type="button"
              onClick={() => setEventoId(evento.id)}
              className={`relative rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                eventoId === evento.id ? "text-white" : "text-ink-muted hover:text-brand-900"
              }`}
            >
              {eventoId === evento.id && (
                <motion.span
                  layoutId="panel-evento-pill"
                  className="absolute inset-0 rounded-full bg-brand-600"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative">
                Gradería {evento.id === "primerConvite" ? "Convite" : "Carnaval"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <Resumen
          graderiasAsignadas={graderiasAsignadas}
          onEditarZonas={setEditandoZonas}
          onGestionarVentas={setGestionando}
        />
      </section>

      {editandoZonas && (
        <EditorZonas
          graderia={editandoZonas}
          eventoId={eventoId}
          onGuardado={refrescar}
          onClose={() => setEditandoZonas(null)}
        />
      )}
      {gestionando && (
        <GestorVentas
          graderia={gestionando}
          eventoId={eventoId}
          onClose={() => {
            setGestionando(null);
            refrescar();
          }}
        />
      )}
    </main>
  );
}

function Resumen({
  graderiasAsignadas,
  onEditarZonas,
  onGestionarVentas,
}: {
  graderiasAsignadas: Graderia[];
  onEditarZonas: (graderia: Graderia) => void;
  onGestionarVentas: (graderia: Graderia) => void;
}) {
  const capacidad = graderiasAsignadas.reduce((total, graderia) => total + graderia.capacidad, 0);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Metrica
          etiqueta="Graderias - Zonas"
          valor={String(graderiasAsignadas.reduce((total, graderia) => total + graderia.zonas.length, 0))}
        />
        <Metrica etiqueta="Capacidad Total de Graderias" valor={String(capacidad)} />
      </div>
      <div className="mt-9">
        <h2 className="text-2xl font-extrabold text-brand-900">Tus graderías</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Graderías reales asignadas a tu cuenta desde el panel de administración.
        </p>
      </div>
      {graderiasAsignadas.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center">
          <p className="text-ink-muted">
            Todavía no tenés graderías asignadas. Pedile a un administrador que te asigne
            una desde el panel de administración.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {graderiasAsignadas.map((graderia) => (
            <motion.article
              key={graderia.id}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="overflow-hidden rounded-[22px] border border-brand-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="h-2" style={{ backgroundColor: graderia.colorMapa }} />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                  {graderia.estado === "disponible"
                    ? "En venta"
                    : graderia.estado === "agotado"
                      ? "Agotada"
                      : "Próximamente"}
                </p>
                <h3 className="mt-2 min-h-14 font-bold leading-snug text-brand-900">
                  {graderia.nombre}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{graderia.ubicacion}</p>
                <div className="mt-5 flex justify-between rounded-xl bg-brand-100 p-3 text-sm">
                  <span>{graderia.capacidad} asientos</span>
                  <span>{graderia.zonas.length} zona(s)</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
                  <motion.button
                    onClick={() => onEditarZonas(graderia)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="rounded-lg border border-brand-300 px-2 py-2 text-brand-900 transition-colors hover:bg-brand-100"
                  >
                    Editar zonas
                  </motion.button>
                  <motion.button
                    onClick={() => onGestionarVentas(graderia)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="rounded-lg bg-brand-900 px-2 py-2 text-white transition-colors hover:bg-brand-950"
                  >
                    Ventas
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-[20px] border border-brand-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-ink-subtle">{etiqueta}</p>
      <p className="mt-2 text-3xl font-extrabold text-brand-900">{valor}</p>
    </div>
  );
}
