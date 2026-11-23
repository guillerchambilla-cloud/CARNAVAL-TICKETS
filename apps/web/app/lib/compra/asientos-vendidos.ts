import type { Graderia } from "../../../../../packages/types/graderia";
import type { EventoId } from "../../../../../packages/types/evento";
import { getComprasByGraderia } from "./compra";
import { claveAsiento } from "../panel-graderia/disponibilidad";

// Los asientos con una compra confirmada quedan "ocupado" en el catálogo,
// para que dejen de aparecer disponibles para otros compradores. No se toca
// la Compra en sí (localStorage["tickest_compras"]) ni el Asiento base: se
// recalcula en cada lectura, igual que el resto de las capas de
// disponibilidad (zonas editadas, fases de venta, eliminaciones).
//
// Debe aplicarse ANTES de aplicarDisponibilidad(): esa función respeta un
// asiento que ya viene "ocupado" y no lo vuelve a evaluar contra las fases.
//
// eventoId filtra a las compras de un solo evento (Primer Convite / Carnaval
// de Oruro): tienen disponibilidad independiente, así que un asiento vendido
// para uno sigue "disponible" para el otro. Sin eventoId (paneles de
// dueño/admin) se consideran ocupados si se vendieron para cualquiera.
export function aplicarAsientosVendidos(graderia: Graderia, eventoId?: EventoId): Graderia {
  const compras = getComprasByGraderia(graderia.id, eventoId);
  if (compras.length === 0) return graderia;

  const vendidos = new Set(
    compras.flatMap((compra) =>
      compra.asientos.map((asiento) => claveAsiento(asiento.zonaId, asiento.numero)),
    ),
  );
  if (vendidos.size === 0) return graderia;

  return {
    ...graderia,
    zonas: graderia.zonas.map((zona) => ({
      ...zona,
      asientos: zona.asientos.map((asiento) =>
        vendidos.has(claveAsiento(zona.id, asiento.numero))
          ? { ...asiento, estado: "ocupado" as const }
          : asiento,
      ),
    })),
  };
}
