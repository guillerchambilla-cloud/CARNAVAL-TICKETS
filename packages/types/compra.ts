import type { EventoId } from "./evento";

export type EstadoCompra = "pendiente" | "confirmada" | "cancelada";

export type AsientoComprado = {
  id: string;
  fila: string;
  numero: string;
  precio: number;
  // Cada asiento guarda su propia zona: una compra puede mezclar asientos
  // de distintas zonas de la misma gradería.
  zonaId: string;
  zonaNombre: string;
};

export type Compra = {
  id: string;
  userId: string;
  graderiaId: string;
  graderiaNombre: string;
  asientos: AsientoComprado[];
  total: number;
  estado: EstadoCompra;
  codigoQR: string;
  fecha: string;

  // Primer Convite y Carnaval de Oruro son eventos distintos con
  // disponibilidad propia: un mismo asiento se vende una vez por cada uno.
  eventoId: EventoId;

  // Permite diferenciar visualmente una entrada comprada en reventa.
  origen?: "compra" | "reventa";

  // 🆕 bajo qué fase de venta se compró
  faseVentaId?: string;

  // 🆕 solo el id — el nombre/teléfono del dueño se busca desde graderiaId
  duenoId?: string;
};
