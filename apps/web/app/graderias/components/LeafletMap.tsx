"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { MapContainer, Marker, Polygon, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { Graderia, EstadoGraderia } from "../../../../../packages/types/graderia";

type Props = {
  graderias: Graderia[];
  selected: Graderia | null;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
};

// Encuadra el mapa para que entren todas las graderías filtradas — mismo
// comportamiento que "Mostrar en el mapa" de Booking: al cambiar la
// búsqueda/filtros, el mapa se reencuadra solo. Se dispara por la lista de
// ids (no por `selected`, que ya tiene su propio flyTo más abajo).
function EncuadrarResultados({ graderias }: { graderias: Graderia[] }) {
  const map = useMap();
  const idsClave = graderias.map((g) => g.id).join(",");

  useEffect(() => {
    if (graderias.length === 0) return;
    if (graderias.length === 1) {
      map.flyTo(graderias[0]!.center, 17, { duration: 0.6 });
      return;
    }
    const bounds = L.latLngBounds(graderias.map((g) => g.center));
    map.flyToBounds(bounds, { padding: [48, 48], duration: 0.6, maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsClave]);

  return null;
}

function FlyToSelected({ graderia }: { graderia: Graderia | null }) {
  const map = useMap();

  useEffect(() => {
    if (!graderia) return;
    map.flyTo(graderia.center, 18, { duration: 0.8 });
  }, [graderia, map]);

  return null;
}

// Probado contra el servidor de Esri en 10+ ubicaciones repartidas por todo
// el recorrido: z17 siempre trae imagen real, z18 siempre devuelve el mismo
// placeholder ("Map data not yet available"). No hay más detalle real que
// ofrecer pasado ese punto — el TileLayer sigue escalando el último tile
// real (ver maxNativeZoom más abajo), pero se ve borroso, no roto. Este
// aviso explica ESO, para que no se lea como que "se rompió" el mapa.
const MAX_ZOOM_SATELITAL_REAL = 17;

function AvisoLimiteSatelital({ activo }: { activo: boolean }) {
  const map = useMap();
  const [pasadoElLimite, setPasadoElLimite] = useState(() => map.getZoom() > MAX_ZOOM_SATELITAL_REAL);

  useEffect(() => {
    function actualizar() {
      setPasadoElLimite(map.getZoom() > MAX_ZOOM_SATELITAL_REAL);
    }
    actualizar();
    map.on("zoomend", actualizar);
    return () => {
      map.off("zoomend", actualizar);
    };
  }, [map]);

  if (!activo || !pasadoElLimite) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-1000 flex justify-center px-4">
      <p className="rounded-full bg-night/90 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg">
        📷 Este es el máximo detalle satelital disponible acá — tocá &quot;Ver calles&quot; para más precisión
      </p>
    </div>
  );
}

// Colores del "price tag" por estado — mismo criterio de semáforo que ya
// usaba la leyenda del mapa (verde/ámbar/rojo), pero acá coloreando la
// etiqueta de precio en sí, al estilo de los pines con precio de Booking.
const COLOR_POR_ESTADO: Record<EstadoGraderia, { bg: string; texto: string }> = {
  disponible: { bg: "#c71f1f", texto: "#ffffff" },
  proximamente: { bg: "#e8a33d", texto: "#240d0d" },
  agotado: { bg: "#9ca3af", texto: "#ffffff" },
};

// Color/ancho del contorno del predio dibujado sobre el mapa. Seleccionado
// usa un contorno dorado grueso (en vez del propio colorMapa) para que se
// note sin importar de qué color sea esa gradería en particular.
function estiloPoligono(graderia: Graderia, activo: boolean, resaltado: boolean): L.PathOptions {
  if (activo) {
    return { color: "#e8a33d", weight: 4, fillColor: graderia.colorMapa, fillOpacity: 0.65 };
  }
  if (resaltado) {
    return { color: graderia.colorMapa, weight: 3, fillColor: graderia.colorMapa, fillOpacity: 0.55 };
  }
  return { color: graderia.colorMapa, weight: 2, fillColor: graderia.colorMapa, fillOpacity: 0.3 };
}

function crearIconoPrecio(graderia: Graderia, activo: boolean, resaltado: boolean): L.DivIcon {
  const { bg, texto } = COLOR_POR_ESTADO[graderia.estado];
  const etiqueta = graderia.estado === "agotado" ? "Agotado" : `Bs ${graderia.precioMin}`;
  const escala = activo ? 1.22 : resaltado ? 1.1 : 1;
  const anillo = activo
    ? ", 0 0 0 3px #e8a33d, 0 0 0 7px rgba(232,163,61,0.35)"
    : resaltado
      ? ", 0 0 0 3px rgba(255,255,255,0.95)"
      : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative; transform: translate(-50%, -100%); transform-origin: bottom center;">
        ${
          activo
            ? `<span class="pin-pulse-ring" style="position:absolute; left:50%; bottom:0; width:16px; height:16px; margin-left:-8px; margin-bottom:-8px; border-radius:999px; background:#e8a33d;"></span>`
            : ""
        }
        <div style="
          position: relative;
          transform: scale(${escala});
          transform-origin: bottom center;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          padding: 6px 11px;
          border-radius: 999px;
          background: ${bg};
          color: ${texto};
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35)${anillo};
          transition: transform 0.15s ease;
          cursor: pointer;
        ">${etiqueta}</div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -34],
  });
}

