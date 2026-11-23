export type ZoneDraft = {
  id: string;
  nombre: string;
  color: string;
  precio: number;
  // Lista de celdas exactas de la zona, como "fila:asiento" (fila
  // 0-indexada, asiento 1-indexado) — no un rectángulo: una zona puede ser
  // un conjunto arbitrario de asientos, no necesariamente contiguo.
  celdas: string[];
};

export type FaseDraft = {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  asientos: string[];
  finalizada: boolean;
  // Precio de venta propio de la fase para los asientos que incluye. `null`
  // (o ausente) significa "mantener el precio original de la zona" — no un
  // precio de cero.
  precioVenta?: number | null;
};
