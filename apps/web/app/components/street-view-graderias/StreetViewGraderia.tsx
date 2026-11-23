// components/street-view-graderias/StreetViewGraderia.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeFootprintCorners, projectTargetToScreen } from "../../lib/street-view-graderias/utils";
import { loadGoogleMaps } from "../../lib/street-view-graderias/googleMapsLoader";
import type { Gradia } from "../../lib/street-view-graderias/config";

interface ProjectedPoint {
  x: number;
  y: number;
  visible: boolean;
}

interface Props {
  gradia: Gradia;
}

export default function StreetViewGraderia({ gradia }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<any>(null);
  const panoPositionRef = useRef<[number, number] | null>(null);

  const [footprintPoints, setFootprintPoints] = useState<ProjectedPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Si la gradería tiene un footprint REAL (de la GAMO), se usa directo.
  // Si no, se calcula un rectángulo estimado a partir de width/depth/orientation.
  const footprintSource = useMemo<[number, number][]>(() => {
    if (gradia.footprint && gradia.footprint.length >= 3) {
      return gradia.footprint;
    }
    const corners = computeFootprintCorners(
      gradia.coords,
      gradia.widthMeters ?? 12,
      gradia.depthMeters ?? 6,
      gradia.orientationDeg ?? 0
    );
    return [corners.frontLeft, corners.frontRight, corners.backRight, corners.backLeft];
  }, [gradia]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en .env.local");
      return;
    }
    if (!containerRef.current) return;

    let cancelled = false;
    setError(null);

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const { google } = window;
        const streetViewService = new google.maps.StreetViewService();
        const [lng, lat] = gradia.coords;

        streetViewService.getPanorama(
          { location: { lat, lng }, radius: 80 },
          (data: any, status: any) => {
            if (cancelled) return;

            if (status !== "OK" || !data?.location?.latLng) {
              setError("No se encontró panorama de Street View cerca de este punto.");
              return;
            }

            const panoLatLng = data.location.latLng;
            const realPanoPos: [number, number] = [panoLatLng.lng(), panoLatLng.lat()];
            panoPositionRef.current = realPanoPos;

            const initialHeading = google.maps.geometry.spherical.computeHeading(
              panoLatLng,
              new google.maps.LatLng(lat, lng)
            );

            const panorama = new google.maps.StreetViewPanorama(containerRef.current, {
              pano: data.location.pano,
              pov: { heading: initialHeading, pitch: 0 },
              zoom: 1,
              addressControl: false,
              showRoadLabels: false,
              motionTracking: false,
              motionTrackingControl: false,
            });

            panoramaRef.current = panorama;

            const recompute = () => {
              const pov = panorama.getPov();
              const pos = panoPositionRef.current;
              if (!pos) return;

              const project = (target: [number, number]): ProjectedPoint => {
                const rect = containerRef.current?.getBoundingClientRect();
                const aspectRatio = rect && rect.height > 0 ? rect.width / rect.height : 16 / 9;

                const p = projectTargetToScreen({
                  panoPosition: pos,
                  target,
                  heading: pov.heading,
                  pitch: pov.pitch,
                  zoom: pov.zoom,
                  aspectRatio,
                });
                return { x: p.xPercent, y: p.yPercent, visible: p.visible };
              };

              const projected = footprintSource.map((point) => project(point));

              setFootprintPoints(projected);
            };

            panorama.addListener("pov_changed", recompute);
            panorama.addListener("position_changed", () => {
              const newPos = panorama.getPosition();
              if (newPos) {
                panoPositionRef.current = [newPos.lng(), newPos.lat()];
              }
              recompute();
            });

            recompute();
          }
        );
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [gradia]);

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

      {footprintPoints && footprintPoints.length >= 3 && footprintPoints.some((p) => p.visible) && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {/* Piso de la gradería (polígono real, cualquier cantidad de vértices) */}
          <polygon
            points={footprintPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="rgba(255,90,60,0.28)"
            stroke="#ff5a3c"
            strokeWidth={0.4}
          />
        </svg>
      )}

      {footprintPoints && footprintPoints.length > 0 && footprintPoints.some((p) => p.visible) && (
        <div
          style={{
            position: "absolute",
            left: `${footprintPoints.reduce((sum, p) => sum + p.x, 0) / footprintPoints.length}%`,
            top: `${Math.min(...footprintPoints.map((p) => p.y)) - 3}%`,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 6,
            background: "rgba(20,20,25,0.85)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: 4,
            whiteSpace: "nowrap",
          }}
        >
          {gradia.name}
        </div>
      )}
    </div>
  );
}