import type {
  Reventa,
  EstadoReventa,
} from "../../../../../packages/types/reventa";
import type { Graderia } from "../../../../../packages/types/graderia";
import type { EventoId } from "../../../../../packages/types/evento";

const KEY = "tickest_reventas";

function generarId(): string {
  return `RVT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function leerTodas(): Reventa[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

function guardarTodas(reventas: Reventa[]): void {
  localStorage.setItem(KEY, JSON.stringify(reventas));
}

export function registrarReventa(data: {
  asientoId: string;
  vendedorId: string;
  precio: number;
  graderiaId: string;
  graderiaNombre: string;
  graderiaUbicacion: string;
  zonaNombre: string;
  eventoId: EventoId;
  asientoFila: string;
  asientoNumero: string;
  precioOriginal: number;
}): Reventa {
  const reventa: Reventa = {
    id: generarId(),
    asientoId: data.asientoId,
    vendedorId: data.vendedorId,
    precio: data.precio,
    estado: "activa",
    fecha: new Date().toISOString(),
    graderiaId: data.graderiaId,
    graderiaNombre: data.graderiaNombre,
    graderiaUbicacion: data.graderiaUbicacion,
    zonaNombre: data.zonaNombre,
    eventoId: data.eventoId,
    asientoFila: data.asientoFila,
    asientoNumero: data.asientoNumero,
    precioOriginal: data.precioOriginal,
  };

  const todas = leerTodas();
  todas.push(reventa);
  guardarTodas(todas);

  return reventa;
}

export function cancelarReventa(id: string): void {
  const todas = leerTodas();
  const idx = todas.findIndex((r) => r.id === id);
  if (idx === -1) return;

  const existente = todas[idx];
  if (!existente) return;

  todas[idx] = { ...existente, estado: "cancelada" as EstadoReventa };
  guardarTodas(todas);
}

export function comprarReventa(
  id: string,
  compradorId: string,
): Reventa | null {
  const todas = leerTodas();
  const idx = todas.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const existente = todas[idx];
  if (!existente || existente.estado !== "activa") return null;

  const actualizada: Reventa = {
    ...existente,
    estado: "vendida",
    compradorId,
    fechaVenta: new Date().toISOString(),
  };

  todas[idx] = actualizada;
  guardarTodas(todas);

  return actualizada;
}

export function listarReventasActivas(): Reventa[] {
  return leerTodas()
    .filter((r) => r.estado === "activa")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export function listarReventasByVendedor(vendedorId: string): Reventa[] {
  return leerTodas().filter((r) => r.vendedorId === vendedorId);
}

// eventoId filtra a un evento puntual (Primer Convite / Carnaval de Oruro):
// necesario porque el mismo asientoId puede repetirse en una Reventa de cada
// evento (son entradas independientes para el mismo asiento físico). Sin
// eventoId (ej. badge de un asiento reservado por el dueño, que todavía no
// tiene evento elegido) se considera "en reventa" si está publicado en
// cualquiera de los dos.
export function yaEstaEnReventa(asientoId: string, eventoId?: EventoId): boolean {
  return leerTodas().some(
    (r) =>
      r.asientoId === asientoId &&
      r.estado === "activa" &&
      (eventoId === undefined || r.eventoId === eventoId),
  );
}

// La última venta simulada representa la transferencia de titularidad.
// Así el vendedor anterior no puede volver a publicar la misma entrada.
export function puedeRevender(asientoId: string, userId: string, eventoId?: EventoId): boolean {
  const historial = leerTodas()
    .filter(
      (reventa) =>
        reventa.asientoId === asientoId &&
        (eventoId === undefined || reventa.eventoId === eventoId),
    )
    .sort(
      (a, b) =>
        new Date(b.fechaVenta ?? b.fecha).getTime() -
        new Date(a.fechaVenta ?? a.fecha).getTime(),
    );

  const ultima = historial[0];
  if (!ultima) return true;
  if (ultima.estado === "activa") return false;
  return ultima.estado === "vendida" && ultima.compradorId === userId;
}

// Marca "revendido" los asientos con una publicación activa en el mercado,
// para que el cliente los vea distinguidos (violeta) de un asiento
// simplemente ocupado. Empareja por graderiaId + número de asiento, no por
// Reventa.asientoId: para una compra revendida ese campo guarda el
// Asiento.id original de la compra (un crypto.randomUUID() que no vuelve a
// coincidir con el catálogo en vivo tras un reload — ver claveAsiento en
// disponibilidad.ts), y las reventas ni siquiera guardan un zonaId. El
// número de asiento sí es estable y único dentro de una gradería.
export function aplicarReventaActiva(graderia: Graderia, eventoId?: EventoId): Graderia {
  const activas = listarReventasActivas().filter(
    (r) => r.graderiaId === graderia.id && (eventoId === undefined || r.eventoId === eventoId),
  );
  if (activas.length === 0) return graderia;
  const numerosEnReventa = new Set(activas.map((r) => r.asientoNumero));

  return {
    ...graderia,
    zonas: graderia.zonas.map((zona) => ({
      ...zona,
      asientos: zona.asientos.map((asiento) =>
        asiento.estado === "ocupado" && numerosEnReventa.has(asiento.numero)
          ? { ...asiento, estado: "revendido" as const }
          : asiento,
      ),
    })),
  };
}
