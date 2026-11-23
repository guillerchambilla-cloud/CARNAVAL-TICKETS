"use client";

import { useEffect, useState } from "react";
import type { Graderia } from "../../../../../packages/types/graderia";
import type { EventoId } from "../../../../../packages/types/evento";
import { graderias as graderiasBase } from "../compra/enriquecer-graderias";
import { aplicarZonasEditadas } from "../panel-graderia/zonas-editadas";
import { aplicarAsientosVendidos } from "../compra/asientos-vendidos";
import { aplicarDisponibilidad } from "../panel-graderia/disponibilidad";
import { aplicarAsientosEliminados } from "../panel-graderia/asientos-eliminados";
import { aplicarAsientosReservados } from "../panel-graderia/asientos-reservados";
import { aplicarReventaActiva } from "../reventa/reventa";
import { leerAsignaciones } from "../admin/asignaciones";

export type UseGraderiasResult = {
  graderias: Graderia[];
  cargando: boolean;
};

function calcularGraderias(eventoId?: EventoId, graderiaId?: string | null): Graderia[] {
  const catalogo =
    graderiaId === null
      ? []
      : graderiaId
        ? graderiasBase.filter((graderia) => graderia.id === graderiaId)
        : graderiasBase;
  const asignaciones = leerAsignaciones();
  const conDueno =
    Object.keys(asignaciones).length === 0
      ? catalogo
      : catalogo.map((graderia) => {
          const duenoId = asignaciones[graderia.id];
          return duenoId ? { ...graderia, duenoId } : graderia;
        });

  return conDueno
    .map((graderia) => aplicarZonasEditadas(graderia, eventoId))
    .map((graderia) => aplicarAsientosVendidos(graderia, eventoId))
    .map((graderia) => aplicarDisponibilidad(graderia, eventoId))
    .map(aplicarAsientosEliminados)
    .map((graderia) => aplicarAsientosReservados(graderia, eventoId))
    .map((graderia) => aplicarReventaActiva(graderia, eventoId));
}

// Combina el catálogo estático de graderías con: (1) asignaciones de dueño
// hechas desde /dashboard, (2) zonas redefinidas por el dueño, (3) asientos
// ya vendidos (compras confirmadas), (4) fases de venta activas, (5)
// asientos eliminados, (6) asientos reservados por el dueño (una sola vez) y
// (7) publicaciones activas en el mercado de reventa. Se calcula en un
// efecto porque localStorage solo existe en el cliente.
//
// El estado inicial es [] (no graderiasBase): si arrancara con el catálogo
// crudo, el HTML renderizado en el servidor (y el primer frame en el
// cliente, antes de que corra este efecto) mostraría todos los asientos
// "disponible" sin pasar por ninguna de las capas de arriba. cargando deja
// que cada página muestre un estado de carga en vez de ese catálogo sin
// procesar.
//
// eventoId filtra la disponibilidad (asientos vendidos/revendidos) a un solo
// evento — Primer Convite y Carnaval de Oruro se venden por separado, así
// que un asiento ocupado en uno puede seguir disponible en el otro. Sin
// eventoId (paneles de dueño/admin, que no distinguen evento) se considera
// ocupado si se vendió para cualquiera de los dos.
//
// refreshKey permite forzar un recálculo sin recargar la página: útil
// dentro de la MISMA pestaña (ej. el panel del dueño, después de guardar un
// modal). Para reflejar ediciones del dueño en la vista del cliente (otra
// pestaña, u otra sesión de navegador) también escuchamos:
// - "storage": el navegador lo dispara automáticamente en las demás
//   pestañas cuando cambia localStorage (nunca en la que hizo el cambio).
// - "focus": cubre volver a una pestaña que quedó abierta, por si el
//   cambio se hizo en otra ventana que no dispara "storage" (misma
//   pestaña reutilizada, DevTools, etc.).
export function useGraderias(
  eventoId?: EventoId,
  refreshKey: number = 0,
  graderiaId?: string | null,
): UseGraderiasResult {
  const [graderias, setGraderias] = useState<Graderia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    function recalcular() {
      try {
        setGraderias(calcularGraderias(eventoId, graderiaId));
      } catch (error) {
        console.error("No se pudo leer la disponibilidad guardada; se muestra el catálogo base.", error);
        const catalogoBase =
          graderiaId === null
            ? []
            : graderiaId
              ? graderiasBase.filter((graderia) => graderia.id === graderiaId)
              : graderiasBase;
        setGraderias(catalogoBase);
      } finally {
        setCargando(false);
      }
    }

    recalcular();
    window.addEventListener("storage", recalcular);
    window.addEventListener("focus", recalcular);
    return () => {
      window.removeEventListener("storage", recalcular);
      window.removeEventListener("focus", recalcular);
    };
  }, [eventoId, refreshKey, graderiaId]);

  return { graderias, cargando };
}

// El catálogo público solo necesita datos generales, no crear miles de
// objetos de asientos. Los planos completos se materializan en el detalle.
export function useGraderiasResumen(): UseGraderiasResult {
  const [graderias, setGraderias] = useState<Graderia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setGraderias(
      graderiasBase.map((graderia) => ({
        ...graderia,
        zonas: graderia.zonas.map((zona) => ({ ...zona, asientos: [] })),
      })),
    );
    setCargando(false);
  }, []);

  return { graderias, cargando };
}
