// lib/recorrido-3d/streetview.utils.ts

/**
 * Cálculo de rumbo (bearing) inicial entre dos puntos GPS, en grados 0-360.
 * from/to en formato [lng, lat].
 */
export function bearingBetween(from: [number, number], to: [number, number]): number {
  const [lng1, lat1] = from.map(toRad) as [number, number];
  const [lng2, lat2] = to.map(toRad) as [number, number];

  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearingRad = Math.atan2(y, x);
  return (toDeg(bearingRad) + 360) % 360;
}

/**
 * Distancia aproximada en metros entre dos puntos GPS (fórmula haversine).
 */
export function distanceMeters(from: [number, number], to: [number, number]): number {
  const R = 6371000;
  const [lng1, lat1] = from.map(toRad) as [number, number];
  const [lng2, lat2] = to.map(toRad) as [number, number];
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * FOV horizontal (grados) para un nivel de zoom de Street View.
 * zoom 0 = 180° (fisheye completo), zoom 1 = 90°, zoom 2 = 45°...
 */
export function fovForZoom(zoom: number): number {
  return 180 / Math.pow(2, zoom);
}

/** Normaliza un ángulo a rango [-180, 180] */
export function normalizeAngle(deg: number): number {
  let a = deg % 360;
  if (a > 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

export interface ScreenProjection {
  visible: boolean;
  xPercent: number; // 0-100, posición horizontal relativa al contenedor
  yPercent: number; // 0-100, posición vertical relativa al contenedor
}

/**
 * Proyecta un punto GPS objetivo a coordenadas de pantalla (%) dentro del panorama,
 * dado el heading/pitch/zoom actuales de la cámara y la posición real del panorama.
 *
 * Aproximación: asume elevación 0 para el objetivo (sin datos de altura reales).
 * Si necesitás que la gradería "flote" a cierta altura, ajustá `targetElevationOffsetDeg`.
 */
export function projectTargetToScreen(params: {
  panoPosition: [number, number]; // [lng, lat] real del panorama (no el pedido, el snapeado)
  target: [number, number]; // [lng, lat] de la gradería
  heading: number; // pov.heading actual
  pitch: number; // pov.pitch actual
  zoom: number; // pov.zoom actual
  aspectRatio?: number; // width/height REAL del contenedor del panorama
  targetHeightMeters?: number; // altura del punto objetivo sobre el nivel de calle (0 = piso)
  cameraHeightMeters?: number; // altura aprox. de la cámara de Street View sobre el piso (~2.5m)
  pitchOffsetDeg?: number; // ajuste manual fino, si hace falta corregir a mano
}): ScreenProjection {
  const {
    panoPosition,
    target,
    heading,
    pitch,
    zoom,
    aspectRatio = 16 / 9,
    targetHeightMeters = 0,
    cameraHeightMeters = 2.5,
    pitchOffsetDeg = 0,
  } = params;

  const bearing = bearingBetween(panoPosition, target);
  const headingDiff = normalizeAngle(bearing - heading);

  // Pitch calculado por trigonometría real: cuanto más cerca el punto, más "abajo" cae en pantalla
  const dist = Math.max(distanceMeters(panoPosition, target), 0.1);
  const relativeHeight = cameraHeightMeters - targetHeightMeters;
  const targetPitchDeg = -toDeg(Math.atan2(relativeHeight, dist)) + pitchOffsetDeg;
  const pitchDiff = normalizeAngle(targetPitchDeg - pitch);

  // FOV horizontal según el zoom del panorama; FOV vertical derivado del
  // aspect ratio REAL del contenedor (no un factor fijo inventado)
  const halfHFovRad = toRad(fovForZoom(zoom)) / 2;
  const halfVFovRad = Math.atan(Math.tan(halfHFovRad) / aspectRatio);

  const headingDiffRad = toRad(headingDiff);
  const pitchDiffRad = toRad(pitchDiff);

  const visible =
    Math.abs(headingDiffRad) < halfHFovRad && Math.abs(pitchDiffRad) < halfVFovRad;

  // Proyección en perspectiva real (tan), no lineal — esto es lo que hace
  // que el punto se mantenga "pegado" al mundo real al rotar la cámara
  const xPercent = 50 + 50 * (Math.tan(headingDiffRad) / Math.tan(halfHFovRad));
  const yPercent = 50 - 50 * (Math.tan(pitchDiffRad) / Math.tan(halfVFovRad));

  return { visible, xPercent, yPercent };
}

/**
 * Punto de destino dado un origen, un rumbo (bearing) en grados y una distancia en metros.
 * Fórmula de destino esférico (Vincenty simplificado / esfera).
 */
export function destinationPoint(
  origin: [number, number],
  bearingDeg: number,
  distanceMeters: number
): [number, number] {
  const R = 6371000;
  const [lng, lat] = origin;
  const brng = toRad(bearingDeg);
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const d = distanceMeters / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [toDeg(lng2), toDeg(lat2)];
}

export interface FootprintCorners {
  frontLeft: [number, number];
  frontRight: [number, number];
  backRight: [number, number];
  backLeft: [number, number];
}

/**
 * Calcula las 4 esquinas GPS de una gradería rectangular, dado su centro,
 * ancho (a lo largo de la calle), profundidad (hacia atrás desde la calle)
 * y orientación (bearing de la calle en ese punto, en grados).
 */
export function computeFootprintCorners(
  center: [number, number],
  widthMeters: number,
  depthMeters: number,
  orientationDeg: number
): FootprintCorners {
  const halfWidth = widthMeters / 2;

  // Puntos a lo largo del eje de la calle (orientación) desde el centro
  const alongPlus = destinationPoint(center, orientationDeg, halfWidth);
  const alongMinus = destinationPoint(center, orientationDeg + 180, halfWidth);

  // Desde cada uno de esos puntos, desplazar hacia "atrás" (perpendicular) la profundidad
  const backBearing = orientationDeg + 90; // ajustar +90/-90 según de qué lado de la calle está

  return {
    frontLeft: alongMinus,
    frontRight: alongPlus,
    backRight: destinationPoint(alongPlus, backBearing, depthMeters),
    backLeft: destinationPoint(alongMinus, backBearing, depthMeters),
  };
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}