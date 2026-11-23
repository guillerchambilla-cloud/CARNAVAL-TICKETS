export type Orden = "recomendado" | "precio-asc" | "precio-desc" | "capacidad-desc";

export const ORDEN_OPCIONES: { value: Orden; label: string }[] = [
  { value: "recomendado", label: "Nuestros destacados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "capacidad-desc", label: "Capacidad" },
];