export default function LeafletMap({ graderias, selected, hoveredId, onHover }: Props) {
  const router = useRouter();
  const [vistaSatelital, setVistaSatelital] = useState(false);

  // Los íconos son objetos nuevos en cada render de Leaflet si no se
  // memoizan por id+estado activo, lo que hace parpadear el marcador cada
  // vez que cambia el hover de un elemento distinto.
  const iconos = useMemo(() => {
    const mapa = new Map<string, L.DivIcon>();
    for (const graderia of graderias) {
      const activo = graderia.id === selected?.id;
      const resaltado = graderia.id === hoveredId;
      mapa.set(graderia.id, crearIconoPrecio(graderia, activo, resaltado));
    }
    return mapa;
  }, [graderias, selected?.id, hoveredId]);

  return (
    <div className="relative h-full w-full">
      {/* top-18 (no top-4) a propósito: el buscador + botón "Cerrar el
          mapa" de GraderiaMap.tsx flotan en toda la franja superior del
          mapa (inset-x-3/4, top-3/4) — con top-4 acá se superponían. */}
      <div className="absolute left-3 top-18 z-1000 max-w-[calc(100%-1.5rem)] rounded-xl bg-white/95 p-4 shadow-lg sm:left-4 sm:top-20">
        <h3 className="mb-3 text-sm font-bold text-brand-900">Recorrido Carnaval</h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-brand-600" />
            Disponible
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gold-500" />
            Próximamente
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gray-400" />
            Agotada
          </div>
        </div>

        <button
          onClick={() => setVistaSatelital((v) => !v)}
          className="mt-3 w-full rounded-md bg-brand-100 px-2 py-1.5 text-xs font-semibold text-brand-900 transition-colors hover:bg-brand-200"
        >
          {vistaSatelital ? "Ver calles" : "Ver satelital"}
        </button>
      </div>

      <MapContainer
        center={[-17.963, -67.113]}
        zoom={15}
        maxZoom={21}
        style={{ width: "100%", height: "100%" }}
      >
        {vistaSatelital ? (
          <TileLayer
            attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            // Probado contra el servidor: para Oruro, Esri tiene imagen real
            // hasta z17 — z18/z19 devuelven el mismo placeholder de "Map
            // data not yet available" (mismo archivo, byte a byte).
            // maxZoom tiene que igualar al del MapContainer (21): ponerle un
            // tope propio más bajo a la capa hace que directamente deje de
            // dibujar tiles pasado ese nivel (la imagen desaparece del todo
            // al acercar mucho) en vez de solo verse más borrosa, que es lo
            // que sí hace bien maxNativeZoom.
            maxZoom={21}
            maxNativeZoom={17}
          />
        ) : (
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={21}
            maxNativeZoom={19}
          />
        )}

        <EncuadrarResultados graderias={graderias} />
        <FlyToSelected graderia={selected} />
        <AvisoLimiteSatelital activo={vistaSatelital} />

        {/* Halo suave debajo del contorno seleccionado — se dibuja primero
            para quedar detrás del contorno nítido del polígono real. */}
        {selected && (
          <Polygon
            key={`${selected.id}-glow`}
            positions={selected.coords}
            pathOptions={{ color: "#e8a33d", weight: 11, opacity: 0.25, fillOpacity: 0 }}
            interactive={false}
          />
        )}

        {graderias.map((graderia) => {
          const activo = graderia.id === selected?.id;
          const resaltado = graderia.id === hoveredId;
          return (
            <Polygon
              key={`${graderia.id}-poligono`}
              positions={graderia.coords}
              pathOptions={estiloPoligono(graderia, activo, resaltado)}
              eventHandlers={{
                click: () => router.push(`/graderias/${graderia.id}`),
                mouseover: () => onHover(graderia.id),
                mouseout: () => onHover(null),
              }}
            />
          );
        })}

        {graderias.map((graderia) => (
          <Marker
            key={graderia.id}
            position={graderia.center}
            icon={iconos.get(graderia.id)}
            zIndexOffset={graderia.id === selected?.id ? 1000 : graderia.id === hoveredId ? 500 : 0}
            eventHandlers={{
              click: () => router.push(`/graderias/${graderia.id}`),
              mouseover: () => onHover(graderia.id),
              mouseout: () => onHover(null),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
