"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
  recorrido,
  Conjunto,
  conjuntos,
  posicionEnProgreso,
  calcularBloque,
  rumbo,
  destino,
  type Waypoint,
} from "./distancia/routeData";

L.Icon.Default.mergeOptions({
  iconUrl: (icon as { src?: string }).src ?? icon,
  shadowUrl: (iconShadow as { src?: string }).src ?? iconShadow,
});

/** Ícono circular con la careta del conjunto (o un punto de color si no hay imagen). */
function crearIcono(c: Conjunto) {
  const contenido = c.imagen
    ? `<img src="${c.imagen}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : "";

  return L.divIcon({
    className: "",
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50%;
      background: ${c.imagen ? "#0c0908" : c.color};
      border: 3px solid ${c.color};
      box-shadow: 0 0 0 2px rgba(255,255,255,0.5), 0 2px 6px rgba(0,0,0,0.4);
      overflow: hidden;
    ">${contenido}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const inicio = recorrido[0]!;
// Rumbo del primer tramo, para poner a los conjuntos "en fila" perpendicular a la calle de entrada
const rumboInicio = recorrido.length > 1 ? rumbo(recorrido[0]!, recorrido[1]!) : 0;
const perpendicularInicio = (rumboInicio + 90) % 360;

export type ConjuntoEnPista = Conjunto & { progreso: number | null };

type Props = {
  conjuntosEnPista: ConjuntoEnPista[];
  /** Se dispara al hacer click en un marcador de tramo, para verlo en Street View. */
  onSelectPunto?: (w: Waypoint) => void;
  /** Se dispara al hacer click en el marcador de un conjunto (en pista o esperando), para seguirlo. */
  onSelectConjunto?: (id: string) => void;
};

export default function RouteMapComponent({
  conjuntosEnPista,
  onSelectPunto,
  onSelectConjunto,
}: Props) {
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    setMontado(true);
  }, []);

  const polylinePositions = useMemo<[number, number][]>(
    () => recorrido.map((w) => [w.lat, w.lng]),
    []
  );

  const iconos = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    conjuntos.forEach((c) => {
      map[c.id] = crearIcono(c);
    });
    return map;
  }, []);

  // Conjuntos que todavía no entraron: se muestran en fila cerca del punto de inicio
  const esperando = conjuntosEnPista.filter((c) => c.progreso === null);

  if (!montado) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">
        Cargando mapa...
      </div>
    );
  }

  return (
    <MapContainer
      center={[inicio.lat, inicio.lng]}
      zoom={16}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline positions={polylinePositions} pathOptions={{ color: "#5c0d0d", weight: 4, opacity: 0.4 }} />

      {recorrido.map((w, i) => (
        <Marker
          key={`${w.id}-${i}`}
          position={[w.lat, w.lng]}
          eventHandlers={
            onSelectPunto ? { click: () => onSelectPunto(w) } : undefined
          }
        >
          <Popup>{w.tramo}</Popup>
        </Marker>
      ))}

      {/* Conjuntos que ya entraron: marcador + su "bloque" ocupado sobre la ruta */}
 {conjuntosEnPista
  .filter((c) => c.progreso !== null)
  .map((c) => {
    const bloque = calcularBloque(recorrido, c.progreso as number, c.tamanoBloqueM);
    return (
      <Fragment key={c.id}>
        <Polyline
          positions={bloque.trazo}
          pathOptions={{ color: c.color, weight: 10, opacity: 0.55, lineCap: "round" }}
        />

        {/* Careta de cola: cierre del bloque */}
        <Marker
          position={[bloque.cola.lat, bloque.cola.lng]}
          icon={iconos[c.id]}
          opacity={0.8}
          eventHandlers={
            onSelectConjunto ? { click: () => onSelectConjunto(c.id) } : undefined
          }
        >
          <Tooltip direction="bottom" offset={[0, 10]}>
            {c.nombre} · cola del bloque
          </Tooltip>
        </Marker>

        {/* Careta de cabeza: frente del bloque */}
        <Marker
          position={[bloque.frente.lat, bloque.frente.lng]}
          icon={iconos[c.id]}
          eventHandlers={
            onSelectConjunto ? { click: () => onSelectConjunto(c.id) } : undefined
          }
        >
          <Tooltip permanent direction="top" offset={[0, -20]} opacity={1}>
            {c.nombre}
          </Tooltip>
          <Popup>
            <strong>{c.nombre}</strong>
            <br />
            {bloque.frente.tramo} · {Math.round((c.progreso as number) * 100)}%
            <br />
            Bloque: ~{c.tamanoBloqueM} m
          </Popup>
        </Marker>
      </Fragment>
    );
  })}

      {/* Conjuntos esperando su turno: careta en fila junto al punto de inicio */}
      {esperando.map((c, j) => {
        const offsetM = (j - (esperando.length - 1) / 2) * 12; // 12m entre cada uno
        const pos = destino(inicio, offsetM, perpendicularInicio);
        return (
          <Marker
            key={`espera-${c.id}`}
            position={[pos.lat, pos.lng]}
            icon={iconos[c.id]}
            opacity={0.75}
            eventHandlers={
              onSelectConjunto ? { click: () => onSelectConjunto(c.id) } : undefined
            }
          >
            <Tooltip direction="top" offset={[0, -20]}>
              {c.nombre} · esperando entrada
            </Tooltip>
            <Popup>
              <strong>{c.nombre}</strong>
              <br />
              Esperando su turno para entrar
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}