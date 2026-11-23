"use client";

import { useEffect, useRef, useState } from "react";

type Variante = "recorrido" | "entrada";

type Props = {
  texto: string;
  variante: Variante;
};

const CLASES: Record<Variante, string> = {
  recorrido: "bg-brand-900 text-white font-bold",
  entrada: "border-2 border-dashed border-gray-300 text-gray-500 font-semibold",
};

const GAP_PX = 64; // gap-x-16
const PADDING_PX = 16; // px-2 a cada lado

// El plano de asientos suele ser mucho más ancho que la pantalla (scroll
// horizontal), así que un texto centrado único puede quedar fuera de vista
// al desplazarse. Se repite varias veces a lo largo de todo el ancho —sin
// animación, estático— para que siempre haya una copia visible sin importar
// el scroll.
//
// La cantidad de copias se mide en vez de fijarse a un número: si una copia
// completa no entra en el ancho disponible, mejor no mostrarla (en vez de
// cortarla a la mitad contra el borde).
export default function MarqueeBanner({ texto, variante }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const medidaRef = useRef<HTMLSpanElement>(null);
  const [copias, setCopias] = useState(1);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    const medida = medidaRef.current;
    if (!contenedor || !medida) return;

    function recalcular() {
      const anchoItem = medida!.getBoundingClientRect().width;
      const disponible = contenedor!.clientWidth - PADDING_PX;
      if (anchoItem <= 0 || disponible <= 0) return;
      const cantidad = Math.max(1, Math.floor((disponible + GAP_PX) / (anchoItem + GAP_PX)));
      setCopias(cantidad);
    }

    recalcular();
    const observer = new ResizeObserver(recalcular);
    observer.observe(contenedor);
    return () => observer.disconnect();
  }, [texto]);

  return (
    <div className={`relative h-9 w-full overflow-hidden rounded-lg ${CLASES[variante]}`} ref={contenedorRef}>
      {/* Copia invisible, fuera de flujo, solo para medir el ancho real de una frase. */}
      <span
        ref={medidaRef}
        className="invisible absolute whitespace-nowrap px-2 text-center text-xs tracking-[0.2em]"
        aria-hidden="true"
      >
        {texto}
      </span>
      <div className="absolute inset-0 flex flex-nowrap items-center justify-center gap-x-16 whitespace-nowrap px-2 text-center text-xs tracking-[0.2em]">
        {Array.from({ length: copias }).map((_, i) => (
          <span key={i}>{texto}</span>
        ))}
      </div>
    </div>
  );
}
