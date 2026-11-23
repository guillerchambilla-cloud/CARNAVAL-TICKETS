"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { getCurrentUser, setDemoRole, type User } from "@repo/auth";
import MotionLink from "../components/anime/MotionLink";
import { listarReventasActivas, comprarReventa } from "../lib/reventa/reventa";
import { registrarCompraReventa } from "../lib/compra/compra";
import type { Reventa } from "../../../../packages/types/reventa";
import { nombreEvento } from "../../../../packages/types/evento";

export default function ReventaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reventas, setReventas] = useState<Reventa[]>([]);
  const [checked, setChecked] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Reventa | null>(null);
  const [comprando, setComprando] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser() ?? setDemoRole("cliente");
    const userForPage = currentUser.role === "admin" ? setDemoRole("cliente") : currentUser;
    setUser(userForPage);
    setReventas(listarReventasActivas());
    setChecked(true);
  }, []);

  function abrirCompra(reventa: Reventa) {
    if (reventa.vendedorId !== user?.id) setSeleccionada(reventa);
  }

  async function confirmarCompra() {
    if (!user || !seleccionada) return;
    setComprando(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const resultado = comprarReventa(seleccionada.id, user.id);
    if (resultado) {
      registrarCompraReventa({
        userId: user.id,
        graderiaId: resultado.graderiaId,
        graderiaNombre: resultado.graderiaNombre,
        zonaNombre: resultado.zonaNombre,
        eventoId: resultado.eventoId,
        asiento: {
          id: resultado.asientoId,
          fila: resultado.asientoFila,
          numero: resultado.asientoNumero,
          precio: resultado.precio,
        },
        total: resultado.precio,
      });
      setReventas(listarReventasActivas());
      setSeleccionada(null);
    }
    setComprando(false);
  }

  if (!checked || !user)
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6">
        <p className="text-ink-muted">Cargando…</p>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-[28px] bg-brand-900 px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-500">
          Mercado entre asistentes
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-5xl uppercase sm:text-6xl">
              Reventa de asientos
            </h1>
            <p className="mt-3 max-w-2xl text-white/75">
              Encuentra entradas disponibles de otros asistentes para el
              Carnaval de Oruro.
            </p>
          </div>
          <MotionLink
            href="/misAsientos"
            className="rounded-full bg-white px-5 py-3 text-center text-sm font-bold text-brand-900"
          >
            Mis entradas
          </MotionLink>
        </div>
      </div>

      {reventas.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-brand-100 p-10 text-center shadow-sm">
          <p className="text-ink-muted">
            No hay asientos en reventa por ahora.
          </p>
          <Link
            href="/misAsientos"
            className="mt-4 inline-block font-semibold text-brand-600 hover:underline"
          >
            Publicar una entrada
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reventas.map((reventa) => (
            <TarjetaReventa
              key={reventa.id}
              reventa={reventa}
              esPropia={reventa.vendedorId === user.id}
              onBuy={() => abrirCompra(reventa)}
            />
          ))}
        </div>
      )}
      {seleccionada && (
        <ConfirmacionCompra
          reventa={seleccionada}
          loading={comprando}
          onClose={() => setSeleccionada(null)}
          onConfirm={confirmarCompra}
        />
      )}
    </main>
  );
}

function TarjetaReventa({
  reventa,
  esPropia,
  onBuy,
}: {
  reventa: Reventa;
  esPropia: boolean;
  onBuy: () => void;
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="overflow-hidden rounded-[22px] border border-brand-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="h-2 bg-brand-600" />
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          {nombreEvento(reventa.eventoId)}
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-faint">
          {reventa.zonaNombre}
        </p>
        <h2 className="mt-2 min-h-12 text-lg font-bold leading-snug text-brand-900">
          {reventa.graderiaNombre}
        </h2>
        <p className="mt-2 min-h-10 text-sm text-ink-muted">
          {reventa.graderiaUbicacion}
        </p>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-brand-100 px-4 py-3">
          <div>
            <p className="text-xs text-ink-subtle">Ubicación</p>
            <p className="font-bold text-brand-900">
              Fila {reventa.asientoFila} · N° {reventa.asientoNumero}
            </p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-600">
            Disponible
          </span>
        </div>
        <div className="mt-5 space-y-1 text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>Precio original</span>
            <span>Bs {reventa.precioOriginal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-brand-200 pt-3 text-base font-extrabold text-brand-900">
            <span>Total</span>
            <span>Bs {reventa.precio.toFixed(2)}</span>
          </div>
        </div>
        <motion.button
          onClick={onBuy}
          disabled={esPropia}
          whileHover={esPropia ? undefined : { y: -2 }}
          whileTap={esPropia ? undefined : { scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="mt-5 w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {esPropia ? "Esta entrada es tuya" : "Comprar entrada"}
        </motion.button>
      </div>
    </motion.article>
  );
}

function ConfirmacionCompra({
  reventa,
  loading,
  onClose,
  onConfirm,
}: {
  reventa: Reventa;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-black/50 p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
          Confirmar compra simulada
        </p>
        <h2 className="mt-2 text-xl font-extrabold text-brand-900">
          Fila {reventa.asientoFila} · Asiento {reventa.asientoNumero}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{reventa.graderiaNombre}</p>
        <p className="mt-1 text-xs font-semibold text-brand-600">{nombreEvento(reventa.eventoId)}</p>
        <div className="mt-6 rounded-xl bg-brand-100 p-4 text-sm">
          <div className="flex justify-between">
            <span>Entrada</span>
            <strong>Bs {reventa.precio.toFixed(2)}</strong>
          </div>
          <div className="mt-3 flex justify-between border-t border-brand-200 pt-3 text-base font-extrabold text-brand-900">
            <span>Total</span>
            <span>Bs {reventa.precio.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
          En esta demo, al confirmar se transferirá la entrada a “Mis entradas”
          y se generará un QR simulado.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-full border border-brand-300 py-3 font-semibold text-ink-muted"
          >
            Cancelar
          </button>
          <motion.button
            onClick={onConfirm}
            disabled={loading}
            whileHover={loading ? undefined : { y: -2 }}
            whileTap={loading ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex-1 rounded-full bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Procesando…" : "Confirmar compra"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
