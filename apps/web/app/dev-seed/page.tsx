"use client";

// 🧪 SOLO DEV — borrar esta página antes de producción. Siembra compras
// confirmadas de ejemplo (Primer Convite + Carnaval de Oruro, varios
// compradores, varias graderías) usando las mismas funciones reales que usa
// la app (registrarCompra/confirmarCompra), corriendo en el propio navegador
// del usuario — nada de pegar código en la consola.
//
// NO toca asignaciones de dueño: Experiencia Gold (predio-212) ya viene
// asignada al dueño demo por defecto (ver enriquecer-graderias.ts), así que
// sus compras ya son visibles en /reportes sin tocar nada más. Si en una
// corrida anterior de esta página se llegaron a asignar las otras 5
// graderías al dueño demo (versión previa de este seed), se deshace acá.
import { useState } from "react";
import Link from "next/link";
import { registrarCompra, confirmarCompra } from "../lib/compra/compra";
import { desasignarGraderia } from "../lib/admin/asignaciones";
import type { EventoId } from "../../../../packages/types/evento";

type AsientoSeed = { fila: string; numero: string; precio: number; zonaId: string; zonaNombre: string };

type CompraSeed = {
  userId: string;
  graderiaId: string;
  graderiaNombre: string;
  eventoId: EventoId;
  asientos: AsientoSeed[];
};

const GRADERIAS: Record<string, { nombre: string; precio: number }> = {
  "predio-212": { nombre: "Experiencia Gold (100-A)", precio: 500 },
  "predio-209": { nombre: "Red Zone (100-B)", precio: 153 },
  "predio-210": { nombre: "Cultural Zone (100-C)", precio: 153 },
  "predio-213": { nombre: "Heroes del Chaco entre Pasaje C G. y P. Oblitas (100-D)", precio: 153 },
  "predio-208": { nombre: "Heroes del Chaco entre Pasaje C G. y P. Oblitas (100-E)", precio: 153 },
  "predio-216": { nombre: "6 de Agosto entre P. Oblitas y Villarroel (110-A)", precio: 153 },
};

function asientos(graderiaId: string, fila: string, desde: number, cantidad: number): AsientoSeed[] {
  const { precio } = GRADERIAS[graderiaId]!;
  const zonaId = `${graderiaId}-z1`;
  return Array.from({ length: cantidad }, (_, i) => ({
    fila,
    numero: `${fila}-${String(desde + i).padStart(2, "0")}`,
    precio,
    zonaId,
    zonaNombre: "Zona Unica",
  }));
}

function compra(userId: string, graderiaId: string, eventoId: EventoId, fila: string, desde: number, cantidad: number): CompraSeed {
  return {
    userId,
    graderiaId,
    graderiaNombre: GRADERIAS[graderiaId]!.nombre,
    eventoId,
    asientos: asientos(graderiaId, fila, desde, cantidad),
  };
}

const COMPRAS: CompraSeed[] = [
  // 5 ventas de distintos usuarios en Primer Convite (6 graderías distintas)
  compra("seed-buyer-01", "predio-212", "primerConvite", "A", 1, 4),
  compra("seed-buyer-02", "predio-209", "primerConvite", "B", 1, 6),
  compra("seed-buyer-03", "predio-210", "primerConvite", "C", 1, 3),
  compra("seed-buyer-04", "predio-213", "primerConvite", "D", 1, 5),
  compra("seed-buyer-05", "predio-216", "primerConvite", "A", 5, 3),
  // 5 ventas de distintos usuarios en Carnaval de Oruro
  compra("seed-buyer-06", "predio-212", "carnaval", "B", 1, 5),
  compra("seed-buyer-07", "predio-209", "carnaval", "C", 1, 4),
  compra("seed-buyer-08", "predio-210", "carnaval", "B", 1, 6),
  compra("seed-buyer-09", "predio-213", "carnaval", "E", 1, 3),
  compra("seed-buyer-10", "predio-216", "carnaval", "B", 1, 4),
  // Cliente 1 (Juan Pérez, id "2") en 100-E
  compra("2", "predio-208", "primerConvite", "A", 1, 3),
  compra("2", "predio-208", "carnaval", "B", 1, 5),
  // Experiencia Gold: los clientes reales que tenemos
  compra("2", "predio-212", "primerConvite", "C", 1, 3),
  compra("2", "predio-212", "carnaval", "C", 1, 5),
  compra("4", "predio-212", "primerConvite", "D", 1, 4),
  compra("4", "predio-212", "carnaval", "D", 1, 3),
];

