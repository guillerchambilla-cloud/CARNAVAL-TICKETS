// Contenido que se codifica DENTRO del QR de una entrada. La idea es que el
// QR sea autosuficiente: el dueño lo escanea y lee estos datos directamente
// del código (JSON.parse), sin buscar nada en localStorage ni depender de un
// backend — así funciona desde cualquier navegador/dispositivo, no solo el
// que hizo la compra.
export type TicketQR = {
  v: 1;
  compraId: string;
  graderiaId: string;
  graderiaNombre: string;
  zonaNombre: string;
  fila: string;
  numero: string;
  precio: number;
  compradorNombre: string;
  estado: "pendiente" | "confirmada" | "cancelada";
  fecha: string;
};

export function codificarTicketQR(ticket: Omit<TicketQR, "v">): string {
  return JSON.stringify({ v: 1, ...ticket });
}

function esTicketQR(data: unknown): data is TicketQR {
  if (!data || typeof data !== "object") return false;
  const t = data as Record<string, unknown>;
  return (
    typeof t.compraId === "string" &&
    typeof t.graderiaNombre === "string" &&
    typeof t.zonaNombre === "string" &&
    typeof t.fila === "string" &&
    typeof t.numero === "string" &&
    typeof t.precio === "number" &&
    typeof t.compradorNombre === "string" &&
    typeof t.estado === "string"
  );
}

export function decodificarTicketQR(texto: string): TicketQR | null {
  try {
    const data: unknown = JSON.parse(texto);
    return esTicketQR(data) ? data : null;
  } catch {
    return null;
  }
}
