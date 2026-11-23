"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { setDemoRole, USERS, type User } from "@repo/auth";
import { useGraderias } from "../lib/hooks/useGraderia";
import { getComprasByGraderia } from "../lib/compra/compra";
import type { Graderia } from "../../../../packages/types/graderia";
import { EVENTOS, EVENTO_POR_DEFECTO, nombreEvento, type EventoId } from "../../../../packages/types/evento";

type AsientoVendidoDetalle = {
  zonaNombre: string;
  fila: string;
  numero: string;
  precio: number;
  compradorNombre: string;
  ticket: string;
};

// 🧪 SOLO DEV — nombres de ejemplo para compradores de la demo que no son
// cuentas reales del mock de auth (USERS), como los `seed-buyer-XX` usados
// para poblar reportes con ventas de "distintos usuarios". Sin esto,
// USERS.find no los encuentra y la tabla queda con "—" en Comprador.
const COMPRADORES_DEMO: Record<string, string> = {
  "seed-buyer-01": "María Fernández",
  "seed-buyer-02": "Carlos Mamani",
  "seed-buyer-03": "Daniela Rojas",
  "seed-buyer-04": "Jorge Choque",
  "seed-buyer-05": "Valeria Guzmán",
  "seed-buyer-06": "Pablo Ticona",
  "seed-buyer-07": "Andrea Salazar",
  "seed-buyer-08": "Fernando Apaza",
  "seed-buyer-09": "Camila Vargas",
  "seed-buyer-10": "Ricardo Flores",
};

function listarAsientosVendidos(graderiaId: string, eventoId: EventoId): AsientoVendidoDetalle[] {
  const compras = getComprasByGraderia(graderiaId, eventoId);
  return compras
    .flatMap((compra) => {
      const compradorNombre =
        USERS.find((u) => u.id === compra.userId)?.name ?? COMPRADORES_DEMO[compra.userId] ?? "—";
      return compra.asientos.map((asiento) => ({
        zonaNombre: asiento.zonaNombre,
        fila: asiento.fila,
        numero: asiento.numero,
        precio: asiento.precio,
        compradorNombre,
        ticket: compra.id,
      }));
    })
    .sort(
      (a, b) =>
        a.zonaNombre.localeCompare(b.zonaNombre) ||
        a.fila.localeCompare(b.fila) ||
        a.numero.localeCompare(b.numero),
    );
}

