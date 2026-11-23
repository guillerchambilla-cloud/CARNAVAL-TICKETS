"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Graderia } from "../../../../../packages/types/graderia";
import type { Asiento } from "../../../../../packages/types/asiento";
import type { Zona } from "../../../../../packages/types/zona";
import type { FaseDraft } from "../../../../../packages/types/graderiaDueno";
import { nombreEvento, type EventoId } from "../../../../../packages/types/evento";
import {
  claveAsiento,
  actualizarFase as actualizarFaseEnAlmacen,
  crearFase as crearFaseEnAlmacen,
  eliminarFase as eliminarFaseEnAlmacen,
  faseActiva,
  finalizarFase as finalizarFaseEnAlmacen,
  leerDisponibilidad,
} from "../../lib/panel-graderia/disponibilidad";
import {
  eliminarAsiento as eliminarAsientoEnAlmacen,
  habilitarAsiento as habilitarAsientoEnAlmacen,
  leerAsientosEliminados,
} from "../../lib/panel-graderia/asientos-eliminados";
import {
  reservarAsiento as reservarAsientoEnAlmacen,
  liberarAsiento as liberarAsientoEnAlmacen,
  leerAsientosReservados,
} from "../../lib/panel-graderia/asientos-reservados";
import MarqueeBanner from "../../components/anime/MarqueeBanner";

type Props = {
  graderia: Graderia;
  eventoId: EventoId;
  onClose: () => void;
};

type Tab = "fases" | "eliminar" | "reservar";

function fechaLocalEnDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

type AsientoDeZona = { zona: Zona; asiento: Asiento };

// Agrupa por fila combinando TODAS las zonas en un solo plano (no un box
// separado por zona): como una zona ya puede ser cualquier conjunto de
// asientos y no necesariamente un rectángulo, mostrarlas por separado
// dejaba filas repetidas o incompletas según la zona. Acá una fila mezcla
// asientos de distintas zonas y se ordena por columna real, no por el
// `orden` (que es relativo a cada zona).
function agruparPorFila(items: AsientoDeZona[]): [string, AsientoDeZona[]][] {
  const filas: Record<string, AsientoDeZona[]> = {};
  for (const item of items) {
    (filas[item.asiento.fila] ??= []).push(item);
  }
  // La fila "A" va pegada al recorrido/escenario (abajo del plano, igual que
  // en las demás vistas de la gradería), así que se ordena descendente.
  return Object.entries(filas).sort(([a], [b]) => b.localeCompare(a));
}

