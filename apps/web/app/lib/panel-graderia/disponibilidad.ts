import type { FaseDraft } from "../../../../../packages/types/graderiaDueno";
import type { Graderia } from "../../../../../packages/types/graderia";
import { EVENTOS, type EventoId } from "../../../../../packages/types/evento";

const STORAGE_KEY = "tickest_disponibilidad_graderia";

type Disponibilidad = {
  fases: FaseDraft[];
  asientosNoDisponibles: string[];
};

// Una entrada por gradería Y evento: Primer Convite y Carnaval de Oruro se
// venden por separado, así que cada uno tiene sus propias fases de venta.
type Almacen = Record<string, Disponibilidad>;

const VACIA: Disponibilidad = { fases: [], asientosNoDisponibles: [] };

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

// Clave estable de un asiento dentro de una gradería. No usamos Asiento.id
// porque los asientos de graderías reales se generan con crypto.randomUUID()
// en cada carga del módulo (data/graderia.ts): ese id cambia entre recargas
// y no sirve como clave persistida. zona.id + numero sí es estable.
export function claveAsiento(zonaId: string, numero: string): string {
  return `${zonaId}:${numero}`;
}

export function leerDisponibilidad(graderiaId: string, eventoId: EventoId): Disponibilidad {
  return leerAlmacen()[claveAlmacen(graderiaId, eventoId)] ?? VACIA;
}

export function crearFase(graderiaId: string, eventoId: EventoId, fase: FaseDraft): void {
  const almacen = leerAlmacen();
  const clave = claveAlmacen(graderiaId, eventoId);
  const actual = almacen[clave] ?? VACIA;
  almacen[clave] = { ...actual, fases: [...actual.fases, fase] };
  guardarAlmacen(almacen);
}

// No toca `id` ni `finalizada`: editar una fase no la reabre ni le cambia la
// identidad, solo sus datos (nombre, fechas, asientos, precio).
export function actualizarFase(
  graderiaId: string,
  eventoId: EventoId,
  faseId: string,
  cambios: Omit<FaseDraft, "id" | "finalizada">,
): void {
  const almacen = leerAlmacen();
  const clave = claveAlmacen(graderiaId, eventoId);
  const actual = almacen[clave];
  if (!actual) return;
  almacen[clave] = {
    ...actual,
    fases: actual.fases.map((item) => (item.id === faseId ? { ...item, ...cambios } : item)),
  };
  guardarAlmacen(almacen);
}

export function finalizarFase(graderiaId: string, eventoId: EventoId, faseId: string): void {
  const almacen = leerAlmacen();
  const clave = claveAlmacen(graderiaId, eventoId);
  const actual = almacen[clave];
  const fase = actual?.fases.find((item) => item.id === faseId);
  if (!actual || !fase) return;
  almacen[clave] = {
    fases: actual.fases.map((item) =>
      item.id === faseId ? { ...item, finalizada: true } : item,
    ),
    asientosNoDisponibles: Array.from(
      new Set([...actual.asientosNoDisponibles, ...fase.asientos]),
    ),
  };
  guardarAlmacen(almacen);
}

export function eliminarFase(graderiaId: string, eventoId: EventoId, faseId: string): void {
  const almacen = leerAlmacen();
  const clave = claveAlmacen(graderiaId, eventoId);
  const actual = almacen[clave];
  const fase = actual?.fases.find((item) => item.id === faseId);
  if (!actual || !fase) return;
  almacen[clave] = {
    fases: actual.fases.filter((item) => item.id !== faseId),
    asientosNoDisponibles: actual.asientosNoDisponibles.filter(
      (clave) => !fase.asientos.includes(clave),
    ),
  };
  guardarAlmacen(almacen);
}

