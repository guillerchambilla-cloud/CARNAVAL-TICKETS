export type Waypoint = {
  id: string;
  lat: number;
  lng: number;
  tramo: string; // nombre de la calle/tramo en este punto
};

/** Cualquier punto con lat/lng — usado para medir distancias sin exigir un Waypoint completo. */
export type PuntoGeo = { lat: number; lng: number };

/**
 * Recorrido de la Entrada del Carnaval de Oruro.
 * Generado a partir de 27 puntos marcados a mano sobre las calles reales
 * en Google My Maps (Mapa_sin_nombre.kmz).
 */
export const recorrido: Waypoint[] = [
  { id: "1", lat: -17.9580716, lng: -67.1049256, tramo: "Avenida Héroes del Chaco (inicio)" },
  { id: "2", lat: -17.9603859, lng: -67.1055672, tramo: "Jach`a Flores" },
  { id: "3", lat: -17.9605815, lng: -67.1056261, tramo: "Jach`a Flores" },
  { id: "4", lat: -17.9617141, lng: -67.1059262, tramo: "Jach`a Flores" },
  { id: "5", lat: -17.9624024, lng: -67.1062159, tramo: "Jach`a Flores" },
  { id: "6", lat: -17.9636496, lng: -67.1065755, tramo: "Facultad de Derecho" },
  { id: "7", lat: -17.9666274, lng: -67.1073775, tramo: "Facultad de Derecho" },
  { id: "8", lat: -17.9683884, lng: -67.1078526, tramo: "Av. 6 de Agosto y Ejército" },
  { id: "9", lat: -17.9717238, lng: -67.1088017, tramo: "Av. 6 de Agosto y Bolivar" },
  { id: "10", lat: -17.9714902, lng: -67.1098252, tramo: "Av. 6 de Agosto y Bolivar" },
  { id: "11", lat: -17.9712887, lng: -67.1106162, tramo: "Av. 6 de Agosto y Bolivar" },
  { id: "12", lat: -17.9709379, lng: -67.1117921, tramo: "Plaza Principal" },
  { id: "13", lat: -17.9706989, lng: -67.1126175, tramo: "Plaza Principal" },
  { id: "14", lat: -17.970192, lng: -67.1143813, tramo: "Plaza Principal" },
  { id: "15", lat: -17.9694056, lng: -67.1141476, tramo: "Plaza Principal" },
  { id: "16", lat: -17.96917, lng: -67.1149171, tramo: "Plaza Principal" },
  { id: "17", lat: -17.9699632, lng: -67.1152098, tramo: "Plaza Principal" },
  { id: "18", lat: -17.969196, lng: -67.1178847, tramo: "Bolivar y Petot (calle 13)" },
  { id: "19", lat: -17.9683365, lng: -67.1175766, tramo: "Adolfomier y Petot" },
  { id: "20", lat: -17.9681322, lng: -67.1180756, tramo: "Entrada Av. Cívica" },
  { id: "21", lat: -17.9672615, lng: -67.1178195, tramo: "Calle Junín (Subida a la Virgen)" },
  { id: "22", lat: -17.9671148, lng: -67.1180743, tramo: "Calle Junín y Linares" },
  { id: "23", lat: -17.9671646, lng: -67.1183103, tramo: "Calle Junín y Baptista" },
  { id: "24", lat: -17.9673317, lng: -67.118431, tramo: "Calle Junín y Baptista" },
  { id: "25", lat: -17.9673432, lng: -67.1185169, tramo: "Calle Junín y Baptista" },
  { id: "26", lat: -17.9674746, lng: -67.1185464, tramo: "Calle Junín y Baptista" },
  { id: "27", lat: -17.9674746, lng: -67.1187068, tramo: "Santuario Virgen del Socavon" },
];

export type Conjunto = {
  id: string;
  nombre: string;
  color: string;
  imagen?: string; // ruta a la careta, ej. "/caretas/diablada.png"
  /** Largo aproximado, en metros, que ocupa el bloque completo (bailarines + banda) mientras avanza. */
  tamanoBloqueM: number;
};

/** Conjuntos que entran al recorrido, en orden. Ajusta nombres/orden según tu Rol de Ingreso real. */
export const conjuntos: Conjunto[] = [
  { id: "diablada", nombre: "Diablada", color: "#b91c1c", imagen: "/caretas/diablada.png", tamanoBloqueM: 200 },
  { id: "morenada", nombre: "Morenada", color: "#d4a017", imagen: "/caretas/morenada.png", tamanoBloqueM: 200 },
  { id: "caporales", nombre: "Caporales", color: "#0f766e", imagen: "/caretas/caporales.png", tamanoBloqueM: 150 },
  { id: "tinku", nombre: "Tinku", color: "#6b7280", imagen: "/caretas/tinku.png", tamanoBloqueM: 200 },
  { id: "llamerada", nombre: "Llamerada", color: "#7c3aed", imagen: "/caretas/llamerada.png", tamanoBloqueM: 100 },
  { id: "kullawada", nombre: "Kullawada", color: "#db2777", imagen: "/caretas/kullawada.png", tamanoBloqueM: 150},
];

// 600,000 milisegundos = 10 minutos (600 segundos)
export const DURACION_RECORRIDO_MS = 600000; 

// 10,000 milisegundos = 10 segundos
export const INTERVALO_ENTRADA_MS = 50000;

