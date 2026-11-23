"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { setDemoRole, type User } from "@repo/auth";
import WhatsAppIcon from "@repo/ui/whatsapp-icon";
import {
  obtenerCarrito,
  limpiarCarrito,
  type Carrito,
} from "../../../lib/compra/carrito";
import { registrarCompra, confirmarCompra } from "../../../lib/compra/compra";
import { useGraderias } from "../../../lib/hooks/useGraderia";
import type { Compra } from "../../../../../../packages/types/compra";
import { nombreEvento } from "../../../../../../packages/types/evento";

type Paso =
  | "cargando"
  | "resumen"
  | "generando-qr"
  | "esperando-pago"
  | "confirmada";

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ComprarPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [paso, setPaso] = useState<Paso>("cargando");
  const [compra, setCompra] = useState<Compra | null>(null);

  // Datos del dueño de la gradería (propietario/contacto): el carrito solo
  // guarda id+nombre de la gradería, así que se buscan acá con el mismo
  // catálogo que usa la página de selección de asientos.
  const { graderias } = useGraderias(undefined, 0, carrito?.graderiaId ?? null);
  const graderia = graderias.find((g) => g.id === carrito?.graderiaId);
  const contactoDueno = graderia?.telefonoPropietario || graderia?.cedula;

  useEffect(() => {
    const currentUser = setDemoRole("cliente");

    const c = obtenerCarrito();
    if (!c || c.asientos.length === 0) {
      // no hay selección activa, no tiene sentido estar acá
      router.replace(`/graderias/${pathname.split("/")[2]}`);
      return;
    }

    setUser(currentUser);
    setCarrito(c);
    setPaso("resumen");
  }, [router, pathname]);

  const total = carrito?.asientos.reduce((sum, a) => sum + a.precio, 0) ?? 0;

  async function handleGenerarQR() {
    if (!user || !carrito) return;
    setPaso("generando-qr");

    const nuevaCompra = registrarCompra({
      userId: user.id,
      graderiaId: carrito.graderiaId,
      graderiaNombre: carrito.graderiaNombre,
      eventoId: carrito.eventoId,
      asientos: carrito.asientos.map((a) => ({
        id: a.id,
        fila: a.fila,
        numero: a.numero,
        precio: a.precio,
        zonaId: a.zonaId,
        zonaNombre: a.zonaNombre,
      })),
      total,
    });

    setCompra(nuevaCompra);
    setPaso("esperando-pago");
  }

  async function handleConfirmarPago() {
    if (!compra) return;
    setPaso("generando-qr"); // reusa el loading visual

    // simula validación de pago (webhook / polling real en producción)
    await new Promise((r) => setTimeout(r, 1600));

    const confirmada = confirmarCompra(compra.id);
    if (confirmada) {
      setCompra(confirmada);
      limpiarCarrito();
      setPaso("confirmada");
    }
  }

  if (paso === "cargando" || !carrito || !user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6">
        <p className="text-ink-muted">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-140 px-6 py-12">
      {/* PASO: resumen antes de pagar — se presenta como una factura, no
          como una lista suelta: encabezado con datos de la operación, ítems
          por asiento y total, igual que se leería un comprobante real. */}
      {paso === "resumen" && (
        <div className="mt-2 rounded-[20px] border border-brand-100 p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-dashed border-brand-200 pb-5">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                Factura de compra
              </p>
              <h1 className="mt-1 text-[22px] font-bold text-brand-900">
                {carrito.graderiaNombre}
              </h1>
              <p className="mt-1 text-xs font-semibold text-brand-600">
                {nombreEvento(carrito.eventoId)}
              </p>
              {graderia?.ubicacion && (
                <p className="mt-1 text-xs text-ink-muted">📍 {graderia.ubicacion}</p>
              )}
              <p className="mt-1 text-xs text-ink-subtle">
                {Array.from(new Set(carrito.asientos.map((a) => a.zonaNombre))).join(" · ")}
              </p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-right text-xs text-ink-subtle">
              {formatFecha(new Date().toISOString())}
            </p>
          </div>

          <div className="flex justify-between border-b border-brand-100 py-4 text-sm">
            <span className="text-ink-muted">Cliente</span>
            <span className="font-semibold text-ink">{user.name}</span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-ink-subtle">
              <span>Asiento</span>
              <span>Precio</span>
            </div>
            <div className="mt-2 divide-y divide-gray-100">
              {carrito.asientos.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      Fila {a.fila} · Asiento {a.numero}
                    </p>
                    <p className="text-xs text-ink-subtle">{a.zonaNombre}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-ink">
                    Bs {a.precio.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {(graderia?.propietario || contactoDueno) && (
            <div className="mt-4 space-y-2 rounded-xl bg-brand-100 p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-subtle">
                Datos del propietario
              </p>
              {graderia?.propietario && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Propietario</span>
                  <span className="font-semibold text-ink">{graderia.propietario}</span>
                </div>
              )}
              {contactoDueno && (
                <a
                  href={`https://wa.me/${contactoDueno.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-ink underline decoration-gray-300 underline-offset-2 hover:text-[#25D366]"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                  WhatsApp: {contactoDueno}
                </a>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-brand-200 pt-5">
            <span className="text-base font-bold text-brand-900">Total</span>
            <span className="font-mono text-2xl font-black text-brand-600">
              Bs {total.toFixed(2)}
            </span>
          </div>

          <motion.button
            onClick={handleGenerarQR}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="mt-6 w-full rounded-full bg-brand-600 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Generar código de pago
          </motion.button>
        </div>
      )}

      {/* PASO: generando (loading) */}
      {paso === "generando-qr" && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-[20px] border border-brand-100 p-10 shadow-sm">
          <svg
            className="h-8 w-8 animate-spin text-brand-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-ink-muted">Procesando…</p>
        </div>
      )}

      {/* PASO: QR generado, esperando pago */}
      {paso === "esperando-pago" && compra && (
        <div className="mt-8 flex flex-col items-center gap-6 rounded-[20px] border border-brand-100 p-8 text-center shadow-sm">
          <p className="text-[14px] text-ink-muted">
            Escanea el código con tu app de pagos para completar la compra
          </p>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${compra.codigoQR}`}
            alt="Código QR de pago"
            className="rounded-2xl border border-brand-100"
            width={220}
            height={220}
          />

          <p className="font-mono text-[13px] text-ink-muted">
            {compra.codigoQR}
          </p>
          <p className="font-mono text-[20px] font-bold text-brand-900">
            Bs {compra.total.toFixed(2)}
          </p>

          <motion.button
            onClick={handleConfirmarPago}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="w-full rounded-full bg-brand-600 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Simular pago confirmado
          </motion.button>
        </div>
      )}

      {/* PASO: confirmada — el comprobante final, mismo formato de factura
          que el resumen previo al pago, pero ahora con el número de orden
          real y el estado pagado. */}
      {paso === "confirmada" && compra && (
        <div className="mt-2 rounded-[20px] border border-green-100 bg-green-50/30 p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3 border-b border-dashed border-green-200 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                Comprobante de pago
              </p>
              <h1 className="text-[20px] font-bold text-brand-900">
                {compra.graderiaNombre}
              </h1>
              <p className="mt-1 text-xs font-semibold text-green-700">
                {nombreEvento(compra.eventoId)}
              </p>
              {graderia?.ubicacion && (
                <p className="mt-1 text-xs text-ink-muted">📍 {graderia.ubicacion}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 border-b border-green-100 py-4 text-sm">
            <span className="text-ink-muted">N.º de ticket</span>
            <span className="text-right font-mono font-semibold text-ink">{compra.id}</span>
            <span className="text-ink-muted">Fecha</span>
            <span className="text-right font-semibold text-ink">{formatFecha(compra.fecha)}</span>
            <span className="text-ink-muted">Cliente</span>
            <span className="text-right font-semibold text-ink">{user.name}</span>
          </div>

          {(graderia?.propietario || contactoDueno) && (
            <div className="mt-4 space-y-2 rounded-xl bg-white/60 p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-subtle">
                Datos del propietario
              </p>
              {graderia?.propietario && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Propietario</span>
                  <span className="font-semibold text-ink">{graderia.propietario}</span>
                </div>
              )}
              {contactoDueno && (
                <a
                  href={`https://wa.me/${contactoDueno.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-ink underline decoration-gray-300 underline-offset-2 hover:text-[#25D366]"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                  WhatsApp: {contactoDueno}
                </a>
              )}
            </div>
          )}

          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-ink-subtle">
              <span>Asiento</span>
              <span>Precio</span>
            </div>
            <div className="mt-2 divide-y divide-green-100">
              {compra.asientos.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      Fila {a.fila} · Asiento {a.numero}
                    </p>
                    <p className="text-xs text-ink-subtle">{a.zonaNombre}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-ink">
                    Bs {a.precio.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-green-200 pt-5">
            <span className="text-base font-bold text-brand-900">Total pagado</span>
            <span className="font-mono text-2xl font-black text-green-600">
              Bs {compra.total.toFixed(2)}
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 border-t border-dashed border-green-200 pt-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${compra.codigoQR}`}
              alt="Código QR de tu entrada"
              className="rounded-2xl border border-brand-100"
              width={180}
              height={180}
            />
            <p className="text-xs text-ink-subtle">
              Presentá este código QR en el ingreso.
            </p>
          </div>

          <motion.button
            onClick={() => router.push("/misAsientos")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="mt-6 w-full rounded-full bg-brand-600 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Ver mis entradas
          </motion.button>
        </div>
      )}
    </main>
  );
}
