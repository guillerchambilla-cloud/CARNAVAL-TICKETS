export type NombreFase = "proximamente" | "preventa1" | "preventa2" | "fase1" | "fase2";

export type FaseVenta = {
  id: string;
  graderiaId: string;
  nombre: NombreFase;
  multiplicador: number; // ej. 0.8 = 20% descuento en preventa
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  cupoTotal?: number | null;
};