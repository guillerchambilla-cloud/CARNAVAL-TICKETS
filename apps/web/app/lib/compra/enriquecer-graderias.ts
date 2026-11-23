
import { graderias as graderiasBase } from "../../data/graderia";
import type { Graderia } from "../../../../../packages/types/graderia";

const DEMO_DUENO_ID = "3"; // Ramiro Quispe, el duenioGrad de tu mock de usuarios

const IDS_CON_DUENO_DEMO = ["predio-212"];

export const graderias: Graderia[] = graderiasBase.map((g) => {
  if (!IDS_CON_DUENO_DEMO.includes(g.id)) {
    return g;
  }

  return {
    ...g,
    duenoId: DEMO_DUENO_ID,
    fasesVenta: [
      {
        id: `${g.id}-fase-preventa1`,
        graderiaId: g.id,
        nombre: "preventa1" as const,
        multiplicador: 0.85,
        fechaInicio: "2026-01-01T00:00:00.000Z",
        fechaFin: "2026-02-15T23:59:59.000Z",
        activa: false,
        cupoTotal: 50,
      },
      {
        id: `${g.id}-fase-normal`,
        graderiaId: g.id,
        nombre: "fase1" as const,
        multiplicador: 1.0,
        fechaInicio: "2026-02-16T00:00:00.000Z",
        fechaFin: "2026-03-01T23:59:59.000Z",
        activa: true,
        cupoTotal: null,
      },
    ],
  };
});