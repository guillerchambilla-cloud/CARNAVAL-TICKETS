"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script"; // <-- Usamos el script oficial de Next.js

// ==========================================
// INTERFACES DICTADAS
// ==========================================

interface Punto {
  lat: number;
  lng: number;
}

interface Calle {
  nombre: string;
  puntos: Punto[];
}

interface PredioProps {
  id: string;
  center: [number, number];
  coordinates?: [number, number][]; 
  ubicacion?: string;
}

interface PredioStreetViewProps {
  predio: PredioProps;
  redCalles: Calle[];
  onPanoramaPosition?: (pos: Punto | null) => void;
  className?: string;
}

// ==========================================
// GEOLÓGICA Y MATEMÁTICA EN RUTA
// ==========================================

function calcularHeading(desde: Punto, hasta: Punto): number {
  const dLng = ((hasta.lng - desde.lng) * Math.PI) / 180;
  const lat1 = (desde.lat * Math.PI) / 180;
  const lat2 = (hasta.lat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

function destinoDesdeHeading(inicio: Punto, heading: number, distanciaMetros: number): Punto {
  const R = 6371000; 
  const d = distanciaMetros / R;
  const brng = (heading * Math.PI) / 180;
  const lat1 = (inicio.lat * Math.PI) / 180;
  const lon1 = (inicio.lng * Math.PI) / 180;

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lon2 * 180) / Math.PI,
  };
}

function distanciaMetros(p1: Punto, p2: Punto): number {
  const R = 6371000;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function obtenerVerticeMasCercanoARuta(poligono: [number, number][], redCalles: Calle[]): Punto {
  let mejorPunto = { lat: poligono[0]![0], lng: poligono[0]![1] };
  let distMinima = Infinity;

  for (const coord of poligono) {
    const pVertice = { lat: coord[0], lng: coord[1] };
    for (const calle of redCalles) {
      for (const pCalle of calle.puntos) {
        const dist = (pVertice.lat - pCalle.lat) ** 2 + (pVertice.lng - pCalle.lng) ** 2;
        if (dist < distMinima) {
          distMinima = dist;
          mejorPunto = pVertice;
        }
      }
    }
  }
  return mejorPunto;
}

// Función auxiliar para limpiar el texto (elimina acentos, mayúsculas y abreviaturas comunes)
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos/tildes
    .replace(/\b(av|av\.|avenida)\b/gi, "") // Remueve variaciones de Avenida
    .replace(/\b(cl|c\||calle)\b/gi, "")   // Remueve variaciones de Calle
    .replace(/\b(psg|pasaje)\b/gi, "")     // Remueve variaciones de Pasaje
    .replace(/[^a-z0-9]/g, "")             // Deja solo letras y números
    .trim();
}

function puntoMasCercanoEnRuta(
  redCalles: Calle[], 
  punto: Punto,
  nombreCalleDeseada?: string
): { lat: number; lng: number; headingCalle: number } | null {
  let mejor: { lat: number; lng: number; headingCalle: number } | null = null;
  let mejorDist = Infinity;

  let callesAEvaluar = redCalles;

  if (nombreCalleDeseada) {
    const busquedaNormalizada = normalizarTexto(nombreCalleDeseada);
    
    if (busquedaNormalizada.length > 0) {
      // Filtramos comparando los textos normalizados limpios
      const filtradas = redCalles.filter(c => {
        const nombreCalleRedNormalizado = normalizarTexto(c.nombre);
        return nombreCalleRedNormalizado.includes(busquedaNormalizada) || 
               busquedaNormalizada.includes(nombreCalleRedNormalizado);
      });

      if (filtradas.length > 0) {
        callesAEvaluar = filtradas;
      }
    }
  }

  // Si por algún motivo no encontramos la calle filtrada, el código caerá aquí con toda la red
  for (const calle of callesAEvaluar) {
    if (calle.puntos.length < 2) continue;
    for (let i = 0; i < calle.puntos.length - 1; i++) {
      const a = calle.puntos[i]!;
      const b = calle.puntos[i + 1]!;

      const dx = b.lng - a.lng;
      const dy = b.lat - a.lat;
      const largoCuadrado = dx * dx + dy * dy;

      let t = largoCuadrado === 0 ? 0 : ((punto.lng - a.lng) * dx + (punto.lat - a.lat) * dy) / largoCuadrado;
      t = Math.max(0, Math.min(1, t));

      const proyeccion = { lat: a.lat + t * dy, lng: a.lng + t * dx };
      const dist = (proyeccion.lat - punto.lat) ** 2 + (proyeccion.lng - punto.lng) ** 2;

      if (dist < mejorDist) {
        mejorDist = dist;
        mejor = { lat: proyeccion.lat, lng: proyeccion.lng, headingCalle: calcularHeading(a, b) };
      }
    }
  }
  return mejor;
}

// ==========================================
// COMPONENTE PRINCIPAL EXPORTADO
// ==========================================