async function descargarPDF(graderia: Graderia, eventoId: EventoId, asientos: AsientoVendidoDetalle[]) {
  // jspdf resuelve normalmente a una variante para Node (usa fflate con
  // workers) que Next intenta empaquetar en el bundle de SSR de este Client
  // Component y falla ("Module not found: Can't resolve <dynamic>"), incluso
  // con import() dinámico (igual se intenta resolver para el server).
  // Apuntar directo al build de navegador evita esa resolución por completo.
  const { default: jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
  const doc = new jsPDF();
  const izq = 14;
  const columnas = [
    { titulo: "Zona", x: izq, ancho: 30 },
    { titulo: "Fila", x: izq + 32, ancho: 12 },
    { titulo: "Asiento", x: izq + 46, ancho: 20 },
    { titulo: "Precio", x: izq + 68, ancho: 22 },
    { titulo: "Comprador", x: izq + 92, ancho: 48 },
    { titulo: "Ticket", x: izq + 142, ancho: 55 },
  ];
  let y = 20;

  function encabezado() {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    columnas.forEach((col) => doc.text(col.titulo, col.x, y));
    y += 2;
    doc.line(izq, y, 197, y);
    y += 5;
    doc.setFont("helvetica", "normal");
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(graderia.nombre, izq, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${graderia.ubicacion} · ${nombreEvento(eventoId)}`, izq, y);
  y += 6;
  doc.text(`Asientos vendidos: ${asientos.length} · Generado: ${new Date().toLocaleDateString("es-BO")}`, izq, y);
  y += 10;

  encabezado();
  for (const asiento of asientos) {
    if (y > 280) {
      doc.addPage();
      y = 20;
      encabezado();
    }
    doc.setFontSize(8);
    doc.text(asiento.zonaNombre, columnas[0]!.x, y, { maxWidth: columnas[0]!.ancho });
    doc.text(asiento.fila, columnas[1]!.x, y);
    doc.text(asiento.numero, columnas[2]!.x, y);
    doc.text(`Bs ${asiento.precio.toFixed(2)}`, columnas[3]!.x, y);
    doc.text(asiento.compradorNombre, columnas[4]!.x, y, { maxWidth: columnas[4]!.ancho });
    doc.text(asiento.ticket, columnas[5]!.x, y, { maxWidth: columnas[5]!.ancho });
    y += 6;
  }

  doc.save(`asientos-vendidos-${graderia.nombre.replace(/\s+/g, "-").toLowerCase()}-${eventoId}.pdf`);
}

type ReporteGraderia = {
  graderia: Graderia;
  ingresos: number;
  asientosVendidos: number;
  ocupacion: number;
};

export default function ReportesPage() {
  // Primer Convite y Carnaval de Oruro se venden por separado, así que los
  // reportes también se ven por separado — mismo criterio que el panel de
  // Ventas (ver panel-graderia/page.tsx).
  const [eventoId, setEventoId] = useState<EventoId>(EVENTO_POR_DEFECTO);
  const { graderias, cargando } = useGraderias(eventoId);
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [graderiaDetalle, setGraderiaDetalle] = useState<Graderia | null>(null);

  useEffect(() => {
    const currentUser = setDemoRole("duenioGrad");
    setUser(currentUser);
    setChecked(true);
  }, []);

  const graderiasAsignadas = useMemo(
    () => graderias.filter((graderia) => graderia.duenoId === user?.id),
    [graderias, user],
  );

  // Reporte de ventas confirmadas por gradería (compras oficiales + entradas
  // adquiridas en reventa: getComprasByGraderia no distingue origen, así que
  // ambas ya quedan contempladas).
  const reporte: ReporteGraderia[] = useMemo(
    () =>
      graderiasAsignadas.map((graderia) => {
        const compras = getComprasByGraderia(graderia.id, eventoId);
        const asientosVendidos = compras.reduce((total, compra) => total + compra.asientos.length, 0);
        const ingresos = compras.reduce((total, compra) => total + compra.total, 0);
        const ocupacion = graderia.capacidad > 0 ? (asientosVendidos / graderia.capacidad) * 100 : 0;
        return { graderia, ingresos, asientosVendidos, ocupacion };
      }),
    [graderiasAsignadas, eventoId],
  );

  const totales = useMemo(
    () => ({
      ingresos: reporte.reduce((total, r) => total + r.ingresos, 0),
      asientosVendidos: reporte.reduce((total, r) => total + r.asientosVendidos, 0),
      capacidad: graderiasAsignadas.reduce((total, g) => total + g.capacidad, 0),
    }),
    [reporte, graderiasAsignadas],
  );

  const ocupacionPromedio = totales.capacidad > 0 ? (totales.asientosVendidos / totales.capacidad) * 100 : 0;

  if (!checked || !user || cargando)
    return (
      <main className="mx-auto flex min-h-[60vh] items-center justify-center">
        <p className="text-ink-muted">Cargando reportes…</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-brand-50">
      <section className="bg-brand-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Panel de propietario
          </p>
          <h1 className="font-display mt-3 text-5xl uppercase sm:text-6xl">Reportes</h1>
          <p className="mt-2 text-white/70">
            Ventas confirmadas en tus graderías  para {nombreEvento(eventoId)}.
          </p>
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
                  layoutId="reportes-evento-pill"
                  className="absolute inset-0 rounded-full bg-brand-600"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span className="relative">
                Reporte {evento.id === "primerConvite" ? "Convite" : "Carnaval"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metrica etiqueta="Ingresos totales" valor={`Bs ${totales.ingresos.toFixed(2)}`} />
          <Metrica etiqueta="Asientos vendidos" valor={`${totales.asientosVendidos} / ${totales.capacidad}`} />
          <Metrica etiqueta="Ocupación promedio" valor={`${ocupacionPromedio.toFixed(0)}%`} />
        </div>

        <div className="mt-9">
          <h2 className="text-2xl font-extrabold text-brand-900">Por gradería</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Detalle de ingresos y ocupación de cada gradería que administrás.
          </p>
        </div>

        {reporte.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center">
            <p className="text-ink-muted">
              Todavía no tenés graderías asignadas, así que no hay nada que reportar.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reporte.map(({ graderia, ingresos, asientosVendidos, ocupacion }) => (
              <article
                key={graderia.id}
                className="overflow-hidden rounded-[22px] border border-brand-200 bg-white shadow-sm"
              >
                <div className="h-2" style={{ backgroundColor: graderia.colorMapa }} />
                <div className="p-5">
                  <h3 className="min-h-14 font-bold leading-snug text-brand-900">
                    {graderia.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">{graderia.ubicacion}</p>

                  <div className="mt-5 space-y-2 rounded-xl bg-brand-100 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-subtle">Ingresos</span>
                      <strong className="text-brand-900">Bs {ingresos.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-subtle">Asientos vendidos</span>
                      <strong className="text-brand-900">
                        {asientosVendidos} / {graderia.capacidad}
                      </strong>
                    </div>
                    <div className="flex justify-between border-t border-brand-200 pt-2">
                      <span className="text-ink-subtle">Ocupación</span>
                      <strong className="text-brand-900">{ocupacion.toFixed(0)}%</strong>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-brand-200">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${Math.min(ocupacion, 100)}%` }}
                    />
                  </div>

                  <button
                    onClick={() => setGraderiaDetalle(graderia)}
                    className="mt-4 w-full rounded-full border border-brand-300 py-2.5 text-sm font-bold text-brand-900 hover:bg-brand-100"
                  >
                    Ver asientos vendidos
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {graderiaDetalle && (
        <DetalleAsientosModal
          graderia={graderiaDetalle}
          eventoId={eventoId}
          onClose={() => setGraderiaDetalle(null)}
        />
      )}
    </main>
  );
}

