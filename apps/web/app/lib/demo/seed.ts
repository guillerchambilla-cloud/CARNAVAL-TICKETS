import type { Compra } from "../../../../../packages/types/compra";
import type { Reventa } from "../../../../../packages/types/reventa";

const SEED_VERSION = "tickest_demo_seed_v1";
const COMPRAS_KEY = "tickest_compras";
const REVENTAS_KEY = "tickest_reventas";
const RESERVAS_KEY = "tickest_asientos_reservados";

function compraDemo({
  id,
  userId,
  graderiaId,
  graderiaNombre,
  eventoId,
  zonaId,
  zonaNombre = "Zona Unica",
  fila,
  desde,
  cantidad,
  precio,
}: {
  id: string;
  userId: string;
  graderiaId: string;
  graderiaNombre: string;
  eventoId: Compra["eventoId"];
  zonaId: string;
  zonaNombre?: string;
  fila: string;
  desde: number;
  cantidad: number;
  precio: number;
}): Compra {
  const asientos = Array.from({ length: cantidad }, (_, index) => ({
    id: `${id}-seat-${index + 1}`,
    fila,
    numero: `${fila}-${String(desde + index).padStart(2, "0")}`,
    precio,
    zonaId,
    zonaNombre,
  }));

  return {
    id,
    userId,
    graderiaId,
    graderiaNombre,
    eventoId,
    asientos,
    total: asientos.reduce((sum, asiento) => sum + asiento.precio, 0),
    estado: "confirmada",
    codigoQR: `QR-${id}`,
    fecha: new Date().toISOString(),
    origen: "compra",
  };
}

const COMPRAS_DEMO: Compra[] = [
  compraDemo({
    id: "DEMO-CLIENTE-CONVITE-01",
    userId: "2",
    graderiaId: "predio-208",
    graderiaNombre: "Gradería 100-E · Demo",
    eventoId: "primerConvite",
    zonaId: "predio-208-z1",
    fila: "A",
    desde: 1,
    cantidad: 3,
    precio: 153,
  }),
  compraDemo({
    id: "DEMO-CLIENTE-CARNAVAL-01",
    userId: "2",
    graderiaId: "predio-208",
    graderiaNombre: "Gradería 100-E · Demo",
    eventoId: "carnaval",
    zonaId: "predio-208-z1",
    fila: "B",
    desde: 1,
    cantidad: 2,
    precio: 153,
  }),
  compraDemo({
    id: "DEMO-CLIENTE-GOLD-01",
    userId: "2",
    graderiaId: "predio-212",
    graderiaNombre: "Experiencia Gold (100-A)",
    eventoId: "carnaval",
    zonaId: "predio-212-z1",
    fila: "C",
    desde: 1,
    cantidad: 2,
    precio: 500,
  }),
  compraDemo({
    id: "DEMO-CLIENTE-2-GOLD-01",
    userId: "4",
    graderiaId: "predio-212",
    graderiaNombre: "Experiencia Gold (100-A)",
    eventoId: "primerConvite",
    zonaId: "predio-212-z1",
    fila: "D",
    desde: 1,
    cantidad: 2,
    precio: 500,
  }),
];

const REVENTAS_DEMO: Reventa[] = [
  {
    id: "DEMO-REVENTA-01",
    asientoId: "DEMO-CLIENTE-2-GOLD-01-seat-1",
    vendedorId: "4",
    precio: 450,
    estado: "activa",
    fecha: new Date().toISOString(),
    eventoId: "primerConvite",
    graderiaId: "predio-212",
    graderiaNombre: "Experiencia Gold (100-A)",
    graderiaUbicacion: "Heroes del Chaco entre Pasaje C G. y P. Oblitas",
    zonaNombre: "Zona Unica",
    asientoFila: "D",
    asientoNumero: "D-01",
    precioOriginal: 500,
  },
];

const RESERVAS_DEMO = {
  "predio-212:primerConvite": {
    "predio-212-z1:H-01": { reservado: true, reservaUnicaUsada: true },
    "predio-212-z1:H-02": { reservado: true, reservaUnicaUsada: true },
  },
};

/** Carga una vez actividad ficticia en el navegador para recorrer los paneles. */
export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(SEED_VERSION)) return;

    const comprasExistentes = JSON.parse(localStorage.getItem(COMPRAS_KEY) ?? "[]") as Compra[];
    const idsCompra = new Set(comprasExistentes.map((compra) => compra.id));
    const comprasNuevas = COMPRAS_DEMO.filter((compra) => !idsCompra.has(compra.id));
    localStorage.setItem(COMPRAS_KEY, JSON.stringify([...comprasExistentes, ...comprasNuevas]));

    const reventasExistentes = JSON.parse(localStorage.getItem(REVENTAS_KEY) ?? "[]") as Reventa[];
    const idsReventa = new Set(reventasExistentes.map((reventa) => reventa.id));
    const reventasNuevas = REVENTAS_DEMO.filter((reventa) => !idsReventa.has(reventa.id));
    localStorage.setItem(REVENTAS_KEY, JSON.stringify([...reventasExistentes, ...reventasNuevas]));

    const reservasExistentes = JSON.parse(localStorage.getItem(RESERVAS_KEY) ?? "{}") as Record<
      string,
      Record<string, { reservado: boolean; reservaUnicaUsada: boolean }>
    >;
    for (const [evento, reservas] of Object.entries(RESERVAS_DEMO)) {
      reservasExistentes[evento] ??= {};
      for (const [asiento, datos] of Object.entries(reservas)) {
        reservasExistentes[evento][asiento] ??= datos;
      }
    }
    localStorage.setItem(RESERVAS_KEY, JSON.stringify(reservasExistentes));
    localStorage.setItem(SEED_VERSION, "true");
  } catch (error) {
    console.warn("No se pudieron preparar los datos locales de demostración.", error);
  }
}