export function PredioStreetView({ predio, redCalles, onPanoramaPosition, className }: PredioStreetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ajusteGrados, setAjusteGrados] = useState(0);
  const [apiLista, setApiLista] = useState(false);
  const panoramaRef = useRef<any>(null);

  // Verificar si la API ya se cargó en un render anterior
  useEffect(() => {
    if ((window as any).google && (window as any).google.maps) {
      setApiLista(true);
    }
  }, []);

  useEffect(() => {
    setAjusteGrados(0);
  }, [predio.id]);

  useEffect(() => {
    // Si el script de Google Maps no ha terminado de cargarse, esperamos silenciosamente
    if (!apiLista) return;

    let cancelado = false;
    setError(null);

    const g = (window as any).google;
    if (!g || !g.maps) {
      setError("El SDK de Google Maps no está disponible.");
      return;
    }

    if (!containerRef.current) return;

    const inicializarStreetView = async () => {
      const centro = { lat: predio.center[0], lng: predio.center[1] };
      
      const puntoFachada = predio.coordinates && predio.coordinates.length > 0
        ? obtenerVerticeMasCercanoARuta(predio.coordinates, redCalles)
        : centro;

let callePrincipal: string | undefined = undefined;
      if (predio.ubicacion) {
        // Divide por conectores comunes de direcciones bolivianas
        const partes = predio.ubicacion.split(/entre|esquina| esq | y /i);
        if (partes[0]) {
          // Si el texto empieza con "Plaza" o algo similar, lo ideal es mantener el nombre base
          callePrincipal = partes[0].trim(); 
        }
      }

      // Ahora el punto en ruta estará amarrado sí o sí a la calle principal limpia
      const puntoEnRuta = puntoMasCercanoEnRuta(redCalles, puntoFachada, callePrincipal);
      const streetViewService = new g.maps.StreetViewService();

      const buscarPanorama = (ubicacion: Punto, radio: number) =>
        new Promise<any>((resolve) => {
          streetViewService.getPanorama(
            { location: ubicacion, radius: radio, source: g.maps.StreetViewSource.OUTDOOR },
            (data: any, status: string) => {
              resolve(status === g.maps.StreetViewStatus.OK && data?.location?.latLng ? data : null);
            }
          );
        });

      let resultado: any = null;

      if (puntoEnRuta) {
        const distanciaFachadaACalle = distanciaMetros(puntoFachada, puntoEnRuta);
        
        if (distanciaFachadaACalle < 25) {
          const headingHaciaCalle = calcularHeading(puntoFachada, puntoEnRuta);
          const puntoCruzado = destinoDesdeHeading(puntoEnRuta, headingHaciaCalle, 20);
          resultado = await buscarPanorama(puntoCruzado, 25);
        }

        if (!resultado) {
          resultado = await buscarPanorama(puntoEnRuta, 30);
        }
      }

      if (!resultado) {
        resultado = await buscarPanorama(centro, 60);
      }

      if (cancelado) return;

      if (!resultado?.location?.latLng) {
        setError("No se encontraron imágenes de Street View en la calle principal de esta gradería.");
        onPanoramaPosition?.(null);
        return;
      }

      const posRealPanorama = {
        lat: resultado.location.latLng.lat(),
        lng: resultado.location.latLng.lng(),
      };
      onPanoramaPosition?.(posRealPanorama);

      const headingHaciaPredio = calcularHeading(posRealPanorama, centro);

      panoramaRef.current = new g.maps.StreetViewPanorama(containerRef.current, {
        position: posRealPanorama,
        pov: { heading: headingHaciaPredio + ajusteGrados, pitch: 5 },
        zoom: 0,
        addressControl: false,
        linksControl: false,
        panControl: false,
        enableCloseButton: false,
      });
    };

    inicializarStreetView().catch(() => {
      setError("Error al procesar la vista de Street View.");
    });

    return () => {
      cancelado = true;
    };
  }, [predio, redCalles, ajusteGrados, apiLista]);

  const girar = (grados: number) => {
    setAjusteGrados((prev) => prev + grados);
  };

  return (
    <>
      {/* Inyección limpia y nativa. 
        Al cargarse, cambia 'apiLista' a true y levanta el visor automáticamente.
      */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}`}
        onLoad={() => setApiLista(true)}
        strategy="afterInteractive"
      />

      <div className={`relative ${className}`}>
        {error ? (
          <div className="flex h-full min-h-[400px] items-center justify-center bg-neutral-100 p-4 text-center text-sm text-neutral-500">
            {error}
          </div>
        ) : (
          <div ref={containerRef} className="h-full w-full" />
        )}
        
        <div className="absolute bottom-4 left-4 z-10 flex gap-2">
          <button onClick={() => girar(-15)} className="rounded-md bg-white px-2 py-1 text-xs shadow-md hover:bg-neutral-50">
            ↺ Girar Izq
          </button>
          <button onClick={() => girar(15)} className="rounded-md bg-white px-2 py-1 text-xs shadow-md hover:bg-neutral-50">
            Girar Der ↻
          </button>
        </div>
      </div>
    </>
  );
}