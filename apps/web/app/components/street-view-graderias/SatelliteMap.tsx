// components/street-view-graderias/SatelliteMap.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../../lib/street-view-graderias/googleMapsLoader";
import { computeFootprintCorners } from "../../lib/street-view-graderias/utils";
import type { Gradia } from "../../lib/street-view-graderias/config";

interface Props {
  graderias: Gradia[];
  selectedId: string;
  onSelect: (gradia: Gradia) => void;
  center: [number, number]; // [lng, lat]
}

export default function SatelliteMap({ graderias, selectedId, onSelect, center }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Crear el mapa una sola vez
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local");
      return;
    }
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const { google } = window;

        mapRef.current = new google.maps.Map(containerRef.current, {
          center: { lat: center[1], lng: center[0] },
          zoom: 18,
          mapTypeId: "satellite",
          tilt: 0,
          streetViewControl: false,
          fullscreenControl: false,
        });
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dibujar/actualizar los polígonos de graderías cada vez que cambia la lista o la selección
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    const { google } = window;
    const map = mapRef.current;

    // Limpiar overlays previos
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    graderias.forEach((gradia) => {
      const isSelected = gradia.id === selectedId;

      const footprint =
        gradia.footprint && gradia.footprint.length >= 3
          ? gradia.footprint
          : (() => {
              const c = computeFootprintCorners(
                gradia.coords,
                gradia.widthMeters ?? 12,
                gradia.depthMeters ?? 6,
                gradia.orientationDeg ?? 0
              );
              return [c.frontLeft, c.frontRight, c.backRight, c.backLeft];
            })();

      const path = footprint.map(([lng, lat]) => ({ lat, lng }));

      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: isSelected ? "#ff5a3c" : "#ffa07a",
        strokeOpacity: 0.9,
        strokeWeight: isSelected ? 3 : 1.5,
        fillColor: "#ff5a3c",
        fillOpacity: isSelected ? 0.45 : 0.2,
        clickable: true,
        map,
      });

      polygon.addListener("click", () => onSelect(gradia));
      overlaysRef.current.push(polygon);

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-size:12px;font-weight:600;color:#222">${gradia.name}</div>`,
        position: { lat: gradia.coords[1], lng: gradia.coords[0] },
        disableAutoPan: true,
      });
      // Mostrar solo la etiqueta de la seleccionada para no saturar el mapa
      if (isSelected) {
        infoWindow.open(map);
        overlaysRef.current.push(infoWindow);
      }
    });

    // Centrar el mapa en la gradería seleccionada
    const selected = graderias.find((g) => g.id === selectedId);
    if (selected) {
      map.panTo({ lat: selected.coords[1], lng: selected.coords[0] });
    }
  }, [graderias, selectedId, onSelect]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
      {error && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            background: "rgba(20,20,25,0.9)",
            color: "#ff8a65",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            maxWidth: 320,
            zIndex: 10,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}