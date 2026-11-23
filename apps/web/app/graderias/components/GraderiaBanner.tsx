"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Graderia } from "../../../../../packages/types/graderia";

type Props = {
  graderia: Graderia;
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_PASO = 0.5;

const distanciaEntreToques = (t1: React.Touch, t2: React.Touch) =>
  Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

const estados = {
  disponible: {
    texto: "Disponible",
    clases: "bg-green-100 text-green-700",
  },
  agotado: {
    texto: "Agotada",
    clases: "bg-red-100 text-red-700",
  },
  proximamente: {
    texto: "Próximamente",
    clases: "bg-yellow-100 text-yellow-700",
  },
};

// Banner compartido por Card, Sidebar y Hero. Al pasar el cursor hace un
// leve zoom para indicar que es interactivo; al hacer clic abre la imagen
// completa en un lightbox (sin recortar, object-contain también ahí).
export default function GraderiaBanner({ graderia }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const estado = estados[graderia.estado];

  const arrastre = useRef({ activo: false, inicioX: 0, inicioY: 0, posInicioX: 0, posInicioY: 0 });
  const pellizco = useRef<{ distancia: number; zoomInicial: number } | null>(null);
  const toqueUnico = useRef<{ x: number; y: number; posInicioX: number; posInicioY: number } | null>(null);

  useEffect(() => {
    setMontado(true);
  }, []);

  // Al abrir: bloquea el scroll del body (evita doble scroll en táctiles) y
  // permite cerrar con Escape. Se restaura todo al cerrar/desmontar.
  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  // Reinicia el zoom/paneo cada vez que se abre o cierra el visor.
  useEffect(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, [abierto]);

  const acercar = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_PASO).toFixed(2)));

  const alejar = () =>
    setZoom((z) => {
      const siguiente = Math.max(ZOOM_MIN, +(z - ZOOM_PASO).toFixed(2));
      if (siguiente === ZOOM_MIN) setPos({ x: 0, y: 0 });
      return siguiente;
    });

  const onWheelImagen = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) acercar();
    else alejar();
  };

  const onDoubleClickImagen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > ZOOM_MIN) {
      setZoom(ZOOM_MIN);
      setPos({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  };

  // El arrastre por Pointer Events se limita a mouse/pen: el táctil se
  // maneja aparte con Touch Events (ver más abajo) para no chocar con el
  // pellizco de dos dedos, que también dispara eventos de puntero.
  const onPointerDownImagen = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || zoom <= ZOOM_MIN) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = {
      activo: true,
      inicioX: e.clientX,
      inicioY: e.clientY,
      posInicioX: pos.x,
      posInicioY: pos.y,
    };
  };

  const onPointerMoveImagen = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !arrastre.current.activo) return;
    e.stopPropagation();
    setPos({
      x: arrastre.current.posInicioX + (e.clientX - arrastre.current.inicioX),
      y: arrastre.current.posInicioY + (e.clientY - arrastre.current.inicioY),
    });
  };

  const onPointerUpImagen = () => {
    arrastre.current.activo = false;
  };

  const onTouchStartImagen = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.stopPropagation();
      toqueUnico.current = null;
      pellizco.current = {
        distancia: distanciaEntreToques(e.touches[0]!, e.touches[1]!),
        zoomInicial: zoom,
      };
    } else if (e.touches.length === 1 && zoom > ZOOM_MIN) {
      e.stopPropagation();
      const t = e.touches[0]!;
      toqueUnico.current = { x: t.clientX, y: t.clientY, posInicioX: pos.x, posInicioY: pos.y };
    }
  };

  const onTouchMoveImagen = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pellizco.current) {
      e.stopPropagation();
      const actual = distanciaEntreToques(e.touches[0]!, e.touches[1]!);
      const factor = actual / pellizco.current.distancia;
      const nuevoZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(pellizco.current.zoomInicial * factor).toFixed(2)));
      setZoom(nuevoZoom);
      if (nuevoZoom === ZOOM_MIN) setPos({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && toqueUnico.current) {
      e.stopPropagation();
      const t = e.touches[0]!;
      setPos({
        x: toqueUnico.current.posInicioX + (t.clientX - toqueUnico.current.x),
        y: toqueUnico.current.posInicioY + (t.clientY - toqueUnico.current.y),
      });
    }
  };

  const onTouchEndImagen = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) pellizco.current = null;
    if (e.touches.length === 0) toqueUnico.current = null;
  };

  if (!graderia.banner) {
    return (
      <div className="px-4 pt-4">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${estado.clases}`}
        >
          {estado.texto}
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAbierto(true);
        }}
        aria-label={`Ver imagen completa de ${graderia.nombre}`}
        className="group relative block h-40 w-full cursor-zoom-in overflow-hidden bg-gray-100 sm:h-48 md:h-56 lg:h-64"
      >
        <Image
          src={graderia.banner}
          alt={graderia.nombre}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold ${estado.clases}`}
        >
          {estado.texto}
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
            🔍 Ver completa
          </span>
        </span>
      </button>

      {abierto &&
        montado &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAbierto(false);
              }}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 text-3xl leading-none text-white/80 transition hover:text-white"
            >
              ×
            </button>

            <div
              className="relative h-[80vh] max-h-[80vh] w-[95vw] max-w-[95vw] overflow-hidden sm:max-w-5xl"
              onClick={(e) => e.stopPropagation()}
              onWheel={onWheelImagen}
              onDoubleClick={onDoubleClickImagen}
              onPointerDown={onPointerDownImagen}
              onPointerMove={onPointerMoveImagen}
              onPointerUp={onPointerUpImagen}
              onPointerLeave={onPointerUpImagen}
              onTouchStart={onTouchStartImagen}
              onTouchMove={onTouchMoveImagen}
              onTouchEnd={onTouchEndImagen}
              style={{ touchAction: "none" }}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                  transition:
                    arrastre.current.activo || toqueUnico.current || pellizco.current
                      ? "none"
                      : "transform 0.15s ease-out",
                  cursor: zoom > ZOOM_MIN ? "grab" : "zoom-in",
                }}
              >
                <Image
                  src={graderia.banner}
                  alt={graderia.nombre}
                  fill
                  sizes="95vw"
                  className="object-contain"
                  draggable={false}
                />
              </div>

              <div
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/60 px-4 py-2"
              >
                <button
                  type="button"
                  onClick={alejar}
                  disabled={zoom <= ZOOM_MIN}
                  aria-label="Reducir"
                  className="text-xl font-bold text-white/90 transition hover:text-white disabled:opacity-30"
                >
                  −
                </button>

                <span className="w-12 text-center text-xs font-semibold text-white/90">
                  {Math.round(zoom * 100)}%
                </span>

                <button
                  type="button"
                  onClick={acercar}
                  disabled={zoom >= ZOOM_MAX}
                  aria-label="Ampliar"
                  className="text-xl font-bold text-white/90 transition hover:text-white disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
