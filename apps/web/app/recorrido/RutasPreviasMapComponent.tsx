"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, CircleMarker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import {
  posicionEnProgresoRuta,
  calcularBloque,
  distanciaTotalDeRuta,
  rumbo,
  destino,
  type Conjunto,
  type Waypoint,
} from "./distancia/routeData";
import { rutasEnsayo, rutaDe, type GrupoEnsayo } from "./distancia/rutasEnsayo";

L.Icon.Default.mergeOptions({
  iconUrl: (icon as { src?: string }).src ?? icon,
  shadowUrl: (iconShadow as { src?: string }).src ?? iconShadow,
});

function crearIcono(c: Conjunto) {
  const contenido = c.imagen
    ? `<img src="${c.imagen}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 34px; height: 34px; border-radius: 50%;
      background: ${c.imagen ? "#0c0908" : c.color};
      border: 3px solid ${c.color};
      box-shadow: 0 0 0 2px rgba(255,255,255,0.5), 0 2px 6px rgba(0,0,0,0.4);
      overflow: hidden;
    ">${contenido}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export type GrupoEnPista = GrupoEnsayo & { progreso: number | null };

type Props = {
  gruposEnPista: GrupoEnPista[];
  /** Se dispara al hacer click en un punto de cualquiera de las rutas, para verlo en Street View. */
  onSelectPunto?: (w: Waypoint) => void;
  /** Se dispara al hacer click en el marcador de un grupo (en ruta o esperando). */
  onSelectGrupo?: (id: string) => void;
};

const centro = rutasEnsayo[0]!.puntos[0]!;

export default function RutasPreviasMapComponent({ gruposEnPista, onSelectPunto, onSelectGrupo }: Props) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  const iconos = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    gruposEnPista.forEach((g) => {
      map[g.id] = crearIcono(g);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Grupos que todavía no entraron a SU ruta, agrupados por ruta para hacerlos "fila" en cada inicio
  const esperandoPorRuta = useMemo(() => {
    const mapa: Record<string, GrupoEnPista[]> = {};
    gruposEnPista
      .filter((g) => g.progreso === null)
      .forEach((g) => {
        mapa[g.rutaId] = mapa[g.rutaId] ? [...mapa[g.rutaId]!, g] : [g];
      });
    return mapa;
  }, [gruposEnPista]);

  if (!montado) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-500">
        Cargando mapa...
      </div>
    );
  }

  return (
    <MapContainer center={[centro.lat, centro.lng]} zoom={13} style={{ width: "100%", height: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {rutasEnsayo.map((r) => (
        <Fragment key={r.id}>
          <Polyline
            positions={r.puntos.map((w) => [w.lat, w.lng] as [number, number])}
            pathOptions={{ color: "#5c0d0d", weight: 3, opacity: 0.35, dashArray: "6 6" }}
          />
          {/* Puntos clicables de cada ruta, para ver ese tramo en Street View */}
          {r.puntos.map((w) => (
            <CircleMarker
              key={w.id}
              center={[w.lat, w.lng]}
              radius={5}
              pathOptions={{ color: "#5c0d0d", fillColor: "#f5ead9", fillOpacity: 0.9, weight: 1.5 }}
              eventHandlers={onSelectPunto ? { click: () => onSelectPunto(w) } : undefined}
            >
              <Popup>{w.tramo}</Popup>
            </CircleMarker>
          ))}
        </Fragment>
      ))}

      {/* Grupos en ruta: marcador + su "bloque" ocupado */}
 {gruposEnPista
  .filter((g) => g.progreso !== null)
  .map((g) => {
    const ruta = rutaDe(g.rutaId);
    const total = distanciaTotalDeRuta(ruta);
    const bloque = calcularBloque(ruta, g.progreso as number, g.tamanoBloqueM);
    return (
      <Fragment key={g.id}>
        <Polyline
          positions={bloque.trazo}
          pathOptions={{ color: g.color, weight: 9, opacity: 0.55, lineCap: "round" }}
        />

        {/* Careta de cola */}
        <Marker
          position={[bloque.cola.lat, bloque.cola.lng]}
          icon={iconos[g.id]}
          opacity={0.8}
          eventHandlers={onSelectGrupo ? { click: () => onSelectGrupo(g.id) } : undefined}
        >
          <Tooltip direction="bottom" offset={[0, 10]}>
            {g.nombre} · cola del bloque
          </Tooltip>
        </Marker>

        {/* Careta de cabeza */}
        <Marker
          position={[bloque.frente.lat, bloque.frente.lng]}
          icon={iconos[g.id]}
          eventHandlers={onSelectGrupo ? { click: () => onSelectGrupo(g.id) } : undefined}
        >
          <Tooltip permanent direction="top" offset={[0, -18]} opacity={1}>
            {g.nombre}
          </Tooltip>
          <Popup>
            <strong>{g.nombre}</strong>
            <br />
            {bloque.frente.tramo} · {Math.round((g.progreso as number) * 100)}%
            <br />
            Bloque: ~{g.tamanoBloqueM} m
          </Popup>
        </Marker>
      </Fragment>
    );
  })}

      {/* Grupos esperando: careta en fila junto al inicio de SU ruta */}
      {rutasEnsayo.map((r) => {
        const esperando = esperandoPorRuta[r.id] ?? [];
        if (esperando.length === 0) return null;
        const inicioRuta = r.puntos[0]!;
        const rumboRuta = r.puntos.length > 1 ? rumbo(r.puntos[0]!, r.puntos[1]!) : 0;
        const perpendicular = (rumboRuta + 90) % 360;
        return esperando.map((g, j) => {
          const offsetM = (j - (esperando.length - 1) / 2) * 12;
          const pos = destino(inicioRuta, offsetM, perpendicular);
          return (
            <Marker
              key={`espera-${g.id}`}
              position={[pos.lat, pos.lng]}
              icon={iconos[g.id]}
              opacity={0.75}
              eventHandlers={onSelectGrupo ? { click: () => onSelectGrupo(g.id) } : undefined}
            >
              <Tooltip direction="top" offset={[0, -18]}>
                {g.nombre} · esperando entrada
              </Tooltip>
              <Popup>
                <strong>{g.nombre}</strong>
                <br />
                Esperando su turno para entrar
              </Popup>
            </Marker>
          );
        });
      })}
    </MapContainer>
  );
}
