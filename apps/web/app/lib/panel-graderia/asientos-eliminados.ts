import type { Graderia } from "../../../../../packages/types/graderia";

const STORAGE_KEY = "tickest_asientos_eliminados";

export type RegistroAsiento = {
  eliminado: boolean;
  motivo: string | null;
};

// A propósito NO usa claveAsiento(zonaId, numero) como el resto de las capas
// del panel: esto es sobre un defecto físico de la butaca (rota, vista
// obstruida), no sobre la venta, así que es lo único que se comparte entre
// Primer Convite y Carnaval de Oruro en vez de guardarse por evento. Como el
// dueño puede redefinir las zonas de forma independiente por evento
// (zonas-editadas.ts), zonaId ya NO es estable entre los dos — cada
// redefinición genera ids nuevos. asiento.numero (fila+columna) sí lo es: no
// depende de a qué zona quedó asignado el asiento, ni de en qué evento se
// está mirando el plano.
type Almacen = Record<string, Record<string, RegistroAsiento>>;

function leerAlmacen(): Almacen {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function guardarAlmacen(almacen: Almacen): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(almacen));
}

export function leerAsientosEliminados(graderiaId: string): Record<string, RegistroAsiento> {
  return leerAlmacen()[graderiaId] ?? {};
}

// Sin límite de veces: un asiento puede eliminarse y volver a habilitarse
// tantas veces como haga falta (ej. se rompe, se arregla, se rompe de
// nuevo). La regla de "el dueño solo puede inhabilitar un asiento una vez"
// que trae packages/types/asiento.ts (reservaUnicaUsada) es para la futura
// función de reserva de asientos del dueño, no para esto.
export function eliminarAsiento(graderiaId: string, numero: string, motivo: string): void {
  const almacen = leerAlmacen();
  const graderia = almacen[graderiaId] ?? {};
  graderia[numero] = { eliminado: true, motivo };
  almacen[graderiaId] = graderia;
  guardarAlmacen(almacen);
}

export function habilitarAsiento(graderiaId: string, numero: string): void {
  const almacen = leerAlmacen();
  const graderia = almacen[graderiaId];
  if (!graderia?.[numero]) return;
  graderia[numero] = { eliminado: false, motivo: null };
  guardarAlmacen(almacen);
}

// Se aplica después de aplicarDisponibilidad(): una eliminación siempre
// gana, incluso si el asiento está dentro de una fase de venta activa.
export function aplicarAsientosEliminados(graderia: Graderia): Graderia {
  const registro = leerAsientosEliminados(graderia.id);
  if (Object.keys(registro).length === 0) return graderia;

  return {
    ...graderia,
    zonas: graderia.zonas.map((zona) => ({
      ...zona,
      asientos: zona.asientos.map((asiento) => {
        const reg = registro[asiento.numero];
        if (!reg?.eliminado) return asiento;
        return { ...asiento, motivoInhabilitado: reg.motivo, estado: "inhabilitado" as const };
      }),
    })),
  };
}
