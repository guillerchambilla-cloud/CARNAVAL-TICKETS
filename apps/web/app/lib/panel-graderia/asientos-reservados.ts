import type { Graderia } from "../../../../../packages/types/graderia";
import type { Asiento } from "../../../../../packages/types/asiento";
import { EVENTOS, type EventoId } from "../../../../../packages/types/evento";
import { claveAsiento } from "./disponibilidad";

const STORAGE_KEY = "tickest_asientos_reservados";

export type RegistroReserva = {
  reservado: boolean;
  // El dueño solo puede reservar un asiento UNA vez por evento (ver
  // comentario original en packages/types/asiento.ts, campo
  // reservaUnicaUsada). Queda en true para siempre apenas se reserva, incluso
  // después de liberarlo — a diferencia de "eliminar asientos"
  // (lib/panel-graderia/asientos-eliminados.ts), que no tiene este límite.
  reservaUnicaUsada: boolean;
};

// Una entrada por gradería Y evento: reservar un asiento para Primer Convite
// no lo bloquea para Carnaval de Oruro, ni viceversa.
type Almacen = Record<string, Record<string, RegistroReserva>>;

function claveAlmacen(graderiaId: string, eventoId: EventoId): string {
  return `${graderiaId}:${eventoId}`;
}

function leerAlmacen(): Almacen {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function guardarAlmacen(almacen: Almacen): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(almacen));
}

export function leerAsientosReservados(graderiaId: string, eventoId: EventoId): Record<string, RegistroReserva> {
  return leerAlmacen()[claveAlmacen(graderiaId, eventoId)] ?? {};
}

export function reservarAsiento(graderiaId: string, eventoId: EventoId, clave: string): void {
  const almacen = leerAlmacen();
  const claveAlm = claveAlmacen(graderiaId, eventoId);
  const graderia = almacen[claveAlm] ?? {};
  if (graderia[clave]?.reservaUnicaUsada) return;
  graderia[clave] = { reservado: true, reservaUnicaUsada: true };
  almacen[claveAlm] = graderia;
  guardarAlmacen(almacen);
}

export function liberarAsiento(graderiaId: string, eventoId: EventoId, clave: string): void {
  const almacen = leerAlmacen();
  const claveAlm = claveAlmacen(graderiaId, eventoId);
  const graderia = almacen[claveAlm];
  const existente = graderia?.[clave];
  if (!graderia || !existente) return;
  graderia[clave] = { ...existente, reservado: false };
  guardarAlmacen(almacen);
}

// Se aplica igual que las demás capas: un asiento reservado por el dueño
// queda tomado para el catálogo — se muestra "ocupado" (como si estuviera
// vendido) en vez de "inhabilitado", porque conceptualmente el dueño se lo
// quedó, no es que todavía no esté a la venta.
//
// eventoId filtra la reserva de un solo evento. Sin eventoId (paneles que no
// distinguen evento) un asiento cuenta como tomado si está reservado para
// cualquiera de los dos.
export function aplicarAsientosReservados(graderia: Graderia, eventoId?: EventoId): Graderia {
  const eventos = eventoId ? [eventoId] : EVENTOS.map((evento) => evento.id);
  const reservado = new Set<string>();
  for (const evento of eventos) {
    const registro = leerAsientosReservados(graderia.id, evento);
    for (const [clave, reg] of Object.entries(registro)) {
      if (reg.reservado) reservado.add(clave);
    }
  }
  if (reservado.size === 0) return graderia;

  return {
    ...graderia,
    zonas: graderia.zonas.map((zona) => ({
      ...zona,
      asientos: zona.asientos.map((asiento) => {
        if (!reservado.has(claveAsiento(zona.id, asiento.numero))) return asiento;
        return {
          ...asiento,
          motivoInhabilitado: "Reservado por el dueño de la gradería",
          estado: "ocupado" as const,
        };
      }),
    })),
  };
}

export type AsientoReservado = {
  graderiaId: string;
  graderiaNombre: string;
  graderiaUbicacion: string;
  zonaId: string;
  zonaNombre: string;
  eventoId: EventoId;
  asiento: Asiento;
};

// Todos los asientos que el dueño tiene reservados ahora mismo para UN
// evento puntual, en cualquiera de las graderías que administra. `graderias`
// tiene que venir de useGraderias(eventoId) con ese mismo evento (ya con
// duenoId resuelto Y con las zonas/precios de ese evento — el dueño puede
// haber redefinido zonas distintas por evento, así que no alcanza con pasar
// cualquier snapshot); acá solo se lee directamente el store de reservas
// para no depender de que el estado ya esté en "ocupado" (que también podría
// deberse a una venta real). Para juntar los dos eventos, llamar dos veces
// (una por cada id de EVENTOS) y concatenar.
export function listarAsientosReservadosDeDueno(
  graderias: Graderia[],
  duenoId: string,
  eventoId: EventoId,
): AsientoReservado[] {
  const propias = graderias.filter((graderia) => graderia.duenoId === duenoId);
  const resultado: AsientoReservado[] = [];

  for (const graderia of propias) {
    const registro = leerAsientosReservados(graderia.id, eventoId);
    for (const zona of graderia.zonas) {
      for (const asiento of zona.asientos) {
        if (!registro[claveAsiento(zona.id, asiento.numero)]?.reservado) continue;
        resultado.push({
          graderiaId: graderia.id,
          graderiaNombre: graderia.nombre,
          graderiaUbicacion: graderia.ubicacion,
          zonaId: zona.id,
          zonaNombre: zona.nombre,
          eventoId,
          asiento,
        });
      }
    }
  }

  return resultado;
}
