const STORAGE_KEY = "tickest_asignaciones_dueno";

// graderiaId -> duenoId. Permite asignar cualquier gradería del catálogo
// real a un dueño de la demo sin tocar data/graderia.ts.
type Asignaciones = Record<string, string>;

function leerAlmacen(): Asignaciones {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function guardarAlmacen(asignaciones: Asignaciones): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(asignaciones));
}

export function leerAsignaciones(): Asignaciones {
  return leerAlmacen();
}

export function asignarGraderia(graderiaId: string, duenoId: string): void {
  const asignaciones = leerAlmacen();
  asignaciones[graderiaId] = duenoId;
  guardarAlmacen(asignaciones);
}

export function desasignarGraderia(graderiaId: string): void {
  const asignaciones = leerAlmacen();
  delete asignaciones[graderiaId];
  guardarAlmacen(asignaciones);
}