// Grid de asientos reales compartido por las 3 pestañas. Soporta seleccionar
// de a uno (click/tap) o varios a la vez arrastrando: `onIniciar` se dispara
// en el primer asiento tocado (mousedown/touchstart) y define qué pasa con
// los siguientes; `onContinuar` se dispara en cada asiento nuevo que el
// mouse/dedo atraviesa mientras se mantiene presionado.
function PlanoAsientos({
  zonas,
  colorDe,
  deshabilitado,
  onIniciar,
  onContinuar,
}: {
  zonas: Zona[];
  // Devuelve el color de fondo (estado: seleccionado/vendido/eliminado/etc.)
  // y, opcionalmente, clases extra (anillo de selección, color de texto). La
  // zona de cada asiento se marca aparte, con un borde del color de zona —
  // salvo que se pida `borde` explícito (ej. eliminado siempre va blanco
  // puro, sin importar la zona). `muted` atenúa el asiento (color de zona en
  // reposo); al seleccionarlo se quita `muted` y "brilla" en su color pleno.
  // `muyAtenuado` atenúa aún más (p. ej. asientos de otra fase mientras se
  // edita una fase, para que resalten los que sí se pueden agregar).
  // `seleccionado` es el mismo booleano que cada pestaña ya calcula para el
  // anillo del asiento real — se usa también en la vista general en
  // miniatura (ver vistaGeneral más abajo) para resaltarlo ahí igual.
  colorDe: (
    asiento: Asiento,
    clave: string,
    zona: Zona,
  ) => { color: string; extra?: string; borde?: string; muted?: boolean; muyAtenuado?: boolean; seleccionado?: boolean };
  deshabilitado: (asiento: Asiento, clave: string) => boolean;
  onIniciar: (clave: string) => void;
  onContinuar: (clave: string) => void;
}) {
  const arrastrando = useRef(false);
  const visitadas = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const arrastrandoRadar = useRef(false);
  const [puedeDeslizar, setPuedeDeslizar] = useState(false);
  const [scrollInfo, setScrollInfo] = useState({ left: 0, clientWidth: 0, scrollWidth: 0 });

  // Con el arrastre de un dedo ocupado en seleccionar asientos, el gesto
  // nativo de scroll horizontal deja de funcionar en mobile. Como recorrido
  // alternativo se usan solo las flechas de abajo (no rueda del mouse, para
  // no pelear con el scroll vertical de la página).
  useEffect(() => {
    function terminarArrastre() {
      arrastrando.current = false;
      visitadas.current.clear();
    }
    window.addEventListener("mouseup", terminarArrastre);
    window.addEventListener("touchend", terminarArrastre);
    window.addEventListener("touchcancel", terminarArrastre);
    return () => {
      window.removeEventListener("mouseup", terminarArrastre);
      window.removeEventListener("touchend", terminarArrastre);
      window.removeEventListener("touchcancel", terminarArrastre);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function actualizar() {
      setPuedeDeslizar(el!.scrollWidth > el!.clientWidth + 4);
      setScrollInfo({ left: el!.scrollLeft, clientWidth: el!.clientWidth, scrollWidth: el!.scrollWidth });
    }
    actualizar();
    el.addEventListener("scroll", actualizar, { passive: true });
    const observer = new ResizeObserver(actualizar);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", actualizar);
      observer.disconnect();
    };
  }, [zonas]);

  function empezar(clave: string) {
    arrastrando.current = true;
    visitadas.current = new Set([clave]);
    onIniciar(clave);
  }

  function entrar(clave: string) {
    if (!arrastrando.current || visitadas.current.has(clave)) return;
    visitadas.current.add(clave);
    onContinuar(clave);
  }

  function tocarMover(event: React.TouchEvent) {
    if (!arrastrando.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    const clave = document
      .elementFromPoint(touch.clientX, touch.clientY)
      ?.closest("[data-clave]")
      ?.getAttribute("data-clave");
    if (clave) {
      event.preventDefault();
      entrar(clave);
    }
  }

  function desplazar(direccion: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direccion * 220, behavior: "smooth" });
  }

  function irARatio(ratio: number) {
    const el = scrollRef.current;
    if (!el) return;
    const maximo = Math.max(0, el.scrollWidth - el.clientWidth);
    const destino = ratio * el.scrollWidth - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, Math.min(destino, maximo)), behavior: arrastrandoRadar.current ? "auto" : "smooth" });
  }

  function ratioDesdeEvento(clientX: number): number {
    const radar = radarRef.current;
    if (!radar) return 0;
    const rect = radar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }

  function iniciarArrastreRadar(e: React.PointerEvent) {
    arrastrandoRadar.current = true;
    irARatio(ratioDesdeEvento(e.clientX));
  }

  useEffect(() => {
    function mover(e: PointerEvent) {
      if (!arrastrandoRadar.current) return;
      irARatio(ratioDesdeEvento(e.clientX));
    }
    function soltar() {
      arrastrandoRadar.current = false;
    }
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
    };
  }, []);

  const todosLosAsientos: AsientoDeZona[] = zonas.flatMap((zona) =>
    zona.asientos.map((asiento) => ({ zona, asiento })),
  );
  const filasAgrupadas = agruparPorFila(todosLosAsientos);
  const columnas = Math.max(0, ...filasAgrupadas.map(([, items]) => items.length));

  // Vista general en miniatura: mismo concepto que en la compra del cliente
  // (AsientosGrid.tsx) — reusa el mismo colorDe de la pestaña activa, así
  // que la miniatura siempre refleja el mismo significado que el plano real
  // (vendido/reservado/eliminado/seleccionado según en qué pestaña estés).
  const vistaGeneral = useMemo(
    () => (
      <div
        className="grid h-full w-full gap-px"
        style={{
          gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${filasAgrupadas.length}, 1fr)`,
        }}
      >
        {filasAgrupadas.flatMap(([, items]) =>
          items
            .slice()
            .sort((a, b) => a.asiento.columna - b.asiento.columna)
            .map(({ zona, asiento }) => {
              const clave = claveAsiento(zona.id, asiento.numero);
              const resultado = colorDe(asiento, clave, zona);
              // Dorado fijo para lo seleccionado (nunca el color de zona):
              // mismo motivo que del lado del comprador — si la zona fuera
              // justo de un color parecido, un asiento elegido se perdería
              // entre el resto de esa misma zona.
              const color = resultado.seleccionado ? "#e8a33d" : resultado.color;
              return <div key={clave} style={{ backgroundColor: color }} />;
            }),
        )}
      </div>
    ),
    [filasAgrupadas, columnas, colorDe],
  );

  const necesitaRadar = scrollInfo.scrollWidth > scrollInfo.clientWidth + 8;
  const ratioInicio = scrollInfo.scrollWidth > 0 ? scrollInfo.left / scrollInfo.scrollWidth : 0;
  const ratioAncho =
    scrollInfo.scrollWidth > 0 ? Math.min(1, scrollInfo.clientWidth / scrollInfo.scrollWidth) : 1;

  return (
    <div className="mt-6">
      {necesitaRadar && (
        <div className="sticky top-0 z-20 mb-3 rounded-xl border border-brand-200 bg-white/95 p-3 backdrop-blur-sm">
          <p className="mb-2 text-xs font-semibold text-ink-faint">
            Vista general de la gradería — tocá o arrastrá para moverte
          </p>
          <div
            ref={radarRef}
            onPointerDown={iniciarArrastreRadar}
            className="relative h-20 w-full cursor-pointer overflow-hidden rounded-lg bg-brand-50 p-1 ring-1 ring-brand-200 sm:h-24"
          >
            {vistaGeneral}
            <div
              className="pointer-events-none absolute inset-y-1 rounded-sm ring-2 ring-brand-900 transition-all duration-75"
              style={{
                left: `${ratioInicio * 100}%`,
                width: `${Math.max(ratioAncho * 100, 3)}%`,
                boxShadow: "0 0 0 1000px rgba(255,255,255,0.35)",
              }}
            />
          </div>
        </div>
      )}

      <div ref={scrollRef} className="scrollbar-plano overflow-x-auto pb-2">
        <div className="min-w-max rounded-2xl bg-brand-100 p-4">
          <div className="mb-3">
            <MarqueeBanner texto="Ingreso Graderia" variante="entrada" />
          </div>
          <div className="space-y-1.5" onTouchMove={tocarMover}>
            {filasAgrupadas.map(([fila, items]) => (
              <div key={fila} className="flex items-center gap-1.5">
                <span className="w-5 text-center text-xs font-bold text-ink-subtle">{fila}</span>
                {items
                  .sort((a, b) => a.asiento.columna - b.asiento.columna)
                  .map(({ zona, asiento }) => {
                    const clave = claveAsiento(zona.id, asiento.numero);
                    const bloqueado = deshabilitado(asiento, clave);
                    const { color, extra, borde, muted, muyAtenuado } = colorDe(asiento, clave, zona);
                    return (
                      <button
                        key={clave}
                        type="button"
                        data-clave={clave}
                        onMouseDown={() => empezar(clave)}
                        onMouseEnter={() => entrar(clave)}
                        onTouchStart={(event) => {
                          if (event.touches.length > 1) return;
                          event.preventDefault();
                          empezar(clave);
                        }}
                        title={`${zona.nombre} · Fila ${fila} · Asiento ${asiento.numero}`}
                        disabled={bloqueado}
                        style={{ backgroundColor: color, borderColor: borde ?? zona.color, touchAction: "none" }}
                        className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded border-2 text-[8px] font-bold shadow-sm transition ${extra ?? ""} ${muyAtenuado ? "opacity-20" : muted ? "opacity-45 hover:opacity-75" : ""}`}
                      >
                        {asiento.numero.split("-").pop()}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
          <div className="mt-3">
            <MarqueeBanner texto="Entrada del Carnaval de Oruro" variante="recorrido" />
          </div>
        </div>
      </div>
      {puedeDeslizar && (
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => desplazar(-1)}
            aria-label="Ver asientos anteriores"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-900 py-3 text-sm font-bold text-white shadow-md transition active:scale-95"
          >
            ‹ Anterior
          </button>
          <button
            type="button"
            onClick={() => desplazar(1)}
            aria-label="Ver más asientos"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-900 py-3 text-sm font-bold text-white shadow-md transition active:scale-95"
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
}

// Como ahora todas las zonas se muestran juntas en un solo plano, cada
// asiento se marca con un borde del color de su zona (el relleno queda
// libre para el color de estado: seleccionado/vendido/eliminado/etc.). El
// swatch de esta leyenda es, por lo mismo, un contorno y no un relleno.
function LeyendaZonas({ zonas }: { zonas: Zona[] }) {
  return (
    <>
      {zonas.map((zona) => (
        <span key={zona.id} className="inline-flex items-center gap-1">
          <i className="h-3 w-3 rounded border-2 bg-white" style={{ borderColor: zona.color }} />
          {zona.nombre}
        </span>
      ))}
    </>
  );
}

export default function GestorVentas({ graderia, eventoId, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("fases");

  // El modal se monta ya abierto (el padre lo renderiza condicionalmente), así
  // que basta con bloquear el scroll del body mientras esté montado: evita el
  // doble scroll (fondo + modal) típico en táctiles con overlays `fixed`.
  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  // --- claves vigentes de la gradería (para no mostrar conteos fantasma de
  // fases viejas que quedaron huérfanas tras una edición de zonas) ---
  const clavesVivas = new Set(
    graderia.zonas.flatMap((zona) => zona.asientos.map((asiento) => claveAsiento(zona.id, asiento.numero))),
  );

  // --- pestaña "Fases de venta" ---
  const [disponibilidad, setDisponibilidad] = useState(() => leerDisponibilidad(graderia.id, eventoId));
  const [nombre, setNombre] = useState("Preventa 1");
  // Por defecto arranca hoy: una fase que se crea normalmente se quiere
  // activa de inmediato, no en una fecha de ejemplo fija que haya que
  // acordarse de cambiar.
  const [inicio, setInicio] = useState(() => fechaLocalEnDias(0));
  const [fin, setFin] = useState(() => fechaLocalEnDias(7));
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [modoPrecio, setModoPrecio] = useState<"original" | "personalizado">("original");
  const [precioVenta, setPrecioVenta] = useState("");
  const [errorFase, setErrorFase] = useState("");
  const [editandoFaseId, setEditandoFaseId] = useState<string | null>(null);
  // Al arrastrar, todos los asientos que se van tocando siguen la misma
  // acción que definió el primero (agregar o quitar) — así no "titila" al
  // pasar dos veces por el mismo asiento.
  const modoArrastreFase = useRef<"agregar" | "quitar">("agregar");

  const { fases } = disponibilidad;
  const expirada = (fase: FaseDraft) => new Date(`${fase.fechaFin}T23:59:59`).getTime() < Date.now();
  // Solo bloquea asientos que ya están en OTRA fase vigente (para no
  // duplicarlos entre dos fases activas a la vez). Los asientos de una fase
  // finalizada/vencida que no se vendieron quedan libres para elegir de
  // nuevo acá: meterlos en una fase nueva es la forma de rehabilitarlos. Al
  // editar una fase, se excluye a sí misma: si no, sus propios asientos se
  // verían como "bloqueados por otra fase" en su propio plano.
  const bloqueadosParaSeleccion = new Set(
    fases.filter((fase) => faseActiva(fase) && fase.id !== editandoFaseId).flatMap((fase) => fase.asientos),
  );

  function refrescarDisponibilidad() {
    setDisponibilidad(leerDisponibilidad(graderia.id, eventoId));
  }

  function iniciarSeleccionFase(clave: string) {
    modoArrastreFase.current = seleccionados.includes(clave) ? "quitar" : "agregar";
    aplicarSeleccionFase(clave);
  }

  function aplicarSeleccionFase(clave: string) {
    setSeleccionados((actuales) => {
      const yaEsta = actuales.includes(clave);
      if (modoArrastreFase.current === "agregar") return yaEsta ? actuales : [...actuales, clave];
      return yaEsta ? actuales.filter((item) => item !== clave) : actuales;
    });
  }

  function comenzarEdicionFase(fase: FaseDraft) {
    setEditandoFaseId(fase.id);
    setNombre(fase.nombre);
    setInicio(fase.fechaInicio);
    setFin(fase.fechaFin);
    setSeleccionados(fase.asientos);
    setModoPrecio(fase.precioVenta != null ? "personalizado" : "original");
    setPrecioVenta(fase.precioVenta != null ? String(fase.precioVenta) : "");
    setErrorFase("");
  }

  function cancelarEdicionFase() {
    setEditandoFaseId(null);
    setSeleccionados([]);
    setNombre("Venta anticipada");
    setInicio(fechaLocalEnDias(0));
    setFin(fechaLocalEnDias(7));
    setModoPrecio("original");
    setPrecioVenta("");
    setErrorFase("");
  }

  function confirmarFase() {
    if (!nombre.trim()) return setErrorFase("Escribe un nombre para la etapa de venta.");
    if (!inicio || !fin || inicio > fin) return setErrorFase("Revisa las fechas de inicio y fin.");
    if (!seleccionados.length) return setErrorFase("Selecciona al menos un asiento en el plano.");

    let precioVentaFase: number | null = null;
    if (modoPrecio === "personalizado") {
      const valor = Number(precioVenta);
      if (!precioVenta.trim() || !Number.isFinite(valor) || valor <= 0) {
        return setErrorFase("Define un precio de venta válido.");
      }
      precioVentaFase = valor;
    }

    if (editandoFaseId) {
      actualizarFaseEnAlmacen(graderia.id, eventoId, editandoFaseId, {
        nombre: nombre.trim(),
        fechaInicio: inicio,
        fechaFin: fin,
        asientos: seleccionados,
        precioVenta: precioVentaFase,
      });
      refrescarDisponibilidad();
      cancelarEdicionFase();
      return;
    }

    const fase: FaseDraft = {
      id: `fase-${Date.now()}`,
      nombre: nombre.trim(),
      fechaInicio: inicio,
      fechaFin: fin,
      asientos: seleccionados,
      finalizada: false,
      precioVenta: precioVentaFase,
    };
    crearFaseEnAlmacen(graderia.id, eventoId, fase);
    refrescarDisponibilidad();
    setSeleccionados([]);
    setNombre("Venta anticipada");
    setModoPrecio("original");
    setPrecioVenta("");
    setErrorFase("");
  }

  function finalizarFaseLocal(id: string) {
    finalizarFaseEnAlmacen(graderia.id, eventoId, id);
    refrescarDisponibilidad();
  }

  function eliminarFaseLocal(id: string) {
    const fase = fases.find((item) => item.id === id);
    if (!fase || !window.confirm(`¿Eliminar la fase “${fase.nombre}”?`)) return;
    eliminarFaseEnAlmacen(graderia.id, eventoId, id);
    refrescarDisponibilidad();
    if (editandoFaseId === id) cancelarEdicionFase();
  }

  // --- pestaña "Eliminar asientos" ---
  // A diferencia de Fases/Reservar, este registro es compartido entre los
  // dos eventos y se guarda por número de asiento, no por clave zona:numero
  // (ver comentario en lib/panel-graderia/asientos-eliminados.ts) — porque
  // zonaId puede diferir entre Convite y Carnaval si el dueño redefinió
  // zonas por separado, pero el número de un asiento (fila+columna) no
  // cambia. `asientosAEliminar`/el plano siguen operando con la clave
  // zona:numero (así comparten PlanoAsientos con las otras dos pestañas);
  // solo se traduce a número al leer/escribir el registro.
  function numeroDeClave(clave: string): string {
    return clave.slice(clave.lastIndexOf(":") + 1);
  }

  const [eliminados, setEliminados] = useState(() => leerAsientosEliminados(graderia.id));
  const [asientosAEliminar, setAsientosAEliminar] = useState<string[]>([]);
  // El primer asiento tocado define el modo: si ya estaba eliminado, el
  // arrastre solo suma otros asientos eliminados (para habilitarlos juntos);
  // si no, solo suma asientos normales (para eliminarlos juntos).
  const [modoEliminar, setModoEliminar] = useState<"eliminar" | "habilitar" | null>(null);
  const [motivo, setMotivo] = useState("");

  function refrescarEliminados() {
    setEliminados(leerAsientosEliminados(graderia.id));
  }

  // Igual que en Fases de venta: el primer asiento tocado decide si el gesto
  // agrega o quita (si ya estaba seleccionado), y esa decisión se mantiene
  // tanto arrastrando de canto a canto como haciendo clicks sueltos uno por
  // uno — a diferencia de antes, que reiniciaba la selección en cada click.
  const modoArrastreEliminar = useRef<"agregar" | "quitar">("agregar");

  function aplicarSeleccionEliminar(clave: string) {
    setAsientosAEliminar((actuales) => {
      const yaEsta = actuales.includes(clave);
      if (modoArrastreEliminar.current === "agregar") return yaEsta ? actuales : [...actuales, clave];
      return actuales.filter((item) => item !== clave);
    });
  }

  function iniciarSeleccionEliminar(clave: string) {
    const modoDeEste = eliminados[numeroDeClave(clave)]?.eliminado ? "habilitar" : "eliminar";
    if (asientosAEliminar.length > 0 && modoDeEste !== modoEliminar) return;
    if (asientosAEliminar.length === 0) {
      setModoEliminar(modoDeEste);
      setMotivo("");
    }
    modoArrastreEliminar.current = asientosAEliminar.includes(clave) ? "quitar" : "agregar";
    aplicarSeleccionEliminar(clave);
  }

  function continuarSeleccionEliminar(clave: string) {
    const modoDeEste = eliminados[numeroDeClave(clave)]?.eliminado ? "habilitar" : "eliminar";
    if (modoDeEste !== modoEliminar) return;
    aplicarSeleccionEliminar(clave);
  }

  function eliminarSeleccionados() {
    if (!motivo.trim() || asientosAEliminar.length === 0) return;
    for (const clave of asientosAEliminar) {
      eliminarAsientoEnAlmacen(graderia.id, numeroDeClave(clave), motivo.trim());
    }
    refrescarEliminados();
    setMotivo("");
    setAsientosAEliminar([]);
    setModoEliminar(null);
  }

  function habilitarSeleccionados() {
    for (const clave of asientosAEliminar) {
      habilitarAsientoEnAlmacen(graderia.id, numeroDeClave(clave));
    }
    refrescarEliminados();
    setAsientosAEliminar([]);
    setModoEliminar(null);
  }

  // --- pestaña "Reservar asientos" ---
  const [reservados, setReservados] = useState(() => leerAsientosReservados(graderia.id, eventoId));
  const [asientosAReservar, setAsientosAReservar] = useState<string[]>([]);
  const [modoReserva, setModoReserva] = useState<"reservar" | "liberar" | "bloqueado" | null>(null);

  function refrescarReservados() {
    setReservados(leerAsientosReservados(graderia.id, eventoId));
  }

  function calcularModoReserva(clave: string): "reservar" | "liberar" | "bloqueado" {
    const registro = reservados[clave];
    if (registro?.reservado) return "liberar";
    if (registro?.reservaUnicaUsada) return "bloqueado";
    return "reservar";
  }

  // aplicarAsientosReservados (lib/panel-graderia/asientos-reservados.ts) deja
  // asiento.estado en "ocupado" para un asiento reservado por el dueño, igual
  // que una venta real: conceptualmente el dueño "se lo quedó". Pero acá adentro
  // sí necesitamos diferenciarlos: una venta real nunca se puede tocar, mientras
  // que una reserva del dueño se tiene que poder volver a liberar/editar en las
  // pestañas de Eliminar y Reservar.
  function esVendidoReal(asiento: Asiento, clave: string): boolean {
    return (asiento.estado === "ocupado" || asiento.estado === "revendido") && !reservados[clave]?.reservado;
  }

  // Mismo patrón que Fases de venta y Eliminar asientos: el primer asiento
  // tocado decide si el gesto agrega o quita, y esa decisión se respeta tanto
  // arrastrando como haciendo clicks sueltos uno por uno.
  const modoArrastreReserva = useRef<"agregar" | "quitar">("agregar");

  function aplicarSeleccionReservar(clave: string) {
    setAsientosAReservar((actuales) => {
      const yaEsta = actuales.includes(clave);
      if (modoArrastreReserva.current === "agregar") return yaEsta ? actuales : [...actuales, clave];
      return actuales.filter((item) => item !== clave);
    });
  }

  function iniciarSeleccionReservar(clave: string) {
    const modoDeEste = calcularModoReserva(clave);
    if (asientosAReservar.length > 0 && modoDeEste !== modoReserva) return;
    if (asientosAReservar.length === 0) setModoReserva(modoDeEste);
    modoArrastreReserva.current = asientosAReservar.includes(clave) ? "quitar" : "agregar";
    aplicarSeleccionReservar(clave);
  }

  function continuarSeleccionReservar(clave: string) {
    const modoDeEste = calcularModoReserva(clave);
    if (modoDeEste !== modoReserva || modoReserva === "bloqueado") return;
    aplicarSeleccionReservar(clave);
  }

  function reservarSeleccionados() {
    for (const clave of asientosAReservar) reservarAsientoEnAlmacen(graderia.id, eventoId, clave);
    refrescarReservados();
    setAsientosAReservar([]);
    setModoReserva(null);
  }

  function liberarSeleccionados() {
    for (const clave of asientosAReservar) liberarAsientoEnAlmacen(graderia.id, eventoId, clave);
    refrescarReservados();
    setAsientosAReservar([]);
    setModoReserva(null);
  }

  // --- "Seleccionar todo" / "Deseleccionar todo", una versión por pestaña
  // porque cada una tiene sus propias reglas de qué asiento es elegible. ---
  const asientosSeleccionablesFase = graderia.zonas.flatMap((zona) =>
    zona.asientos
      .filter((asiento) => {
        const clave = claveAsiento(zona.id, asiento.numero);
        const eliminado = Boolean(eliminados[asiento.numero]?.eliminado);
        const reservado = Boolean(reservados[clave]?.reservado);
        return !(esVendidoReal(asiento, clave) || eliminado || reservado || bloqueadosParaSeleccion.has(clave));
      })
      .map((asiento) => claveAsiento(zona.id, asiento.numero)),
  );

  function seleccionarTodoFase() {
    setSeleccionados(asientosSeleccionablesFase);
  }

  function deseleccionarTodoFase() {
    setSeleccionados([]);
  }

  const asientosSeleccionablesEliminar = graderia.zonas.flatMap((zona) =>
    zona.asientos
      .filter(
        (asiento) =>
          asiento.estado !== "ocupado" &&
          asiento.estado !== "revendido" &&
          !eliminados[asiento.numero]?.eliminado,
      )
      .map((asiento) => claveAsiento(zona.id, asiento.numero)),
  );

  function seleccionarTodoEliminar() {
    if (asientosSeleccionablesEliminar.length === 0) return;
    setModoEliminar("eliminar");
    setMotivo("");
    setAsientosAEliminar(asientosSeleccionablesEliminar);
  }

  function deseleccionarTodoEliminar() {
    setAsientosAEliminar([]);
    setModoEliminar(null);
  }

  const asientosSeleccionablesReservar = graderia.zonas.flatMap((zona) =>
    zona.asientos
      .filter((asiento) => {
        const clave = claveAsiento(zona.id, asiento.numero);
        return (
          !esVendidoReal(asiento, clave) &&
          !eliminados[asiento.numero]?.eliminado &&
          calcularModoReserva(clave) === "reservar"
        );
      })
      .map((asiento) => claveAsiento(zona.id, asiento.numero)),
  );

  function seleccionarTodoReservar() {
    if (asientosSeleccionablesReservar.length === 0) return;
    setModoReserva("reservar");
    setAsientosAReservar(asientosSeleccionablesReservar);
  }

  function deseleccionarTodoReservar() {
    setAsientosAReservar([]);
    setModoReserva(null);
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="mx-auto min-h-full max-w-6xl rounded-[28px] bg-brand-50 shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-brand-950 px-6 py-6 text-white sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500">
              Ventas · {nombreEvento(eventoId)}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold wrap-break-word">{graderia.nombre}</h2>
            <p className="mt-1 text-sm text-white/70">
              Gestiona las fases de venta y qué asientos están disponibles para este evento.
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 text-3xl leading-none text-white/80" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 border-b border-brand-200 px-6 sm:px-8">
          <button
            onClick={() => setTab("fases")}
            className={`border-b-2 px-2 py-3 text-center text-sm font-bold transition ${tab === "fases" ? "border-brand-600 text-brand-600" : "border-transparent text-ink-subtle hover:text-brand-900"}`}
          >
            <span className="sm:hidden">Fases</span>
            <span className="hidden sm:inline">Fases de venta</span>
          </button>
          <button
            onClick={() => setTab("reservar")}
            className={`border-b-2 px-2 py-3 text-center text-sm font-bold transition ${tab === "reservar" ? "border-brand-600 text-brand-600" : "border-transparent text-ink-subtle hover:text-brand-900"}`}
          >
            <span className="sm:hidden">Reservar</span>
            <span className="hidden sm:inline">Reservar asientos</span>
          </button>
          <button
            onClick={() => setTab("eliminar")}
            className={`border-b-2 px-2 py-3 text-center text-sm font-bold transition ${tab === "eliminar" ? "border-brand-600 text-brand-600" : "border-transparent text-ink-subtle hover:text-brand-900"}`}
          >
            <span className="sm:hidden">Eliminar</span>
            <span className="hidden sm:inline">Eliminar asientos</span>
          </button>
        </div>

        {tab === "fases" ? (
          <div className="grid min-w-0 gap-6 p-6 lg:grid-cols-[360px_minmax(0,1fr)] sm:p-8">
            <aside className="order-2 min-w-0 rounded-[22px] border border-brand-200 bg-white p-5 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                {editandoFaseId ? "Editar fase" : "Nueva fase"}
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-brand-900">Habilitar asientos</h3>
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-bold text-ink">
                  <span className="mb-2 block">Nombre de la etapa</span>
                  <input value={nombre} onChange={(event) => setNombre(event.target.value)} className="campo" />
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-bold text-ink">
                    <span className="mb-2 block">Desde</span>
                    <input type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} className="campo text-sm" />
                  </label>
                  <label className="block text-sm font-bold text-ink">
                    <span className="mb-2 block">Hasta</span>
                    <input type="date" value={fin} onChange={(event) => setFin(event.target.value)} className="campo text-sm" />
                  </label>
                </div>
                <div>
                  <span className="mb-2 block text-sm font-bold text-ink">Precio de venta</span>
                  <div className="space-y-2 rounded-xl border border-brand-300 p-3">
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="modoPrecioFase"
                        checked={modoPrecio === "original"}
                        onChange={() => setModoPrecio("original")}
                      />
                      Mantener precio original de la zona
                    </label>
                    <label className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="modoPrecioFase"
                        checked={modoPrecio === "personalizado"}
                        onChange={() => setModoPrecio("personalizado")}
                      />
                      Precio de venta personalizado
                    </label>
                    {modoPrecio === "personalizado" && (
                      <input
                        type="number"
                        min="1"
                        value={precioVenta}
                        onChange={(event) => setPrecioVenta(event.target.value)}
                        placeholder="Bs por asiento"
                        className="campo"
                      />
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-brand-100 p-4 text-sm">
                  <p className="font-bold text-brand-900">{seleccionados.length} asientos seleccionados</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-subtle">
                    Tocá un asiento libre en el plano, o arrastrá para elegir varios a la vez. Al finalizar la fase, sus asientos no vendidos quedarán no disponibles para las siguientes etapas.
                  </p>
                </div>
                {errorFase && <p className="text-sm font-semibold text-red-700">{errorFase}</p>}
                {editandoFaseId ? (
                  <div className="flex gap-3">
                    <button
                      onClick={confirmarFase}
                      className="flex-1 rounded-full bg-brand-600 py-3 text-sm font-bold text-white"
                    >
                      Guardar cambios
                    </button>
                    <button
                      onClick={cancelarEdicionFase}
                      className="rounded-full border border-brand-300 px-5 py-3 text-sm font-bold text-ink-muted"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button onClick={confirmarFase} className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white">
                    Crear fase de venta
                  </button>
                )}
              </div>
              <div className="mt-6 border-t border-brand-200 pt-5">
                <p className="text-sm font-bold text-brand-900">Fases configuradas ({fases.length})</p>
                <div className="mt-3 space-y-3">
                  {fases.length === 0 ? (
                    <p className="text-sm text-ink-subtle">No hay fases configuradas.</p>
                  ) : (
                    fases.map((fase) => {
                      const cerrada = fase.finalizada || expirada(fase);
                      const asientosVivos = fase.asientos.filter((clave) => clavesVivas.has(clave)).length;
                      return (
                        <div
                          key={fase.id}
                          className={`rounded-xl p-3 ${fase.id === editandoFaseId ? "bg-[#fdece9] ring-2 ring-brand-600/40" : "bg-brand-100"}`}
                        >
                          <div className="flex justify-between gap-2">
                            <div>
                              <p className="font-bold text-brand-900">{fase.nombre}</p>
                              <p className="text-xs text-ink-subtle">
                                {fase.fechaInicio} al {fase.fechaFin} · {asientosVivos} asientos ·{" "}
                                {fase.precioVenta != null ? `Bs ${fase.precioVenta}` : "precio de zona"}
                              </p>
                            </div>
                            <span className={`h-fit rounded-full px-2 py-1 text-[10px] font-bold ${cerrada ? "bg-gray-200 text-ink-muted" : "bg-green-100 text-green-700"}`}>
                              {cerrada ? "Cerrada" : "Programada"}
                            </span>
                          </div>
                          <div className="mt-2 flex gap-3 text-xs font-bold">
                            <button onClick={() => comenzarEdicionFase(fase)} className="text-brand-900">
                              {fase.id === editandoFaseId ? "Editando…" : "Editar"}
                            </button>
                            <button onClick={() => finalizarFaseLocal(fase.id)} disabled={cerrada} className="text-brand-600 disabled:text-ink-subtle">
                              Finalizar ahora
                            </button>
                            <button onClick={() => eliminarFaseLocal(fase.id)} className="text-ink-subtle">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </aside>
            <section className="order-1 min-w-0 rounded-[22px] border border-brand-200 bg-white p-5 lg:order-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Plano de preventa</p>
                  <h3 className="mt-2 text-xl font-extrabold text-brand-900">Tocá o arrastrá para habilitar o quitar</h3>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-bold">
                  <span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded border border-gray-300 bg-white" />Eliminado</span>
                  <span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded bg-[#3f3f46]" />Reservado</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                <LeyendaZonas zonas={graderia.zonas} />
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={seleccionarTodoFase}
                  disabled={seleccionados.length === asientosSeleccionablesFase.length}
                  className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Seleccionar todo
                </button>
                <button
                  type="button"
                  onClick={deseleccionarTodoFase}
                  disabled={seleccionados.length === 0}
                  className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Deseleccionar todo
                </button>
              </div>
              <PlanoAsientos
                zonas={graderia.zonas}
                deshabilitado={(asiento, clave) => {
                  const eliminado = Boolean(eliminados[asiento.numero]?.eliminado);
                  const reservado = Boolean(reservados[clave]?.reservado);
                  return esVendidoReal(asiento, clave) || eliminado || reservado || bloqueadosParaSeleccion.has(clave);
                }}
                colorDe={(asiento, clave, zona) => {
                  const seleccionado = seleccionados.includes(clave);
                  if (reservados[clave]?.reservado) return { color: "#3f3f46", extra: "cursor-not-allowed text-white" };
                  if (esVendidoReal(asiento, clave)) return { color: "#16a34a", extra: "cursor-not-allowed text-white" };
                  if (eliminados[asiento.numero]?.eliminado) return { color: "#ffffff", extra: "cursor-not-allowed text-white", borde: "#ffffff" };
                  // Habilitado en otra fase: color pleno de zona (ya está
                  // "activo"), pero sin poder tocarlo desde acá. Al editar una
                  // fase se atenúa más que los libres, para que resalten los
                  // asientos que sí se pueden sumar a la que se está editando.
                  if (bloqueadosParaSeleccion.has(clave))
                    return { color: zona.color, extra: "cursor-not-allowed text-white", muyAtenuado: Boolean(editandoFaseId) };
                  return seleccionado
                    ? { color: zona.color, extra: "text-white ring-2 ring-white/70 shadow-md", seleccionado: true }
                    : { color: zona.color, extra: "text-white", muted: true };
                }}
                onIniciar={iniciarSeleccionFase}
                onContinuar={aplicarSeleccionFase}
              />
              <p className="mt-5 rounded-xl bg-brand-100 p-3 text-xs leading-relaxed text-ink-subtle">
                La aplicación evaluará la fecha de fin de cada fase. Cuando termine, los asientos asignados y no vendidos se marcarán como no disponibles. “Finalizar ahora” permite demostrarlo sin esperar.
              </p>
            </section>
          </div>
        ) : tab === "eliminar" ? (
          <div className="grid min-w-0 gap-6 p-6 lg:grid-cols-[360px_minmax(0,1fr)] sm:p-8">
            <aside className="order-2 min-w-0 rounded-[22px] border border-brand-200 bg-white p-5 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                {asientosAEliminar.length > 1 ? `${asientosAEliminar.length} asientos seleccionados` : "Asiento seleccionado"}
              </p>
              {asientosAEliminar.length === 0 ? (
                <p className="mt-3 text-sm text-ink-subtle">
                  Tocá un asiento en el plano para eliminarlo o volver a habilitarlo, o arrastrá para elegir varios a la vez.
                </p>
              ) : modoEliminar === "habilitar" ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-brand-100 p-4 text-sm">
                    <p className="font-bold text-brand-900">
                      {asientosAEliminar.length === 1 ? "Asiento no disponible" : `${asientosAEliminar.length} asientos no disponibles`}
                    </p>
                    {asientosAEliminar.length === 1 && (
                      <p className="mt-1 text-xs text-ink-subtle">Motivo: {eliminados[numeroDeClave(asientosAEliminar[0]!)]?.motivo}</p>
                    )}
                  </div>
                  <button
                    onClick={habilitarSeleccionados}
                    className="w-full rounded-full bg-brand-900 py-3 text-sm font-bold text-white"
                  >
                    Habilitar de nuevo
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-bold text-ink">
                    <span className="mb-2 block">Motivo</span>
                    <textarea
                      value={motivo}
                      onChange={(event) => setMotivo(event.target.value)}
                      rows={3}
                      placeholder="Ej. Asiento roto, vista obstruida…"
                      className="campo resize-none"
                    />
                  </label>
                  <button
                    onClick={eliminarSeleccionados}
                    disabled={!motivo.trim()}
                    className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {asientosAEliminar.length > 1 ? `Eliminar ${asientosAEliminar.length} asientos` : "Eliminar asiento"}
                  </button>
                  <p className="text-xs leading-relaxed text-ink-subtle">
                    Podés volver a habilitarlos en cualquier momento, y eliminarlos de nuevo después si hace falta.
                  </p>
                </div>
              )}
            </aside>
            <section className="order-1 min-w-0 rounded-[22px] border border-brand-200 bg-white p-5 lg:order-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Plano de asientos</p>
                  <h3 className="mt-2 text-xl font-extrabold text-brand-900">Tocá o arrastrá para elegir asientos</h3>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-bold">
                  <span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded border border-gray-300 bg-white" />Eliminado</span>
                  <span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded bg-[#3f3f46]" />Reservado</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                <LeyendaZonas zonas={graderia.zonas} />
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={seleccionarTodoEliminar}
                  disabled={asientosSeleccionablesEliminar.length === 0 || asientosAEliminar.length === asientosSeleccionablesEliminar.length}
                  className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Seleccionar todo
                </button>
                <button
                  type="button"
                  onClick={deseleccionarTodoEliminar}
                  disabled={asientosAEliminar.length === 0}
                  className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Deseleccionar todo
                </button>
              </div>
              <PlanoAsientos
                zonas={graderia.zonas}
                deshabilitado={(asiento) => asiento.estado === "ocupado" || asiento.estado === "revendido"}
                colorDe={(asiento, clave, zona) => {
                  if (reservados[clave]?.reservado) return { color: "#3f3f46", extra: "cursor-not-allowed text-white" };
                  if (esVendidoReal(asiento, clave)) return { color: "#16a34a", extra: "cursor-not-allowed text-white" };
                  if (asientosAEliminar.includes(clave)) return { color: zona.color, extra: "text-white ring-2 ring-white/70 shadow-md", seleccionado: true };
                  if (eliminados[asiento.numero]?.eliminado) return { color: "#ffffff", extra: "text-ink-muted", borde: "#d1d5db" };
                  return { color: zona.color, extra: "text-white", muted: true };
                }}
                onIniciar={iniciarSeleccionEliminar}
                onContinuar={continuarSeleccionEliminar}
              />
            </section>
          </div>
        ) : (
          <div className="grid min-w-0 gap-6 p-6 lg:grid-cols-[360px_minmax(0,1fr)] sm:p-8">
            <aside className="order-2 min-w-0 rounded-[22px] border border-brand-200 bg-white p-5 lg:order-1">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                {asientosAReservar.length > 1 ? `${asientosAReservar.length} asientos seleccionados` : "Asiento seleccionado"}
              </p>
              {asientosAReservar.length === 0 ? (
                <p className="mt-3 text-sm text-ink-subtle">
                  Tocá un asiento en el plano para reservarlo o liberar la reserva, o arrastrá para elegir varios a la vez.
                </p>
              ) : modoReserva === "liberar" ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-brand-100 p-4 text-sm">
                    <p className="font-bold text-brand-900">
                      {asientosAReservar.length === 1 ? "Asiento reservado" : `${asientosAReservar.length} asientos reservados`}
                    </p>
                    <p className="mt-1 text-xs text-ink-subtle">Reservado por el dueño de la gradería.</p>
                  </div>
                  <button
                    onClick={liberarSeleccionados}
                    className="w-full rounded-full bg-brand-900 py-3 text-sm font-bold text-white"
                  >
                    {asientosAReservar.length > 1 ? `Liberar ${asientosAReservar.length} reservas` : "Liberar reserva"}
                  </button>
                </div>
              ) : modoReserva === "bloqueado" ? (
                <div className="mt-4 rounded-xl bg-brand-100 p-4 text-sm text-ink-subtle">
                  Este asiento ya usó su única reserva permitida. No se puede volver a reservar.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-relaxed text-ink-subtle">
                    Reservá {asientosAReservar.length > 1 ? "estos asientos" : "este asiento"} para uso propio del dueño (quedan fuera de la venta al público).
                  </p>
                  <button
                    onClick={reservarSeleccionados}
                    className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white"
                  >
                    {asientosAReservar.length > 1 ? `Reservar ${asientosAReservar.length} asientos` : "Reservar asiento"}
                  </button>
                  <p className="text-xs leading-relaxed text-ink-subtle">
                    Esto solo se puede hacer una vez por asiento: si después liberás la reserva, no vas a poder volver a reservarlo.
                  </p>
                </div>
              )}
            </aside>
            <section className="order-1 min-w-0 rounded-[22px] border border-brand-200 bg-white p-5 lg:order-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Plano de asientos</p>
                  <h3 className="mt-2 text-xl font-extrabold text-brand-900">Tocá o arrastrá para elegir asientos</h3>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-bold">
                  <span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded bg-[#3f3f46]" />Reservado</span>
                  <span className="inline-flex items-center gap-1"><i className="h-3 w-3 rounded border border-gray-300 bg-white" />Eliminado</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                <LeyendaZonas zonas={graderia.zonas} />
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={seleccionarTodoReservar}
                  disabled={asientosSeleccionablesReservar.length === 0 || asientosAReservar.length === asientosSeleccionablesReservar.length}
                  className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Seleccionar todo
                </button>
                <button
                  type="button"
                  onClick={deseleccionarTodoReservar}
                  disabled={asientosAReservar.length === 0}
                  className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Deseleccionar todo
                </button>
              </div>
              <PlanoAsientos
                zonas={graderia.zonas}
                deshabilitado={(asiento, clave) => esVendidoReal(asiento, clave) || Boolean(eliminados[asiento.numero]?.eliminado)}
                colorDe={(asiento, clave, zona) => {
                  if (esVendidoReal(asiento, clave)) return { color: "#16a34a", extra: "cursor-not-allowed text-white" };
                  if (eliminados[asiento.numero]?.eliminado) return { color: "#ffffff", extra: "cursor-not-allowed text-white", borde: "#ffffff" };
                  const seleccionado = asientosAReservar.includes(clave);
                  // Un asiento ya reservado se queda en gris siempre (esté o no
                  // seleccionado para liberarlo): solo gana el anillo de
                  // selección, no cambia al color pleno de zona como uno nuevo.
                  if (reservados[clave]?.reservado) {
                    return seleccionado
                      ? { color: "#3f3f46", extra: "text-white ring-2 ring-white/70 shadow-md", seleccionado: true }
                      : { color: "#3f3f46", extra: "text-white" };
                  }
                  return seleccionado
                    ? { color: zona.color, extra: "text-white ring-2 ring-white/70 shadow-md", seleccionado: true }
                    : { color: zona.color, extra: "text-white", muted: true };
                }}
                onIniciar={iniciarSeleccionReservar}
                onContinuar={continuarSeleccionReservar}
              />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
