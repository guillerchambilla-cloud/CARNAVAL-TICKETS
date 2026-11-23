"use client";

import { Asiento as AsientoType } from "../../../../../../packages/types/asiento";

type Props = {
  asiento: AsientoType;
  seleccionado: boolean;
  colorZona: string;
  nombreZona: string;
  onClick: (asiento: AsientoType) => void;
};

// Plomo neutro para "ocupado": deliberadamente sin relación con ninguna
// zona, para que se note que ya no depende de cuál sea (a diferencia de
// disponible/inhabilitado, que sí se pintan del color de su zona).
const PLOMO = "#9ca3af";

// disponible/inhabilitado no tienen un color fijo: usan el de su zona (visto
// en GestorVentas, panel del dueño) — pleno cuando se puede comprar, y
// atenuado (opacity-45) cuando todavía no está en ninguna fase de venta, así
// se distingue de un lejos pero se ve que es "de esa zona".
const estados = {
  disponible: {
    clases: "text-white cursor-pointer",
    texto: "Disponible",
    colorPropio: null as string | null,
  },

  ocupado: {
    clases: "text-white cursor-not-allowed",
    texto: "Ocupado",
    colorPropio: PLOMO,
  },

  revendido: {
    // No es cursor-pointer: se compra desde el mercado de reventa (al precio
    // de reventa), no seleccionándolo acá al precio original de la zona.
    clases: "text-white cursor-not-allowed",
    texto: "Disponible en reventa",
    colorPropio: "#a855f7",
  },

  inhabilitado: {
    clases: "text-white cursor-not-allowed opacity-45 hover:opacity-70",
    texto: "Inhabilitado",
    colorPropio: null as string | null,
  },
};

// Un asiento "inhabilitado" puede serlo por dos motivos muy distintos: (1)
// simplemente no está dentro de ninguna fase de venta activa todavía, o (2)
// el dueño lo eliminó a mano por alguna razón (asiento roto, vista
// obstruida, etc.). Solo el segundo caso trae motivoInhabilitado, así que
// lo usamos para darle una marca visual propia en vez de que se confunda
// con "todavía no está a la venta".
const ELIMINADO = {
  // Todo blanco — fondo, borde y número — sin ningún color, ni siquiera el
  // gris neutro que tenía antes: tiene que leerse como "esto no existe", no
  // como un estado más entre los demás. El shadow-sm de la base (siempre
  // aplicado) es lo único que lo distingue del fondo blanco de la página.
  clases: "bg-white border-white text-white cursor-not-allowed",
  texto: "No disponible",
  colorPropio: null as string | null,
};

export default function Asiento({ asiento, seleccionado, colorZona, nombreZona, onClick }: Props) {
  const eliminado = asiento.estado === "inhabilitado" && Boolean(asiento.motivoInhabilitado);
  const estado = eliminado ? ELIMINADO : estados[asiento.estado];
  const bloqueadoPorEstado =
    asiento.estado === "ocupado" || asiento.estado === "inhabilitado" || asiento.estado === "revendido";
  // Plomo/color de zona pintan el fondo entero, no solo el borde (a
  // diferencia del esquema anterior). Eliminado ignora todo esto: se queda
  // con su propio blanco+borde gris, definido en ELIMINADO.clases.
  const color = estado.colorPropio ?? colorZona;

  return (
    <div className="group relative shrink-0">
      {/* "Seleccionado" no puede depender de un color fijo (ej. rojo): si el
          dueño elige rojo para su zona (algo que puede hacer libremente en
          EditorZonas), un asiento seleccionado se pierde entre el resto de
          esa misma zona. Por eso acá el fondo se queda con el color real de
          la zona siempre, y lo seleccionado se marca con cosas que no
          compiten con ningún color: un doble anillo blanco+dorado, la ficha
          más grande/elevada, y un check — visible sea cual sea el color. */}
      <button
        disabled={bloqueadoPorEstado}
        onClick={() => onClick(asiento)}
        style={eliminado ? undefined : { backgroundColor: color, borderColor: color }}
        className={`
          relative
          h-10
          w-10
          rounded-md
          border-2
          text-[11px]
          font-bold
          shadow-sm
          transition-all

          ${estado.clases}

          ${
            seleccionado
              ? "z-10 scale-110 shadow-lg ring-2 ring-white ring-offset-2 ring-offset-gold-500"
              : "hover:scale-105"
          }
        `}
      >
        {asiento.numero}
        {seleccionado && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10">
            <svg
              className="h-3 w-3 text-brand-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </button>

      <div
        className="
        pointer-events-none
        absolute
        bottom-full
        left-1/2
        z-50
        mb-2
        hidden
        -translate-x-1/2
        whitespace-nowrap
        rounded-lg
        bg-gray-900
        px-3
        py-2
        text-xs
        text-white
        shadow-xl
        group-hover:block
      "
      >
        <p className="font-semibold">{asiento.numero}</p>
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/40" style={{ backgroundColor: colorZona }} />
          {nombreZona}
        </p>
        <p>Bs {asiento.precio}</p>
        <p>{estado.texto}</p>
        {eliminado && asiento.motivoInhabilitado && (
          <p className="text-white/70">Motivo: {asiento.motivoInhabilitado}</p>
        )}
      </div>
    </div>
  );
}
