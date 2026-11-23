"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import MotionLink from "../components/anime/MotionLink";
import { getCurrentUser, setDemoRole, type User } from "@repo/auth";
import WhatsAppIcon from "@repo/ui/whatsapp-icon";
import { getComprasByUser } from "../lib/compra/compra";
import type { Compra } from "../../../../packages/types/compra";
import type { Graderia } from "../../../../packages/types/graderia";
import { EVENTOS, nombreEvento, type EventoId } from "../../../../packages/types/evento";
import {
  puedeRevender,
  registrarReventa,
  yaEstaEnReventa,
} from "../lib/reventa/reventa";
import { useGraderias } from "../lib/hooks/useGraderia";
import {
  listarAsientosReservadosDeDueno,
  type AsientoReservado,
} from "../lib/panel-graderia/asientos-reservados";
import { claveAsiento } from "../lib/panel-graderia/disponibilidad";
import { codificarTicketQR } from "../lib/compra/ticket-qr";

type AsientoParaReventa = {
  graderiaId: string;
  graderiaNombre: string;
  zonaNombre: string;
  // Clave para registrar/consultar la reventa. Para compras es Compra.
  // asientos[].id (estable: nunca se compara contra el catálogo en vivo).
  // Para reservas del dueño NO puede ser Asiento.id — ese es un
  // crypto.randomUUID() que se regenera en cada carga de data/graderia.ts,
  // así que cambiaría en el próximo reload y "Publicado" dejaría de
  // matchear. Ahí se usa claveAsiento(zonaId, numero), que sí es estable.
  asientoId: string;
  asiento: { fila: string; numero: string; precio: number };
  // Para una compra real viene de Compra.eventoId; para una reserva del
  // dueño, de AsientoReservado.eventoId (las reservas también son por
  // evento — ver lib/panel-graderia/asientos-reservados.ts).
  eventoId: EventoId;
};

// "propia": la tenés vos y podés revenderla. "reventa": ya la publicaste en
// el mercado. "transferida": la revendiste y ya no es tuya (Compra vieja que
// se queda en el historial, pero sin ninguna acción disponible).
type EstadoAsiento = "propia" | "reventa" | "transferida";

// Fondo/borde suave por estado + un acento grueso a la izquierda (más
// saturado) para que el bloque del asiento resalte incluso dentro de una
// tarjeta con varios asientos de la misma gradería.
const cardClasesPorEstado: Record<EstadoAsiento, string> = {
  propia: "border-brand-200 bg-brand-100 border-l-4 border-l-brand-600",
  reventa: "border-amber-200 bg-amber-50 border-l-4 border-l-amber-500",
  transferida: "border-brand-200 bg-gray-50 border-l-4 border-l-gray-400",
};

