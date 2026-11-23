import type { EventoId } from "./evento";

export type EstadoReventa = "activa" | "vendida" | "cancelada";

export type Reventa = {
  id: string;
  asientoId: string;
  vendedorId: string;
  compradorId?: string;
  precio: number;
  estado: EstadoReventa;
  fecha: string;
  fechaVenta?: string;

  // Para qué evento es esta entrada (Primer Convite o Carnaval de Oruro) —
  // la reventa de un asiento revendido es evento por evento, igual que la
  // compra original.
  eventoId: EventoId;

  // Datos mostrados en el marketplace. Por ahora se guardan como una
  // "fotografía" del asiento para que la demo no dependa aún del backend.
  graderiaId: string;
  graderiaNombre: string;
  graderiaUbicacion: string;
  zonaNombre: string;
  asientoFila: string;
  asientoNumero: string;
  precioOriginal: number;
};
