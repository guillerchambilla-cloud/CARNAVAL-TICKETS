import { Asiento } from "./asiento";

export function generateAsientos(
  metrosLineales: number,
  precioBase: number,
): Asiento[] {
  const filas = 9;
  const columnas = metrosLineales * 2;

  const asientos: Asiento[] = [];

  let orden = 1;

  for (let fila = 0; fila < filas; fila++) {
    const letraFila = String.fromCharCode(65 + fila);

    for (let columna = 1; columna <= columnas; columna++) {
      asientos.push({
        id: crypto.randomUUID(),
        numero: `${letraFila}-${String(columna).padStart(2, "0")}`,
        fila: letraFila,
        columna,
        orden,
        precio: precioBase,
        estado: "disponible",
      });

      orden++;
    }
  }

  return asientos;
}
