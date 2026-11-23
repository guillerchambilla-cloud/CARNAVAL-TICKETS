import type { Asiento } from "../../../../../packages/types/asiento";
import type { EventoId } from "../../../../../packages/types/evento";

// Cada asiento lleva su propia zona: el carrito puede mezclar asientos de
// distintas zonas de la misma gradería en una sola compra.
export type AsientoDelCarrito = Asiento & { zonaId: string; zonaNombre: string };

export type Carrito = {
  graderiaId: string;
  graderiaNombre: string;
  // Primer Convite y Carnaval de Oruro tienen disponibilidad independiente:
  // todo el carrito es para un solo evento a la vez (no se puede mezclar).
  eventoId: EventoId;
  asientos: AsientoDelCarrito[];
};

const KEY = "tickest_carrito";

export function guardarCarrito(carrito: Carrito): void {
  sessionStorage.setItem(KEY, JSON.stringify(carrito));
}

export function obtenerCarrito(): Carrito | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function limpiarCarrito(): void {
  sessionStorage.removeItem(KEY);
}