export default function MisAsientosPage() {
  // Metadatos de gradería (propietario/ubicación/contacto) no cambian con el
  // evento, así que alcanza con un snapshot cualquiera para esos usos. Las
  // zonas SÍ pueden diferir por evento (el dueño puede redefinirlas
  // distinto para Convite y para Carnaval — ver EditorZonas), así que la
  // lista de "asientos reservados" del dueño necesita un snapshot POR
  // evento para no mezclar zonaId de un evento con el otro.
  const { graderias } = useGraderias();
  const { graderias: graderiasPrimerConvite } = useGraderias("primerConvite");
  const { graderias: graderiasCarnaval } = useGraderias("carnaval");
  const [user, setUser] = useState<User | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [checked, setChecked] = useState(false);
  const [asientoParaReventa, setAsientoParaReventa] =
    useState<AsientoParaReventa | null>(null);
  const [precioReventa, setPrecioReventa] = useState("");
  const [detalleQR, setDetalleQR] = useState<{
    compra: Compra;
    asiento: Compra["asientos"][number];
  } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser() ?? setDemoRole("cliente");
    const userForPage = currentUser.role === "admin" ? setDemoRole("cliente") : currentUser;
    setUser(userForPage);
    if (userForPage.role === "cliente") {
      setCompras(getComprasByUser(userForPage.id));
    }
    setChecked(true);
  }, []);

  const asientosReservados = useMemo(() => {
    if (user?.role !== "duenioGrad") return [];
    return EVENTOS.flatMap((evento) =>
      listarAsientosReservadosDeDueno(
        evento.id === "primerConvite" ? graderiasPrimerConvite : graderiasCarnaval,
        user.id,
        evento.id,
      ),
    );
  }, [graderiasPrimerConvite, graderiasCarnaval, user]);

  // Una misma gradería puede tener varias Compras separadas (compras hechas
  // en distintos momentos): se agrupan acá para que todos los tickets de esa
  // gradería aparezcan juntos en una sola tarjeta, en vez de una tarjeta por
  // cada Compra individual. Primer Convite y Carnaval de Oruro son entradas
  // independientes, así que también se agrupan por separado por evento.
  const comprasPorGraderia = useMemo(() => {
    const grupos = new Map<
      string,
      { graderiaId: string; graderiaNombre: string; eventoId: EventoId; compras: Compra[] }
    >();
    for (const compra of compras) {
      const clave = `${compra.graderiaId}:${compra.eventoId}`;
      const grupo = grupos.get(clave);
      if (grupo) {
        grupo.compras.push(compra);
      } else {
        grupos.set(clave, {
          graderiaId: compra.graderiaId,
          graderiaNombre: compra.graderiaNombre,
          eventoId: compra.eventoId,
          compras: [compra],
        });
      }
    }
    return Array.from(grupos.values());
  }, [compras]);

  function abrirReventa(compra: Compra, asiento: Compra["asientos"][number]) {
    setAsientoParaReventa({
      graderiaId: compra.graderiaId,
      graderiaNombre: compra.graderiaNombre,
      zonaNombre: asiento.zonaNombre,
      asientoId: asiento.id,
      asiento,
      eventoId: compra.eventoId,
    });
    setPrecioReventa(asiento.precio.toFixed(2));
  }

  function abrirReventaDesdeReserva(reservado: AsientoReservado) {
    setAsientoParaReventa({
      graderiaId: reservado.graderiaId,
      graderiaNombre: reservado.graderiaNombre,
      zonaNombre: reservado.zonaNombre,
      asientoId: claveAsiento(reservado.zonaId, reservado.asiento.numero),
      asiento: reservado.asiento,
      eventoId: reservado.eventoId,
    });
    setPrecioReventa(reservado.asiento.precio.toFixed(2));
  }

  function publicarReventa() {
    if (!user || !asientoParaReventa) return;
    const precio = Number(precioReventa);
    if (!Number.isFinite(precio) || precio <= 0) return;

    // No se libera la reserva acá: a diferencia de una compra normal, un
    // asiento reservado no tiene ningún registro que lo siga bloqueando por
    // su cuenta. Si se liberara ahora, quedaría sin nada que impida
    // comprarlo directo al precio original de la zona mientras sigue
    // publicado en /reventa (doble venta). Se queda "reservado" — y por lo
    // tanto "ocupado" en el catálogo — hasta que alguien lo compre de
    // verdad ahí (eso genera una Compra real que toma la posta).
    const { graderiaId, graderiaNombre, zonaNombre, asientoId, asiento, eventoId } = asientoParaReventa;
    const graderia = graderias.find((item) => item.id === graderiaId);
    registrarReventa({
      asientoId,
      vendedorId: user.id,
      precio,
      graderiaId,
      graderiaNombre,
      graderiaUbicacion:
        graderia?.ubicacion ?? "Ruta oficial del Carnaval de Oruro",
      zonaNombre,
      eventoId,
      asientoFila: asiento.fila,
      asientoNumero: asiento.numero,
      precioOriginal: asiento.precio,
    });
    setAsientoParaReventa(null);
  }

  if (!checked || !user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6">
        <p className="text-ink-muted">Cargando…</p>
      </main>
    );
  }

  const esDueno = user.role === "duenioGrad";

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col gap-4 border-b border-brand-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
            Mi cuenta
          </p>
          <h1 className="font-display mt-2 text-5xl uppercase text-brand-900 sm:text-6xl">
            {esDueno ? "Asientos reservados" : "Mis entradas"}
          </h1>
          <p className="mt-2 text-ink-muted">
            {esDueno
              ? "Asientos que reservaste para uso propio en las graderías que administrás."
              : `Entradas registradas a nombre de ${user.name}.`}
          </p>
        </div>
        <Link
          href="/reventa"
          className="inline-flex items-center justify-center rounded-full border border-brand-600 px-5 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-100"
        >
          Ver mercado de reventa →
        </Link>
      </div>

      {esDueno ? (
        asientosReservados.length === 0 ? (
          <div className="mt-8 rounded-[20px] border border-brand-100 p-10 text-center shadow-sm">
            <p className="text-ink-muted">
              Todavía no reservaste ningún asiento en tus graderías.
            </p>
            <MotionLink
              href="/panel-graderia"
              className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ir a tu panel
            </MotionLink>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {asientosReservados.map((reservado) => {
              const enReventa = yaEstaEnReventa(
                claveAsiento(reservado.zonaId, reservado.asiento.numero),
                reservado.eventoId,
              );
              const estado: EstadoAsiento = enReventa ? "reventa" : "propia";
              return (
                <TarjetaReservado
                  key={`${claveAsiento(reservado.zonaId, reservado.asiento.numero)}:${reservado.eventoId}`}
                  reservado={reservado}
                  estado={estado}
                  onPonerEnVenta={() => abrirReventaDesdeReserva(reservado)}
                />
              );
            })}
          </div>
        )
      ) : compras.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-brand-100 p-10 text-center shadow-sm">
          <p className="text-ink-muted">
            Todavía no tenés compras registradas.
          </p>
          <MotionLink
            href="/graderias"
            className="mt-4 inline-block rounded-full bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Buscar graderías
          </MotionLink>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {comprasPorGraderia.map((grupo) => {
            const graderia = graderias.find((item) => item.id === grupo.graderiaId);
            const totalGrupo = grupo.compras.reduce((sum, c) => sum + c.total, 0);
            const variasCompras = grupo.compras.length > 1;
            // El celular casi nunca está cargado en los datos de demo; la
            // cédula sirve de contacto alternativo cuando no hay celular
            // (mismo criterio que en ResumenCompra/comprar). wa.me solo
            // acepta dígitos, sin "+", espacios ni guiones.
            const contactoPropietario = graderia?.telefonoPropietario || graderia?.cedula || null;
            const numeroWhatsApp = contactoPropietario?.replace(/\D/g, "") || null;
            // grupo.compras siempre tiene al menos un elemento (así se arma
            // comprasPorGraderia), pero noUncheckedIndexedAccess no lo sabe.
            const primeraCompra = grupo.compras[0] ?? null;
            return (
            <article
              key={`${grupo.graderiaId}:${grupo.eventoId}`}
              className="overflow-hidden rounded-[24px] border border-brand-200 bg-white shadow-sm"
            >
              <div className="bg-brand-900 px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                      {nombreEvento(grupo.eventoId)}
                    </p>
                    <h2 className="mt-2 text-lg font-bold leading-snug">
                      {grupo.graderiaNombre}
                    </h2>
                  </div>
                  {!variasCompras && primeraCompra && <EstadoBadge estado={primeraCompra.estado} />}
                </div>
                <p className="mt-3 text-sm text-white/75">
                  <strong>Propietario:</strong> {graderia?.propietario ?? "Propietario no especificado"}
                </p>
                {numeroWhatsApp && (
                  <p className="mt-1 text-sm text-white/75">
                    <a
                      href={`https://wa.me/${numeroWhatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 underline decoration-white/40 underline-offset-2 hover:text-white"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 text-[#25D366]" />
                      WhatsApp: {contactoPropietario}
                    </a>
                  </p>
                )}
                <p className="mt-1 text-sm text-white/75">
                  📍 {graderia?.ubicacion ?? "Ubicación no disponible"}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {variasCompras
                    ? `${grupo.compras.length} compras registradas acá`
                    : primeraCompra?.origen === "reventa"
                      ? "Entrada adquirida en reventa"
                      : "Compra oficial"}
                </p>
              </div>
              <div className="space-y-5 p-6">
                {grupo.compras.map((compra) => (
                  <div key={compra.id} className="space-y-4">
                    {variasCompras && (
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-faint">
                        <span>
                          {compra.origen === "reventa" ? "Reventa" : "Compra"} · {new Date(compra.fecha).toLocaleDateString("es-BO")}
                        </span>
                        <EstadoBadge estado={compra.estado} />
                      </div>
                    )}
                    {compra.asientos.map((asiento) => {
                      const enReventa = yaEstaEnReventa(asiento.id, compra.eventoId);
                      const sePuedeRevender = puedeRevender(asiento.id, user.id, compra.eventoId);
                      const estado: EstadoAsiento = enReventa
                        ? "reventa"
                        : !sePuedeRevender
                          ? "transferida"
                          : "propia";
                      return (
                        <div
                          key={asiento.id}
                          className={`rounded-2xl border p-4 ${cardClasesPorEstado[estado]}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className={estado === "transferida" ? "opacity-60" : ""}>
                              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                                Tu ubicación · Zona {asiento.zonaNombre}
                              </p>
                              <p className="mt-1 text-lg font-bold text-brand-900">
                                Fila {asiento.fila} · Asiento {asiento.numero}
                              </p>
                              <p className="mt-1 text-sm text-ink-muted">
                                Precio pagado: Bs {asiento.precio.toFixed(2)}
                              </p>
                            </div>
                            <EstadoAsientoTag
                              estado={estado}
                              onClick={estado === "propia" ? () => setDetalleQR({ compra, asiento }) : undefined}
                            />
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-brand-200 pt-3">
                            <span className="text-xs text-ink-subtle">
                              Código: {compra.id}
                            </span>
                            {estado === "propia" && (
                              <button
                                onClick={() => abrirReventa(compra, asiento)}
                                className="text-sm font-bold text-brand-600 hover:underline"
                              >
                                Poner en Venta
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-brand-100 pt-3 text-sm">
                  <span className="text-ink-muted">
                    {variasCompras ? "Total de todas tus compras acá" : "Total de esta compra"}
                  </span>
                  <span className="font-bold text-brand-900">
                    Bs {totalGrupo.toFixed(2)}
                  </span>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      )}

      {asientoParaReventa && (
        <ReventaModal
          asiento={asientoParaReventa}
          precio={precioReventa}
          onPrecioChange={setPrecioReventa}
          onClose={() => setAsientoParaReventa(null)}
          onPublish={publicarReventa}
        />
      )}

      {detalleQR && (
        <QRModal
          compra={detalleQR.compra}
          asiento={detalleQR.asiento}
          graderia={graderias.find((g) => g.id === detalleQR.compra.graderiaId)}
          compradorNombre={user.name}
          onClose={() => setDetalleQR(null)}
        />
      )}
    </main>
  );
}

function TarjetaReservado({
  reservado,
  estado,
  onPonerEnVenta,
}: {
  reservado: AsientoReservado;
  estado: EstadoAsiento;
  onPonerEnVenta: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-brand-200 bg-white shadow-sm">
      <div className="bg-brand-900 px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
          {nombreEvento(reservado.eventoId)}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-snug">{reservado.graderiaNombre}</h2>
        <p className="mt-3 text-sm text-white/75">
          {reservado.zonaNombre} · Reservado para uso propio
        </p>
      </div>
      <div className="p-6">
        <div className={`rounded-2xl border p-4 ${cardClasesPorEstado[estado]}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Tu ubicación
              </p>
              <p className="mt-1 text-lg font-bold text-brand-900">
                Fila {reservado.asiento.fila} · Asiento {reservado.asiento.numero}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Precio de lista: Bs {reservado.asiento.precio.toFixed(2)}
              </p>
            </div>
            {estado === "reventa" && <EstadoAsientoTag estado={estado} />}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-brand-200 pt-3">
            <span className="text-xs text-ink-subtle">Reservado</span>
            {estado === "propia" && (
              <button
                onClick={onPonerEnVenta}
                className="text-sm font-bold text-brand-600 hover:underline"
              >
                Poner en Venta
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ReventaModal({
  asiento,
  precio,
  onPrecioChange,
  onClose,
  onPublish,
}: {
  asiento: AsientoParaReventa;
  precio: string;
  onPrecioChange: (value: string) => void;
  onClose: () => void;
  onPublish: () => void;
}) {
  const valor = Number(precio) || 0;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-black/50 p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Publicar en reventa
            </p>
            <h2 className="mt-2 text-xl font-bold text-brand-900">
              Fila {asiento.asiento.fila} · Asiento {asiento.asiento.numero}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {asiento.graderiaNombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-ink-muted"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <p className="mt-6 text-sm font-semibold text-ink">
          Evento: <span className="text-brand-600">{nombreEvento(asiento.eventoId)}</span>
        </p>
        <label className="mt-4 block text-sm font-semibold text-ink">
          Precio de reventa (Bs)
          <input
            autoFocus
            type="number"
            min="1"
            step="0.50"
            value={precio}
            onChange={(event) => onPrecioChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-brand-300 px-4 py-3 text-lg outline-none focus:border-brand-600"
          />
        </label>
        <div className="mt-4 rounded-xl bg-brand-100 p-4 text-sm">
          <div className="flex justify-between">
            <span>Precio original</span>
            <strong>Bs {asiento.asiento.precio.toFixed(2)}</strong>
          </div>
          <div className="mt-3 flex justify-between border-t border-brand-200 pt-3 font-bold text-brand-900">
            <span>Comprador paga</span>
            <span>Bs {valor.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-brand-300 py-3 font-semibold text-ink-muted"
          >
            Cancelar
          </button>
          <motion.button
            onClick={onPublish}
            disabled={valor <= 0}
            whileHover={valor <= 0 ? undefined : { y: -2 }}
            whileTap={valor <= 0 ? undefined : { scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex-1 rounded-full bg-brand-600 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            Publicar
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function EstadoAsientoTag({ estado, onClick }: { estado: EstadoAsiento; onClick?: () => void }) {
  if (estado === "reventa") {
    return (
      <span className="shrink-0 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
        En reventa
      </span>
    );
  }
  if (estado === "transferida") {
    return (
      <span className="shrink-0 rounded-full bg-gray-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
        Transferida
      </span>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="shrink-0 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-brand-700"
      >
        QR activo
      </button>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
      QR activo
    </span>
  );
}

function EstadoBadge({ estado }: { estado: Compra["estado"] }) {
  const label =
    estado === "confirmada"
      ? "Confirmada"
      : estado === "pendiente"
        ? "Pendiente"
        : "Cancelada";
  const color =
    estado === "confirmada"
      ? "bg-green-100 text-green-700"
      : estado === "pendiente"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-ink-muted";
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${color}`}
    >
      {label}
    </span>
  );
}

function QRModal({
  compra,
  asiento,
  graderia,
  compradorNombre,
  onClose,
}: {
  compra: Compra;
  asiento: Compra["asientos"][number];
  graderia: Graderia | undefined;
  compradorNombre: string;
  onClose: () => void;
}) {
  // El QR lleva la info de la entrada codificada adentro (no solo un id de
  // referencia): así el dueño puede leerla directo con la cámara, sin
  // necesitar acceso a este mismo localStorage/navegador.
  const datosQR = codificarTicketQR({
    compraId: compra.id,
    graderiaId: compra.graderiaId,
    graderiaNombre: compra.graderiaNombre,
    zonaNombre: asiento.zonaNombre,
    fila: asiento.fila,
    numero: asiento.numero,
    precio: asiento.precio,
    compradorNombre,
    estado: compra.estado,
    fecha: compra.fecha,
  });

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end bg-black/50 p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Entrada
            </p>
            <h2 className="mt-2 text-xl font-bold text-brand-900">
              {compra.graderiaNombre}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {graderia?.propietario ?? "Propietario no especificado"}
              {graderia?.ubicacion ? ` · ${graderia.ubicacion}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-ink-muted"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(datosQR)}`}
            alt="Código QR de la entrada"
            className="rounded-[16px] border border-brand-100"
            width={220}
            height={220}
          />
        </div>

        <div className="mt-6 space-y-2 rounded-xl bg-brand-100 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-subtle">Zona</span>
            <strong className="text-brand-900">{asiento.zonaNombre}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-subtle">Fila · Asiento</span>
            <strong className="text-brand-900">
              Fila {asiento.fila} · Asiento {asiento.numero}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-subtle">Precio pagado</span>
            <strong className="text-brand-900">Bs {asiento.precio.toFixed(2)}</strong>
          </div>
          <div className="flex justify-between border-t border-brand-200 pt-2">
            <span className="text-ink-subtle">Estado de la compra</span>
            <EstadoBadge estado={compra.estado} />
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-xs text-ink-subtle">{compra.codigoQR}</p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-brand-300 py-3 font-semibold text-ink-muted"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