// Graderías que una corrida vieja de esta página llegó a asignarle al dueño
// demo de más (todas menos Experiencia Gold, que no las necesitaba).
const ASIGNACIONES_A_DESHACER = ["predio-209", "predio-210", "predio-213", "predio-216", "predio-208"];

function limpiarComprasSembradasAntes(): number {
  const raw = localStorage.getItem("tickest_compras");
  if (!raw) return 0;
  const actuales = JSON.parse(raw) as { asientos: { id: string }[] }[];
  const sinSeed = actuales.filter((c) => !c.asientos.some((a) => a.id.startsWith("seed-")));
  localStorage.setItem("tickest_compras", JSON.stringify(sinSeed));
  return actuales.length - sinSeed.length;
}

export default function DevSeedPage() {
  const [log, setLog] = useState<string[]>([]);
  const [corriendo, setCorriendo] = useState(false);
  const [listo, setListo] = useState(false);

  function sembrar() {
    setCorriendo(true);
    const lineas: string[] = [];

    // Idempotente: si ya se corrió antes, saca las compras del seed anterior
    // para no ir acumulando duplicados en cada click.
    const borradas = limpiarComprasSembradasAntes();
    if (borradas > 0) lineas.push(`↺ Se limpiaron ${borradas} compras de una corrida anterior.`);

    for (const graderiaId of ASIGNACIONES_A_DESHACER) desasignarGraderia(graderiaId);

    for (const c of COMPRAS) {
      const total = c.asientos.reduce((sum, a) => sum + a.precio, 0);
      const nueva = registrarCompra({
        userId: c.userId,
        graderiaId: c.graderiaId,
        graderiaNombre: c.graderiaNombre,
        eventoId: c.eventoId,
        asientos: c.asientos.map((a, i) => ({ ...a, id: `seed-${c.graderiaId}-${c.eventoId}-${a.numero}-${i}` })),
        total,
      });
      confirmarCompra(nueva.id);
      lineas.push(
        `✔ ${c.userId} · ${c.graderiaNombre} · ${c.eventoId} · ${c.asientos.length} asientos · Bs ${total}`,
      );
    }

    setLog(lineas);
    setCorriendo(false);
    setListo(true);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-2xl border border-dashed border-yellow-400 bg-yellow-50 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-700">🧪 Solo dev — borrar antes de producción</p>
        <h1 className="mt-2 text-2xl font-extrabold text-brand-900">Sembrar datos de ejemplo</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Crea {COMPRAS.length} compras confirmadas (Primer Convite + Carnaval de Oruro, varios compradores,
          6 graderías, incluyendo Experiencia Gold con Cliente 1 y Cliente 2). No toca asignaciones de dueño —
          Experiencia Gold ya viene asignada al dueño demo por defecto. Corre en este mismo navegador — no hace
          falta pegar nada en la consola. Se puede volver a apretar sin duplicar nada.
        </p>

        <button
          onClick={sembrar}
          disabled={corriendo}
          className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {corriendo ? "Sembrando…" : "Sembrar ahora"}
        </button>

        {log.length > 0 && (
          <pre className="mt-6 max-h-96 overflow-auto rounded-xl bg-white p-4 text-xs text-ink whitespace-pre-wrap">
            {log.join("\n")}
          </pre>
        )}

        {listo && (
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/misAsientos" className="rounded-full border border-brand-300 px-5 py-2.5 text-brand-900">
              Ver /misAsientos
            </Link>
            <Link href="/reportes" className="rounded-full border border-brand-300 px-5 py-2.5 text-brand-900">
              Ver /reportes
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