function DetalleAsientosModal({
  graderia,
  eventoId,
  onClose,
}: {
  graderia: Graderia;
  eventoId: EventoId;
  onClose: () => void;
}) {
  const asientos = useMemo(() => listarAsientosVendidos(graderia.id, eventoId), [graderia.id, eventoId]);

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="mx-auto min-h-full max-w-4xl rounded-[28px] bg-brand-50 shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-brand-950 px-6 py-6 text-white sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500">
              Asientos vendidos · {nombreEvento(eventoId)}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold wrap-break-word">{graderia.nombre}</h2>
            <p className="mt-1 text-sm text-white/70">
              {graderia.ubicacion} · {asientos.length} asiento(s) vendido(s)
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 text-3xl leading-none text-white/80" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted">
              Listado de asientos vendidos, con la zona, el comprador y el número de ticket de cada uno.
            </p>
            <motion.button
              onClick={() => descargarPDF(graderia, eventoId, asientos)}
              disabled={asientos.length === 0}
              whileHover={asientos.length === 0 ? undefined : { y: -2 }}
              whileTap={asientos.length === 0 ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="shrink-0 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Descargar PDF
            </motion.button>
          </div>

          {asientos.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-white p-10 text-center">
              <p className="text-ink-muted">Todavía no hay asientos vendidos en esta gradería.</p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-brand-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-200 text-xs font-bold uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-3">Zona</th>
                    <th className="px-4 py-3">Fila</th>
                    <th className="px-4 py-3">Asiento</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Comprador</th>
                    <th className="px-4 py-3">Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {asientos.map((asiento, index) => (
                    <tr key={`${asiento.ticket}-${asiento.fila}-${asiento.numero}-${index}`} className="border-b border-brand-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-brand-900">{asiento.zonaNombre}</td>
                      <td className="px-4 py-3 text-ink-muted">{asiento.fila}</td>
                      <td className="px-4 py-3 text-ink-muted">{asiento.numero}</td>
                      <td className="px-4 py-3 text-ink-muted">Bs {asiento.precio.toFixed(2)}</td>
                      <td className="px-4 py-3 text-ink-muted">{asiento.compradorNombre}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{asiento.ticket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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
