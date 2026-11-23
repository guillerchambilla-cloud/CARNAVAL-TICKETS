import type { Compra } from "../../../../../packages/types/compra";
import type { EventoId } from "../../../../../packages/types/evento";

const KEY = "tickest_compras";

function generarId(): string {
  return `TCK-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function leerTodas(): Compra[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

function guardarTodas(compras: Compra[]): void {
  localStorage.setItem(KEY, JSON.stringify(compras));
}

export function registrarCompra(
  data: Omit<Compra, "id" | "fecha" | "estado" | "codigoQR">,
): Compra {
  const compra: Compra = {
    ...data,
    id: generarId(),
    fecha: new Date().toISOString(),
    estado: "pendiente",
    codigoQR: generarId(),
  };

  const todas = leerTodas();
  todas.push(compra);
  guardarTodas(todas);

  return compra;
}

export function confirmarCompra(id: string): Compra | null {
  const todas = leerTodas();
  const idx = todas.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const existente = todas[idx];
  if (!existente) return null;

  const compraActualizada: Compra = {
    ...existente,
    estado: "confirmada",
  };

  todas[idx] = compraActualizada;
  guardarTodas(todas);

  return compraActualizada;
}

export function getComprasByUser(userId: string): Compra[] {
  return leerTodas()
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

// Compras confirmadas de una gradería, sin importar el usuario. Se usa para
// marcar como "ocupado" los asientos ya vendidos en el catálogo (ver
// lib/compra/asientos-vendidos.ts). Sin eventoId trae las de cualquier
// evento (paneles de dueño/admin, que no distinguen evento); con eventoId
// filtra solo las de ese evento (catálogo que ve el cliente).
export function getComprasByGraderia(graderiaId: string, eventoId?: EventoId): Compra[] {
  return leerTodas().filter(
    (c) =>
      c.graderiaId === graderiaId &&
      c.estado === "confirmada" &&
      (eventoId === undefined || c.eventoId === eventoId),
  );
}

export function registrarCompraReventa(data: {
  userId: string;
  graderiaId: string;
  graderiaNombre: string;
  zonaNombre: string;
  eventoId: EventoId;
  asiento: Omit<Compra["asientos"][number], "zonaId" | "zonaNombre">;
  total: number;
}): Compra {
  const compra: Compra = {
    id: generarId(),
    userId: data.userId,
    graderiaId: data.graderiaId,
    graderiaNombre: data.graderiaNombre,
    eventoId: data.eventoId,
    asientos: [{ ...data.asiento, zonaId: "reventa", zonaNombre: data.zonaNombre }],
    total: data.total,
    estado: "confirmada",
    codigoQR: generarId(),
    fecha: new Date().toISOString(),
    origen: "reventa",
  };

  const todas = leerTodas();
  todas.push(compra);
  guardarTodas(todas);
  return compra;
}
