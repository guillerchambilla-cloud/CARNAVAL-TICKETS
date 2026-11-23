"use client";

import { useState } from "react";

type Props = {
  texto: string;
  className?: string;
  limite?: number;
};

// Trunca la descripción a `limite` caracteres y agrega un "Ver más" que
// alterna a mostrar el texto completo (y viceversa con "Ver menos"). Si el
// texto entra dentro del límite, no muestra ningún botón.
export default function DescripcionExpandible({
  texto,
  className = "text-sm leading-relaxed text-gray-600",
  limite = 140,
}: Props) {
  const [expandido, setExpandido] = useState(false);
  const esLarga = texto.length > limite;
  const mostrado = expandido || !esLarga ? texto : `${texto.slice(0, limite).trimEnd()}…`;

  return (
    <p className={className}>
      {mostrado}
      {esLarga && (
        <button
          type="button"
          onClick={() => setExpandido((actual) => !actual)}
          className="ml-1 font-semibold text-brand-600 hover:underline"
        >
          {expandido ? "Ver menos" : "Ver más"}
        </button>
      )}
    </p>
  );
}
