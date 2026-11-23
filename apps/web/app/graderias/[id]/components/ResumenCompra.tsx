"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import WhatsAppIcon from "@repo/ui/whatsapp-icon";

import { Asiento } from "../../../../../../packages/types/asiento";
import { Graderia } from "../../../../../../packages/types/graderia";
import { Zona } from "../../../../../../packages/types/zona";
import { nombreEvento, type EventoId } from "../../../../../../packages/types/evento";
import { guardarCarrito } from "../../../lib/compra/carrito";

type Props = {
  graderia: Graderia;
  zonas: Zona[];
  seleccionados: Asiento[];
  eventoId: EventoId;
  onQuitar: (asiento: Asiento) => void;
};

export default function ResumenCompra({
  graderia,
  zonas,
  seleccionados,
  eventoId,
  onQuitar,
}: Props) {
  const router = useRouter();

  function zonaDe(asientoId: string): Zona | undefined {
    return zonas.find((zona) => zona.asientos.some((a) => a.id === asientoId));
  }

  const total = seleccionados.reduce(
    (total, asiento) => total + asiento.precio,
    0,
  );

  // El celular casi nunca está cargado en los datos de demo; la cédula sirve
  // de referencia de contacto alternativa cuando no hay celular.
  const contacto = graderia.telefonoPropietario || graderia.cedula;

  function handleContinuar() {
    guardarCarrito({
      graderiaId: graderia.id,
      graderiaNombre: graderia.nombre,
      eventoId,
      asientos: seleccionados.map((asiento) => {
        const zona = zonaDe(asiento.id);
        return { ...asiento, zonaId: zona?.id ?? "", zonaNombre: zona?.nombre ?? "" };
      }),
    });
    router.push(`/graderias/${graderia.id}/comprar`);
  }

  return (
    <aside className="sticky top-24 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-brand-900">Resumen</h2>
        {seleccionados.length > 0 && (
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-2xl font-bold text-brand-600">
            {seleccionados.length} {seleccionados.length === 1 ? "asiento" : "asientos"}
          </span>
        )}
      </div>

      <div className="mt-6 space-y-2.5 text-sm">
        <Info titulo="Evento" valor={nombreEvento(eventoId)} />
        <Info titulo="Ubicación" valor={graderia.ubicacion} />
        {graderia.propietario && <Info titulo="Propietario" valor={graderia.propietario} />}
        {contacto && (
          <a
            href={`https://wa.me/${contacto.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-ink underline decoration-brand-300 underline-offset-2 transition-colors hover:text-[#25D366]"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
            WhatsApp: {contacto}
          </a>
        )}
      </div>

      <hr className="my-6 border-brand-100" />

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-ink-subtle">
          Asientos
        </h3>

        {seleccionados.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand-200 py-8 text-center">
            <svg
              className="h-8 w-8 text-brand-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            <p className="text-sm text-ink-subtle">
              Tocá un asiento en el plano para agregarlo acá.
            </p>
          </div>
        ) : (
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {seleccionados.map((a) => {
                const zona = zonaDe(a.id);
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="group flex items-center gap-3 rounded-lg bg-brand-100 p-2.5"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: zona?.color ?? "#9ca3af" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        Fila {a.fila} · Asiento {a.numero}
                      </p>
                      <p className="truncate text-xs text-ink-subtle">
                        {zona?.nombre ?? "—"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      Bs {a.precio}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => onQuitar(a)}
                      aria-label={`Quitar asiento ${a.numero}`}
                      className="shrink-0 rounded-full p-1 text-brand-300 transition-colors hover:bg-red-50 hover:text-brand-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <hr className="my-6 border-brand-100" />

      <div className="flex justify-between text-xl font-bold text-ink">
        <span>Total</span>

        <span className="text-brand-600">Bs {total.toFixed(2)}</span>
      </div>

      <motion.button
        onClick={handleContinuar}
        disabled={seleccionados.length === 0}
        whileHover={seleccionados.length === 0 ? undefined : { y: -2 }}
        whileTap={seleccionados.length === 0 ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="mt-6 w-full rounded-xl bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continuar con la compra
      </motion.button>

      {seleccionados.length > 0 && (
        <p className="mt-3 text-center text-xs text-ink-subtle">
          Vas a generar un código QR para pagar en el siguiente paso.
        </p>
      )}
    </aside>
  );
}

type InfoProps = {
  titulo: string;
  valor: string;
};

function Info({ titulo, valor }: InfoProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-ink-subtle">{titulo}</span>

      <span className="text-right font-semibold text-ink">{valor}</span>
    </div>
  );
}
