// lib/street-view-graderias/config.ts

export interface Gradia {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat] - centro de la gradería (usado si no hay footprint real)
  widthMeters?: number; // fallback: ancho estimado (solo si no hay footprint real)
  depthMeters?: number; // fallback: profundidad estimada
  orientationDeg?: number; // fallback: rumbo de la calle
  footprint?: [number, number][]; // POLÍGONO REAL (lng, lat) — si existe, se usa directo, ignora width/depth/orientation
}

// Coordenadas REALES sacadas del sistema "Metro Lineal" de la GAMO
// (https://metrolinealback.gamo.gob.bo/api/infopredio), features con
// nombre "GRADERIAS" y "PALCO OFICIAL" — son ubicaciones oficiales, no estimadas.
export const SAMPLE_GRADERIAS: Gradia[] = [
  {
    id: "gamo-324",
    name: "Graderías oficiales - Av. Cívica (entre Adolfo Mier y Junín)",
    coords: [-67.118128, -17.967553], // centroide del polígono real
    footprint: [
      [-67.118030839, -17.967201977],
      [-67.117994281, -17.967210629],
      [-67.118226648, -17.967905015],
      [-67.118260296, -17.967893424],
    ],
  },
  {
    id: "gamo-446",
    name: "Palco Oficial - Presidente Montes (entre Adolfo Mier y Bolívar)",
    coords: [-67.114955, -17.969585], // centroide aproximado
    footprint: [
      [-67.114854369, -17.969523344],
      [-67.114908763, -17.969684966],
      [-67.115037203, -17.969647662],
      [-67.114979932, -17.969486012],
    ],
  },
];