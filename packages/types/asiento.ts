export type EstadoAsiento = "disponible" | "ocupado" | "revendido" | "inhabilitado";

export type Asiento = {
  id: string;
  numero: string;
  fila: string;
  columna: number;
  precio: number;
  usuarioId?: string;
  estado: EstadoAsiento;
  orden: number;

  // 🆕 El dueño solo puede inhabilitar (reservar) un asiento UNA vez.
  // Una vez que lo vuelve a habilitar, no puede inhabilitarlo de nuevo.
  reservaUnicaUsada?: boolean;

  // 🆕 Motivo opcional cuando el dueño lo inhabilita
  motivoInhabilitado?: string | null;
};