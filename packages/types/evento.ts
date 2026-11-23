export type EventoId = "primerConvite" | "carnaval";

export type Evento = {
  id: EventoId;
  nombre: string;
};

export const EVENTOS: Evento[] = [
  { id: "primerConvite", nombre: "Primer Convite" },
  { id: "carnaval", nombre: "Carnaval de Oruro" },
];

export const EVENTO_POR_DEFECTO: EventoId = "primerConvite";

export function nombreEvento(id: EventoId): string {
  return EVENTOS.find((evento) => evento.id === id)?.nombre ?? id;
}
