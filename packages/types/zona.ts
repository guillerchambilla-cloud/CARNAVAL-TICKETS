import { Asiento } from "./asiento";

export type Zona = {
  id: string;
  nombre: string;
  color: string;
  orden: number;
  capacidad: number;
  precioBase: number;
  asientos: Asiento[];
};