export function distanciaMetros(a: PuntoGeo, b: PuntoGeo): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Distancia acumulada (metros) hasta cada waypoint de una ruta, empezando en 0. */
export function distanciasAcumuladas(ruta: Waypoint[]): number[] {
  const acumuladas: number[] = [0];
  for (let i = 1; i < ruta.length; i++) {
    acumuladas.push(acumuladas[i - 1]! + distanciaMetros(ruta[i - 1]!, ruta[i]!));
  }
  return acumuladas;
}

export function distanciaTotalDeRuta(ruta: Waypoint[]): number {
  const acumuladas = distanciasAcumuladas(ruta);
  return acumuladas[acumuladas.length - 1] ?? 0;
}

export const distanciaTotal = distanciaTotalDeRuta(recorrido);

/** Rumbo (heading, en grados 0-360) de a → b, para orientar la cámara de Street View. */
export function rumbo(a: PuntoGeo, b: PuntoGeo): number {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export type PosicionRecorrido = {
  lat: number;
  lng: number;
  tramo: string;
  heading: number;
};

/** Base: posición + rumbo a una DISTANCIA (m) dada desde el inicio de `ruta`. */
export function posicionADistancia(
  ruta: Waypoint[],
  distanciaObjetivo: number,
  acumuladas: number[] = distanciasAcumuladas(ruta)
): PosicionRecorrido {
  const total = acumuladas[acumuladas.length - 1] ?? 0;
  const objetivo = Math.min(Math.max(0, distanciaObjetivo), total);

  for (let i = 1; i < ruta.length; i++) {
    const anterior = ruta[i - 1]!;
    const actual = ruta[i]!;
    const dIni = acumuladas[i - 1]!;
    const dFin = acumuladas[i]!;
    const segmento = dFin - dIni;

    if (dFin >= objetivo || i === ruta.length - 1) {
      const t = segmento === 0 ? 0 : (objetivo - dIni) / segmento;
      const tClamped = Math.min(1, Math.max(0, t));
      return {
        lat: anterior.lat + (actual.lat - anterior.lat) * tClamped,
        lng: anterior.lng + (actual.lng - anterior.lng) * tClamped,
        tramo: tClamped > 0.5 ? actual.tramo : anterior.tramo,
        heading: rumbo(anterior, actual),
      };
    }
  }

  const ultimo = ruta[ruta.length - 1]!;
  const penultimo = ruta[ruta.length - 2] ?? ultimo;
  return { lat: ultimo.lat, lng: ultimo.lng, tramo: ultimo.tramo, heading: rumbo(penultimo, ultimo) };
}

export function posicionEnProgresoRuta(
  ruta: Waypoint[],
  progreso: number,
  distanciaTotalRuta: number = distanciaTotalDeRuta(ruta)
): PosicionRecorrido {
  return posicionADistancia(ruta, progreso * distanciaTotalRuta);
}

/** Compatibilidad con el código existente, que siempre usaba el recorrido de la Entrada. */
export function posicionEnProgreso(progreso: number): PosicionRecorrido {
  return posicionEnProgresoRuta(recorrido, progreso, distanciaTotal);
}

/**
 * Puntos [lat,lng] que dibujan el tramo ocupado por el "bloque" de un conjunto:
 * desde (distanciaFrente - bloqueM) hasta distanciaFrente, siguiendo la forma real de la ruta.
 */
export type Bloque = {
  frente: PosicionRecorrido;
  cola: PosicionRecorrido;
  trazo: [number, number][];
};

/**
 * Calcula el bloque completo de un conjunto: su careta de cabeza (frente, en `progreso`),
 * su careta de cola (bloqueM metros atrás) y el trazo que dibuja el tramo entre ambas.
 */
export function calcularBloque(
  ruta: Waypoint[],
  progreso: number,
  bloqueM: number,
  acumuladas: number[] = distanciasAcumuladas(ruta)
): Bloque {
  const total = acumuladas[acumuladas.length - 1] ?? 0;
  const distanciaFrente = Math.min(total, progreso * total);
  const distanciaCola = Math.max(0, distanciaFrente - bloqueM);

  const frente = posicionADistancia(ruta, distanciaFrente, acumuladas);
  const cola = posicionADistancia(ruta, distanciaCola, acumuladas);
  const intermedios = ruta.filter(
    (_, i) => acumuladas[i]! > distanciaCola && acumuladas[i]! < distanciaFrente
  );

  const trazo: [number, number][] = [
    [cola.lat, cola.lng],
    ...intermedios.map((w) => [w.lat, w.lng] as [number, number]),
    [frente.lat, frente.lng],
  ];

  return { frente, cola, trazo };
}

/** Compatibilidad: si en algún lado seguís usando solo el trazo. */
export function segmentoBloque(
  ruta: Waypoint[],
  progreso: number,
  bloqueM: number,
  acumuladas: number[] = distanciasAcumuladas(ruta)
): [number, number][] {
  return calcularBloque(ruta, progreso, bloqueM, acumuladas).trazo;
}

export const distanciaTotalRecorrido = distanciaTotal; // alias por si lo usás en otro lado

/** Punto destino a partir de un origen, una distancia (m) y un rumbo (grados). Usado para "hacer fila" cerca de un punto. */
export function destino(origen: PuntoGeo, distanciaM: number, rumboGrados: number): PuntoGeo {
  const R = 6371000;
  const brng = (rumboGrados * Math.PI) / 180;
  const lat1 = (origen.lat * Math.PI) / 180;
  const lng1 = (origen.lng * Math.PI) / 180;
  const dR = distanciaM / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dR) + Math.cos(lat1) * Math.sin(dR) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(dR) * Math.cos(lat1),
      Math.cos(dR) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}