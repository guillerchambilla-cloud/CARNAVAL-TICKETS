import type { Zona } from "./zona";
import type { FaseVenta } from "./faseVenta";

export type EstadoGraderia = "disponible" | "agotado" | "proximamente";

export type Graderia = {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  banner?: string;
  metrosLineales: number;
  capacidad: number;
  precioMin: number;
  precioMax: number;
  colorMapa: string;
  estado: EstadoGraderia;
  zonas: Zona[];
  center: [number, number];
  coords: [number, number][];

  codigo?: string | null;
  cuadra?: string | null;
  acera?: string | null;
  cedula?: string | null;
  propietario?: string | null;
  telefonoPropietario?: string | null;
  aseo?: number | null;
  tipo?: string | null;

  // 🆕 vínculo real al usuario dueño (para buscar duenoId desde Compra)
  duenoId?: string;

  // 🆕 fases de venta configuradas para esta gradería
  fasesVenta?: FaseVenta[];
};