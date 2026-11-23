"use client";

import { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
};

declare global {
  interface Window {
   
    __gmapsLoadingPromise?: Promise<void>;
  }
}

function cargarGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoadingPromise) return window.__gmapsLoadingPromise;

  window.__gmapsLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar la Maps JavaScript API"));
    document.head.appendChild(script);
  });
  return window.__gmapsLoadingPromise;
}

function distanciaMetros(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function rumbo(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function diferenciaAngular(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

const PASO_MINIMO_M = 4; // no revisar avance si nos movimos menos que esto
const TOLERANCIA_RUMBO_GRADOS = 55; // qué tan "derecho" debe estar el nodo conectado para tomarlo
const INTERVALO_CHEQUEO_MS = 500; // no golpear la API más seguido que esto
const DISTANCIA_SALTO_M = 25; // si nos alejamos más que esto sin un link válido, saltamos directo

/**
 * Vista de calle que "camina" automáticamente por los nodos reales conectados
 * de Street View, siguiendo la dirección del punto objetivo (lat/lng), en vez
 * de recargar una imagen estática en cada actualización. Usa la Maps JavaScript
 * API (StreetViewPanorama), que es el SKU "Dynamic Street View" (Pro) — 5,000
 * eventos gratis al mes, luego se cobra por evento.
 *
 * Setup adicional en Google Cloud además de Maps Embed API:
 * 1. Habilitar "Maps JavaScript API" en el mismo proyecto.
 * 2. En la API key, agregar "Maps JavaScript API" a las restricciones de API.
 */
export default function StreetViewLive({ lat, lng, label, className = "" }: Props) {
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<any>(null);
  const servicioRef = useRef<any>(null);
  const posicionActualRef = useRef<{ lat: number; lng: number } | null>(null);
  const linksActualesRef = useRef<any[]>([]);
  const ultimoChequeoRef = useRef(0);
  const listoRef = useRef(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Inicialización del panorama — una sola vez al montar
  useEffect(() => {
    if (!apiKey || !contenedorRef.current) return;
    let cancelado = false;

    cargarGoogleMaps(apiKey)
      .then(() => {
        if (cancelado || !contenedorRef.current) return;
        const google = window.google;

        const panorama = new google.maps.StreetViewPanorama(contenedorRef.current, {
          addressControl: false,
          showRoadLabels: false,
          motionTracking: false,
          motionTrackingControl: false,
          fullscreenControl: false,
          zoomControl: false,
          panControl: false,
        });
        panoramaRef.current = panorama;
        servicioRef.current = new google.maps.StreetViewService();

        panorama.addListener("position_changed", () => {
          const pos = panorama.getPosition();
          if (pos) posicionActualRef.current = { lat: pos.lat(), lng: pos.lng() };
        });
        panorama.addListener("links_changed", () => {
          linksActualesRef.current = panorama.getLinks() || [];
        });

        servicioRef.current.getPanorama(
          { location: { lat, lng }, radius: 50 },
          (data: any, status: string) => {
            if (!cancelado && status === "OK" && data?.location) {
              panorama.setPano(data.location.pano);
              listoRef.current = true;
            }
          }
        );
      })
      .catch(() => {
        /* si falla la carga del script, se queda mostrando el contenedor vacío */
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // Cada vez que llega una nueva posición objetivo, intenta avanzar por el
  // grafo real de panoramas en esa dirección, en vez de teletransportarse.
  useEffect(() => {
    if (!listoRef.current || !panoramaRef.current) return;

    const ahora = performance.now();
    if (ahora - ultimoChequeoRef.current < INTERVALO_CHEQUEO_MS) return;
    ultimoChequeoRef.current = ahora;

    const actual = posicionActualRef.current;
    if (!actual) return;

    const objetivo = { lat, lng };
    const distancia = distanciaMetros(actual, objetivo);
    if (distancia < PASO_MINIMO_M) return; // todavía no se movió lo suficiente

    const rumboDeseado = rumbo(actual, objetivo);
    const links = linksActualesRef.current;

    const candidatos = links
      .map((l: any) => ({ link: l, dif: diferenciaAngular(l.heading, rumboDeseado) }))
      .sort((a, b) => a.dif - b.dif);
    const mejor = candidatos[0];

    if (mejor && mejor.dif <= TOLERANCIA_RUMBO_GRADOS) {
      // Nodo conectado en la dirección correcta: "caminamos" hacia él.
      // Google anima la transición, igual que al hacer click en la flecha.
      panoramaRef.current.setPano(mejor.link.pano);
    } else if (distancia > DISTANCIA_SALTO_M) {
      // No hay nodo conectado hacia allá (o nos alejamos del grafo conocido):
      // buscamos el panorama real más cercano al objetivo y saltamos ahí.
      servicioRef.current?.getPanorama(
        { location: objetivo, radius: 50 },
        (data: any, status: string) => {
          if (status === "OK" && data?.location) {
            panoramaRef.current.setPano(data.location.pano);
          }
        }
      );
    }
  }, [lat, lng]);

  if (!apiKey) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-night text-white/60 text-xs text-center px-4 rounded-lg ${className}`}
      >
        Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden ${className}`}>
      <div ref={contenedorRef} className="w-full h-full" />
      {label && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none z-[1]">
          {label}
        </div>
      )}
    </div>
  );
}