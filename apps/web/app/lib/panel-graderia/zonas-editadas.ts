import type { ZoneDraft } from "../../../../../packages/types/graderiaDueno";
import type { Graderia } from "../../../../../packages/types/graderia";
import type { Zona } from "../../../../../packages/types/zona";
import type { Asiento } from "../../../../../packages/types/asiento";
import { EVENTO_POR_DEFECTO, type EventoId } from "../../../../../packages/types/evento";

const STORAGE_KEY = "tickest_zonas_graderia";
const LETRAS = "ABCDEFGHI".split("");

// Una entrada por gradería Y evento: el dueño puede definir zonas (y por lo
// tanto precios) distintos para Primer Convite y Carnaval de Oruro.
type Almacen = Record<string, ZoneDraft[]>;

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

export function leerZonasEditadas(graderiaId: string, eventoId: EventoId): ZoneDraft[] | undefined {
  const draft = leerAlmacen()[claveAlmacen(graderiaId, eventoId)];
  // Si quedó guardado en el formato viejo (rectángulo: filaInicio/filaFin/...
  // en vez de celdas), lo tratamos como si no hubiera draft en vez de
  // romper: no se migra automáticamente, ver nota en aplicarZonasEditadas.
  if (!draft || draft.some((zona) => !Array.isArray(zona.celdas))) return undefined;
  return draft;
}

export function guardarZonasEditadas(graderiaId: string, eventoId: EventoId, zonas: ZoneDraft[]): void {
  const almacen = leerAlmacen();
  almacen[claveAlmacen(graderiaId, eventoId)] = zonas;
  guardarAlmacen(almacen);
}

// Deriva la lista de celdas de una zona ya existente, a partir de sus
// asientos reales, para precargar el editor con lo que el dueño ya tiene en
// vez de arrancar en blanco.
export function zonaADraft(zona: Zona): ZoneDraft {
  return {
    id: zona.id,
    nombre: zona.nombre,
    color: zona.color,
    precio: zona.precioBase,
    celdas: zona.asientos.map((a) => `${LETRAS.indexOf(a.fila)}:${a.columna}`),
  };
}

function zonaDesdeDraft(zona: ZoneDraft, orden: number): Zona {
  const celdas = zona.celdas
    .map((clave) => {
      const [fila, asiento] = clave.split(":").map(Number) as [number, number];
      return { fila, asiento };
    })
    .sort((a, b) => a.fila - b.fila || a.asiento - b.asiento);

  const asientos: Asiento[] = celdas.map(({ fila, asiento }, index) => {
    const letraFila = LETRAS[fila] ?? String.fromCharCode(65 + fila);
    const clave = `${letraFila}-${String(asiento).padStart(2, "0")}`;
    return {
      id: `${zona.id}-${clave}`,
      numero: clave,
      fila: letraFila,
      columna: asiento,
      precio: zona.precio,
      estado: "disponible",
      orden: index + 1,
    };
  });

  return {
    id: zona.id,
    nombre: zona.nombre,
    color: zona.color,
    orden,
    capacidad: asientos.length,
    precioBase: zona.precio,
    asientos,
  };
}

// Si el dueño redefinió las zonas de esta gradería, reemplaza graderia.zonas
// por lo materializado desde el override y recalcula precioMin/precioMax/
// colorMapa. capacidad no se toca: EditorZonas exige cubrir el 100% de la
// grilla al guardar, así que la suma de asientos siempre coincide.
//
// Nota: redefinir zonas genera zona.id nuevos, lo que deja huérfanas las
// fases de venta / eliminaciones de asientos creadas contra los zonaId:numero
// anteriores (ver disponibilidad.ts / asientos-eliminados.ts). No se migran
// automáticamente — es una demo sobre localStorage, así que si el dueño
// redefine zonas tiene que volver a crear sus fases y remarcar eliminaciones.
//
// A diferencia de las capas de disponibilidad (fases/reservas), acá no hay
// forma sensata de "combinar" dos layouts de zonas distintos si no se pasa
// eventoId: las páginas sin contexto de evento (listado, reportes) muestran
// igual las zonas de un evento concreto — Primer Convite por defecto.
export function aplicarZonasEditadas(graderia: Graderia, eventoId: EventoId = EVENTO_POR_DEFECTO): Graderia {
  const draft = leerZonasEditadas(graderia.id, eventoId);
  if (!draft) return graderia;

  const zonas = draft.map((zona, index) => zonaDesdeDraft(zona, index + 1));
  const precios = zonas.map((zona) => zona.precioBase);

  return {
    ...graderia,
    zonas,
    precioMin: precios.length ? Math.min(...precios) : graderia.precioMin,
    precioMax: precios.length ? Math.max(...precios) : graderia.precioMax,
    colorMapa: zonas[0]?.color ?? graderia.colorMapa,
  };
}