// Fecha de HOY en el huso horario local, como "YYYY-MM-DD". No usar
// toISOString() acá: esa siempre da la fecha en UTC, y Bolivia es UTC-4 —
// en horario de tarde/noche ya cae en el día siguiente en UTC, lo que
// descartaba como "vencidas" fases recién creadas con fecha de hoy.
function hoyLocal(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function faseActiva(fase: FaseDraft): boolean {
  if (fase.finalizada) return false;
  const hoy = hoyLocal();
  return fase.fechaInicio <= hoy && hoy <= fase.fechaFin;
}

// Un asiento está a la venta salvo que el dueño lo haya cerrado
// explícitamente (asientosNoDisponibles) o esté fuera de una fase de venta
// que el dueño sí configuró para esa gradería. Sin fases configuradas, todo
// queda abierto por defecto (habilitado para la venta) hasta que el dueño
// empiece a gestionar fases desde su panel — recién ahí se restringe a lo
// que la fase activa permita. Se aplica igual sobre graderías reales y
// creadas por un dueño, tanto en el panel como en las páginas del cliente,
// para que ambos vean lo mismo.
// eventoId filtra las fases de un solo evento. Sin eventoId (paneles que no
// distinguen evento, ej. el badge "disponible/agotado" del catálogo público)
// se combinan las fases de Primer Convite y Carnaval de Oruro: un asiento
// cuenta como en venta si está habilitado para cualquiera de los dos.
export function aplicarDisponibilidad(graderia: Graderia, eventoId?: EventoId): Graderia {
  const eventos = eventoId ? [eventoId] : EVENTOS.map((evento) => evento.id);
  const fases: FaseDraft[] = [];
  const cerrados = new Set<string>();
  for (const evento of eventos) {
    const disponibilidad = leerDisponibilidad(graderia.id, evento);
    fases.push(...disponibilidad.fases);
    for (const clave of disponibilidad.asientosNoDisponibles) cerrados.add(clave);
  }
  // Mapa (no Set) para saber, además de que un asiento está en venta ahora,
  // de qué fase viene — es la que decide si el precio se mantiene (zona) o
  // se reemplaza por el de la fase.
  const faseActivaDeClave = new Map<string, FaseDraft>();
  for (const fase of fases.filter(faseActiva)) {
    for (const clave of fase.asientos) faseActivaDeClave.set(clave, fase);
  }
  const sinFasesConfiguradas = fases.length === 0;

  const zonas = graderia.zonas.map((zona) => ({
    ...zona,
    asientos: zona.asientos.map((asiento) => {
      if (asiento.estado === "ocupado" || asiento.estado === "revendido") return asiento;
      const clave = claveAsiento(zona.id, asiento.numero);
      // Estar en una fase activa gana sobre un cierre viejo: si el dueño
      // metió este asiento en una fase nueva, esa es justamente la forma de
      // volver a habilitarlo tras quedar sin vender en una fase anterior.
      const fase = faseActivaDeClave.get(clave);
      if (fase) {
        const precio = fase.precioVenta ?? asiento.precio;
        return { ...asiento, estado: "disponible" as const, precio };
      }
      if (cerrados.has(clave)) return { ...asiento, estado: "inhabilitado" as const };
      const enVenta = sinFasesConfiguradas;
      return { ...asiento, estado: enVenta ? ("disponible" as const) : ("inhabilitado" as const) };
    }),
  }));

  const hayAlgoEnVenta = zonas.some((zona) =>
    zona.asientos.some((asiento) => asiento.estado === "disponible"),
  );

  // El badge de la gradería tiene que reflejar si HOY hay algo a la venta,
  // en ambos sentidos: si nada está en venta, no puede quedar "disponible";
  // si el dueño abrió una fase, tiene que poder salir de "agotado" aunque el
  // dato original lo marcara así (ese estado venía de la fuente externa,
  // previo a que existiera un dueño gestionando fases acá).
  const estado = hayAlgoEnVenta ? "disponible" : graderia.estado === "disponible" ? "proximamente" : graderia.estado;

  return { ...graderia, zonas, estado };
}
