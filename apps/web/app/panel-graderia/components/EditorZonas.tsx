"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Graderia } from "../../../../../packages/types/graderia";
import type { ZoneDraft } from "../../../../../packages/types/graderiaDueno";
import { nombreEvento, type EventoId } from "../../../../../packages/types/evento";
import { leerZonasEditadas, guardarZonasEditadas, zonaADraft } from "../../lib/panel-graderia/zonas-editadas";
import MarqueeBanner from "../../components/anime/MarqueeBanner";

// Paleta curada a propósito (no hex libre): elegida para que las 6 se
// distingan bien entre sí Y de los colores fijos que ya usa el plano de
// compra (gris #9ca3af = ocupado, violeta #a855f7 = revendido, dorado
// #e8a33d = anillo de seleccionado — ver asiento.tsx). La paleta vieja
// tenía un morado casi idéntico al violeta de "revendido" y un
// naranja+oliva que se confundían entre sí y con el dorado.
const PALETA_COLORES = [
  { hex: "#C71F1F", nombre: "Rojo" },
  { hex: "#1E64A8", nombre: "Azul" },
  { hex: "#167A5A", nombre: "Verde" },
  { hex: "#8B4513", nombre: "Marrón" },
  { hex: "#4338CA", nombre: "Índigo" },
  { hex: "#BE185D", nombre: "Rosa" },
] as const;
const letras = "ABCDEFGHI".split("");

function claveCelda(fila: number, asiento: number): string {
  return `${fila}:${asiento}`;
}

function contiene(zona: ZoneDraft, fila: number, asiento: number) {
  return zona.celdas.includes(claveCelda(fila, asiento));
}

function asientosEnZona(zona: ZoneDraft) {
  return zona.celdas.length;
}

function limitesDe(celdas: string[]): { filaMin: number; filaMax: number; asientoMin: number; asientoMax: number } | null {
  if (celdas.length === 0) return null;
  let filaMin = Infinity;
  let filaMax = -Infinity;
  let asientoMin = Infinity;
  let asientoMax = -Infinity;
  for (const clave of celdas) {
    const [fila, asiento] = clave.split(":").map(Number) as [number, number];
    filaMin = Math.min(filaMin, fila);
    filaMax = Math.max(filaMax, fila);
    asientoMin = Math.min(asientoMin, asiento);
    asientoMax = Math.max(asientoMax, asiento);
  }
  return { filaMin, filaMax, asientoMin, asientoMax };
}

// La zona ya no es necesariamente un rectángulo (puede ser cualquier
// conjunto de asientos), así que el rango de filas es solo orientativo.
function rangoTexto(zona: ZoneDraft) {
  const limites = limitesDe(zona.celdas);
  const cantidad = `${zona.celdas.length} asiento${zona.celdas.length === 1 ? "" : "s"}`;
  if (!limites) return cantidad;
  const { filaMin, filaMax } = limites;
  const filasTexto = filaMin === filaMax ? `Fila ${letras[filaMin]}` : `Filas ${letras[filaMin]}–${letras[filaMax]}`;
  return `${filasTexto} · ${cantidad}`;
}

type Props = {
  graderia: Graderia;
  eventoId: EventoId;
  onGuardado: () => void;
  onClose: () => void;
};

export default function EditorZonas({ graderia, eventoId, onGuardado, onClose }: Props) {
  const filas = 9;
  const asientosPorFila = Math.floor(graderia.metrosLineales * 2);
  const capacidad = filas * asientosPorFila;

  const [zonas, setZonas] = useState<ZoneDraft[]>(
    () => leerZonasEditadas(graderia.id, eventoId) ?? graderia.zonas.map(zonaADraft),
  );
  const [zonaNombre, setZonaNombre] = useState("");
  const [zonaColor, setZonaColor] = useState<string>(PALETA_COLORES[0].hex);
  const [zonaPrecio, setZonaPrecio] = useState("153");
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const [editandoZonaId, setEditandoZonaId] = useState<string | null>(null);
  // Cuando el color elegido ya lo usa otra zona: se pausa el guardado y se
  // le pregunta al dueño qué hacer, en vez de crear dos zonas indistinguibles
  // en el plano (ver confirmarZona/agregarAZonaExistente).
  const [conflictoColor, setConflictoColor] = useState<{ zonaId: string; nombre: string } | null>(null);

  // Igual que en GestorVentas: el modal se monta ya abierto, así que basta
  // con bloquear el scroll del body mientras esté montado (evita el doble
  // scroll fondo/modal en táctiles).
  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  // El error puede originarse en "Agregar zona" (columna izquierda) o en
  // "Guardar zonas" (abajo a la derecha): como el aviso vive en un solo
  // lugar fijo arriba del todo, lo llevamos a la vista cada vez que cambia
  // para que no pase desapercibido sin importar desde dónde se disparó.
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [error]);

  const conflictoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (conflictoColor) conflictoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [conflictoColor]);

  const totalZonificado = zonas.reduce((total, zona) => total + asientosEnZona(zona), 0);

  // Selección igual que en el panel de Ventas: cada celda tocada se agrega o
  // quita de un conjunto (toggle) — la zona nueva es exactamente ese
  // conjunto de asientos, no un rectángulo. El primer asiento tocado decide
  // si el gesto agrega o quita, y esa decisión se respeta arrastrando de
  // canto a canto o haciendo clicks sueltos en otras partes del plano.
  const [celdasSeleccionadas, setCeldasSeleccionadas] = useState<Set<string>>(() => new Set());
  const arrastrandoRango = useRef(false);
  const modoArrastreCeldas = useRef<"agregar" | "quitar">("agregar");

  function seleccionarTodo() {
    const todas = new Set<string>();
    for (let fila = 0; fila < filas; fila++) {
      for (let asiento = 1; asiento <= asientosPorFila; asiento++) {
        todas.add(claveCelda(fila, asiento));
      }
    }
    setCeldasSeleccionadas(todas);
  }

  function deseleccionarTodo() {
    setCeldasSeleccionadas(new Set());
  }

  function aplicarCelda(fila: number, asiento: number) {
    const clave = claveCelda(fila, asiento);
    const copia = new Set(celdasSeleccionadas);
    if (modoArrastreCeldas.current === "agregar") copia.add(clave);
    else copia.delete(clave);
    setCeldasSeleccionadas(copia);
  }

  function iniciarSeleccionRango(fila: number, asiento: number) {
    arrastrandoRango.current = true;
    modoArrastreCeldas.current = celdasSeleccionadas.has(claveCelda(fila, asiento)) ? "quitar" : "agregar";
    aplicarCelda(fila, asiento);
  }

  function continuarSeleccionRango(fila: number, asiento: number) {
    if (!arrastrandoRango.current) return;
    aplicarCelda(fila, asiento);
  }

  useEffect(() => {
    function terminar() {
      arrastrandoRango.current = false;
    }
    window.addEventListener("mouseup", terminar);
    window.addEventListener("touchend", terminar);
    window.addEventListener("touchcancel", terminar);
    return () => {
      window.removeEventListener("mouseup", terminar);
      window.removeEventListener("touchend", terminar);
      window.removeEventListener("touchcancel", terminar);
    };
  }, []);

  function tocarMoverRango(event: React.TouchEvent) {
    if (!arrastrandoRango.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    const objetivo = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-fila]");
    const filaAttr = objetivo?.getAttribute("data-fila");
    const asientoAttr = objetivo?.getAttribute("data-asiento");
    if (filaAttr == null || asientoAttr == null) return;
    event.preventDefault();
    continuarSeleccionRango(Number(filaAttr), Number(asientoAttr));
  }

  // Con el arrastre de un dedo ocupado en definir el rango, el scroll
  // horizontal nativo del plano deja de andar en mobile: se navega con las
  // flechas de abajo (no rueda del mouse, para no pelear con el scroll
  // vertical de la página).
  const scrollRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const arrastrandoRadar = useRef(false);
  const [puedeDeslizar, setPuedeDeslizar] = useState(false);
  const [scrollInfo, setScrollInfo] = useState({ left: 0, clientWidth: 0, scrollWidth: 0 });

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
  }, [asientosPorFila]);

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

  // Vista general en miniatura, mismo concepto que en AsientosGrid.tsx (la
  // compra del cliente) y en GestorVentas.tsx: toda la gradería de un
  // vistazo, sin scroll. Acá "seleccionado" pinta con `zonaColor` (el color
  // elegido en el formulario para la zona nueva/editada) — a diferencia de
  // los otros dos casos, esta selección ES la zona que se está armando, así
  // que tiene sentido ver de una vez el color real que va a quedar, en vez
  // de un color de selección genérico.
  const necesitaRadar = scrollInfo.scrollWidth > scrollInfo.clientWidth + 8;
  const ratioInicio = scrollInfo.scrollWidth > 0 ? scrollInfo.left / scrollInfo.scrollWidth : 0;
  const ratioAncho =
    scrollInfo.scrollWidth > 0 ? Math.min(1, scrollInfo.clientWidth / scrollInfo.scrollWidth) : 1;

  const vistaGeneral = useMemo(
    () => (
      <div
        className="grid h-full w-full gap-px"
        style={{
          gridTemplateColumns: `repeat(${asientosPorFila}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${filas}, 1fr)`,
        }}
      >
        {Array.from({ length: filas }, (_, i) => filas - 1 - i).flatMap((fila) =>
          Array.from({ length: asientosPorFila }, (_, asiento) => {
            const zona = zonas.find((item) => contiene(item, fila, asiento + 1));
            const enSeleccionActual = celdasSeleccionadas.has(claveCelda(fila, asiento + 1));
            return (
              <div
                key={claveCelda(fila, asiento + 1)}
                style={{ backgroundColor: enSeleccionActual ? zonaColor : (zona?.color ?? "#d8cfcb") }}
              />
            );
          }),
        )}
      </div>
    ),
    [filas, asientosPorFila, zonas, celdasSeleccionadas, zonaColor],
  );

  function comenzarEdicion(zona: ZoneDraft) {
    setEditandoZonaId(zona.id);
    setZonaNombre(zona.nombre);
    setZonaColor(zona.color);
    setZonaPrecio(String(zona.precio));
    setCeldasSeleccionadas(new Set(zona.celdas));
    setError("");
    setConflictoColor(null);
  }

  function cancelarEdicion() {
    setEditandoZonaId(null);
    setZonaNombre("");
    setZonaColor((PALETA_COLORES[zonas.length % PALETA_COLORES.length] ?? PALETA_COLORES[0]).hex);
    setZonaPrecio("153");
    setCeldasSeleccionadas(new Set());
    setError("");
    setConflictoColor(null);
  }

  // "Añadir a esa zona": las celdas elegidas (que ya representan el set
  // completo deseado, tanto al crear como al editar — ver comenzarEdicion)
  // pasan a la zona existente de ese color, con su nombre/precio propios;
  // el nombre/precio tipeados en el formulario se descartan. Si se estaba
  // editando una zona distinta, esta queda sin celdas y se descarta sola
  // (mismo criterio que el resto de reasignaciones de celdas del editor).
  function agregarAZonaExistente(zonaId: string) {
    setZonas((actuales) =>
      actuales
        .map((zona) =>
          zona.id === zonaId
            ? { ...zona, celdas: Array.from(new Set([...zona.celdas, ...celdasSeleccionadas])) }
            : { ...zona, celdas: zona.celdas.filter((clave) => !celdasSeleccionadas.has(clave)) },
        )
        .filter((zona) => zona.id === zonaId || zona.celdas.length > 0),
    );
    cancelarEdicion();
  }

  function confirmarZona() {
    setError("");
    const precio = Number(zonaPrecio);
    if (!zonaNombre.trim()) return setError("Escribe un nombre para la zona.");
    if (!Number.isFinite(precio) || precio <= 0)
      return setError("Define un precio válido para la zona.");
    if (celdasSeleccionadas.size === 0) return setError("Selecciona al menos un asiento en el plano.");

    // Dos zonas con el mismo nombre son indistinguibles en cualquier lista
    // (leyenda, resumen de compra, reportes) aunque tengan colores
    // distintos — a diferencia del color, acá no hay una fusión razonable
    // que ofrecer, así que se bloquea directo.
    const nombreNormalizado = zonaNombre.trim().toLowerCase();
    const zonaConMismoNombre = zonas.find(
      (z) => z.nombre.trim().toLowerCase() === nombreNormalizado && z.id !== editandoZonaId,
    );
    if (zonaConMismoNombre) return setError(`Ya existe una zona llamada "${zonaConMismoNombre.nombre}". Elegí otro nombre.`);

    // La paleta es fija (6 colores, ver PALETA_COLORES) para que cada zona
    // se distinga bien de las demás en el plano — si dos zonas comparten
    // color, esa garantía desaparece. En vez de bloquear sin más, se le
    // ofrece al dueño la salida más común: sumar estos asientos a la zona
    // que ya tiene ese color, en vez de crear una segunda indistinguible.
    const zonaConMismoColor = zonas.find((z) => z.color === zonaColor && z.id !== editandoZonaId);
    if (zonaConMismoColor) {
      setConflictoColor({ zonaId: zonaConMismoColor.id, nombre: zonaConMismoColor.nombre });
      return;
    }

    if (editandoZonaId) {
      // Igual que al crear: las celdas elegidas pasan a esta zona aunque ya
      // pertenecieran a otra. La propia zona editada se conserva siempre
      // (ya validamos que tiene al menos un asiento); las demás se
      // descartan si se quedan sin ninguno.
      setZonas((actuales) =>
        actuales
          .map((zona) =>
            zona.id === editandoZonaId
              ? { ...zona, nombre: zonaNombre.trim(), color: zonaColor, precio, celdas: Array.from(celdasSeleccionadas) }
              : { ...zona, celdas: zona.celdas.filter((clave) => !celdasSeleccionadas.has(clave)) },
          )
          .filter((zona) => zona.id === editandoZonaId || zona.celdas.length > 0),
      );
      cancelarEdicion();
      return;
    }

    const nuevaZona: ZoneDraft = {
      id: `zona-${Date.now()}`,
      nombre: zonaNombre.trim(),
      color: zonaColor,
      precio,
      celdas: Array.from(celdasSeleccionadas),
    };
    // Los asientos elegidos pasan a la zona nueva aunque ya pertenecieran a
    // otra: no hace falta partir rectángulos, solo sacarlos de la lista de
    // celdas de la zona vieja (y descartarla si se queda sin ninguna).
    setZonas((actuales) =>
      actuales
        .map((zona) => ({ ...zona, celdas: zona.celdas.filter((clave) => !celdasSeleccionadas.has(clave)) }))
        .filter((zona) => zona.celdas.length > 0)
        .concat(nuevaZona),
    );
    setZonaNombre("");
    setZonaColor((PALETA_COLORES[(zonas.length + 1) % PALETA_COLORES.length] ?? PALETA_COLORES[0]).hex);
    setError("");
    // La próxima zona arranca su selección de cero en el plano, en vez de
    // seguir sumándose a las celdas que se acaban de guardar.
    setCeldasSeleccionadas(new Set());
  }

  function eliminarZona(id: string) {
    setZonas((actuales) => actuales.filter((zona) => zona.id !== id));
    if (editandoZonaId === id) cancelarEdicion();
  }

  function guardar() {
    if (zonas.length === 0) return setError("Crea al menos una zona antes de guardar.");
    if (totalZonificado !== capacidad)
      return setError(
        `Falta cubrir ${capacidad - totalZonificado} asiento(s). Las zonas tienen que cubrir toda la gradería.`,
      );
    guardarZonasEditadas(graderia.id, eventoId, zonas);
    onGuardado();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="mx-auto min-h-full max-w-6xl rounded-[28px] bg-brand-50 shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-brand-950 px-6 py-6 text-white sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-500">
              Editar zonas · {nombreEvento(eventoId)}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold wrap-break-word">{graderia.nombre}</h2>
            <p className="mt-1 text-sm text-white/70">
              Redefiní las zonas de tu gradería para este evento. Tienen que cubrir todos los asientos.
            </p>
          </div>
          <button onClick={onClose} className="shrink-0 text-3xl leading-none text-white/80" aria-label="Cerrar">
            ×
          </button>
        </div>

        {error && (
          <div
            ref={errorRef}
            role="alert"
            className="mx-6 mt-6 flex items-start gap-3 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm sm:mx-8"
          >
            <span className="text-lg leading-none">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {conflictoColor && (
          <div
            ref={conflictoRef}
            role="alertdialog"
            aria-labelledby="conflicto-color-titulo"
            className="mx-6 mt-6 rounded-xl border-2 border-gold-500/60 bg-gold-500/10 p-4 shadow-sm sm:mx-8"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg leading-none">🎨</span>
              <div className="min-w-0">
                <p id="conflicto-color-titulo" className="text-sm font-bold text-brand-900">
                  Ya existe una zona de este color: &quot;{conflictoColor.nombre}&quot;
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Dos zonas con el mismo color se ven idénticas en el plano. Elegí otro color para &quot;{zonaNombre}
                  &quot;, sumá estos asientos a &quot;{conflictoColor.nombre}&quot;, o cancelá.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setConflictoColor(null)}
                className="rounded-full bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-brand-950"
              >
                Elegir otro color
              </button>
              <button
                type="button"
                onClick={() => agregarAZonaExistente(conflictoColor.zonaId)}
                className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100"
              >
                Sumar a &quot;{conflictoColor.nombre}&quot;
              </button>
              <button
                type="button"
                onClick={cancelarEdicion}
                className="rounded-full px-4 py-2 text-xs font-bold text-ink-subtle hover:text-ink"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid min-w-0 gap-6 p-6 xl:grid-cols-[420px_minmax(0,1fr)] sm:p-8">
          <div className="min-w-0 rounded-[22px] border border-brand-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {editandoZonaId ? "Editar zona" : "Nueva zona"}
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-brand-900">
              {editandoZonaId ? "Añadí o quitá asientos" : "Elegir asientos"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {editandoZonaId
                ? "Tocá un asiento de esta zona para quitarlo, o uno libre/de otra zona para agregarlo. Los cambios se guardan al confirmar."
                : "Tocá o arrastrá los asientos del plano para elegir cuáles pertenecerán a la zona. Si algunos ya estaban en otra zona, se los quita de ahí y pasan a esta."}
            </p>
            <div className="mt-6 space-y-4">
              <Campo etiqueta="Nombre de zona">
                <input
                  value={zonaNombre}
                  onChange={(e) => setZonaNombre(e.target.value)}
                  placeholder="Ej. Zona Preferencial"
                  className="campo"
                />
              </Campo>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo etiqueta="Precio por asiento">
                  <input
                    type="number"
                    min="1"
                    value={zonaPrecio}
                    onChange={(e) => setZonaPrecio(e.target.value)}
                    className="campo"
                  />
                </Campo>
                <Campo etiqueta="Color en plano">
                  {/* Nombre visible en cada swatch, no solo el color: así se
                      puede confirmar la elección leyendo ("Rojo") en vez de
                      depender de distinguir el matiz exacto a ojo. */}
                  <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-brand-300 px-2 py-1.5">
                    {PALETA_COLORES.map(({ hex, nombre }) => (
                      <button
                        type="button"
                        key={hex}
                        onClick={() => setZonaColor(hex)}
                        aria-label={`Color ${nombre}`}
                        title={nombre}
                        className={`flex items-center gap-1.5 rounded-full border-2 py-1 pl-1 pr-2.5 text-xs font-semibold transition-colors ${
                          zonaColor === hex ? "border-ink bg-brand-100 text-ink" : "border-transparent text-ink-subtle hover:bg-brand-100"
                        }`}
                      >
                        <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: hex }} />
                        {nombre}
                      </button>
                    ))}
                  </div>
                </Campo>
              </div>
              {editandoZonaId ? (
                <div className="flex gap-3">
                  <button
                    onClick={confirmarZona}
                    className="flex-1 rounded-full bg-brand-900 py-3 text-sm font-bold text-white hover:bg-brand-950"
                  >
                    Guardar cambios
                  </button>
                  <button
                    onClick={cancelarEdicion}
                    className="rounded-full border border-brand-300 px-5 py-3 text-sm font-bold text-ink-muted"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={confirmarZona}
                  className="w-full rounded-full bg-brand-900 py-3 text-sm font-bold text-white hover:bg-brand-950"
                >
                  + Agregar zona al plano
                </button>
              )}
            </div>
            <div className="mt-6 border-t border-brand-200 pt-5">
              <p className="text-sm font-bold text-brand-900">Zonas creadas ({zonas.length})</p>
              {zonas.length === 0 ? (
                <p className="mt-2 text-sm text-ink-subtle">Aún no creaste ninguna zona.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {zonas.map((zona) => (
                    <div
                      key={zona.id}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                        zona.id === editandoZonaId ? "bg-[#fdece9] ring-2 ring-brand-600/40" : "bg-brand-100"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-bold text-brand-900">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: zona.color }} />
                          {zona.nombre}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-ink-subtle">
                          {rangoTexto(zona)} · Bs {zona.precio}
                        </p>
                      </div>
                      <div className="ml-3 flex shrink-0 gap-3">
                        <button
                          onClick={() => comenzarEdicion(zona)}
                          className="text-xs font-bold text-brand-900 hover:underline"
                        >
                          {zona.id === editandoZonaId ? "Editando…" : "Editar"}
                        </button>
                        <button
                          onClick={() => eliminarZona(zona.id)}
                          className="text-xs font-bold text-brand-600 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 rounded-[24px] border border-brand-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Previsualización</p>
                <h2 className="mt-1 text-2xl font-extrabold text-brand-900">Plano de asientos</h2>
                <p className="mt-1 text-sm text-ink-muted">Cada color representa una zona.</p>
              </div>
              <div className="rounded-xl bg-brand-100 px-4 py-2 text-right">
                <p className="text-xs text-ink-subtle">Zonificados</p>
                <p className="font-extrabold text-brand-900">
                  {totalZonificado} / {capacidad}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-faint">
              Tocá o arrastrá sobre el plano para elegir los asientos de la nueva zona.
            </p>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={seleccionarTodo}
                disabled={celdasSeleccionadas.size === capacidad}
                className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Seleccionar todo
              </button>
              <button
                type="button"
                onClick={deseleccionarTodo}
                disabled={celdasSeleccionadas.size === 0}
                className="rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-900 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Deseleccionar todo
              </button>
            </div>

            {necesitaRadar && (
              <div className="sticky top-0 z-20 mt-3 rounded-xl border border-brand-200 bg-white/95 p-3 backdrop-blur-sm">
                <p className="mb-2 text-xs font-semibold text-ink-faint">
                  Vista general de la gradería — tocá o arrastrá para moverte
                </p>
                <div
                  ref={radarRef}
                  onPointerDown={iniciarArrastreRadar}
                  className="relative h-20 w-full cursor-pointer overflow-hidden rounded-lg bg-brand-100 p-1 ring-1 ring-brand-200 sm:h-24"
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

            <div ref={scrollRef} className="scrollbar-plano mt-2 overflow-x-auto pb-2">
              <div className="min-w-max rounded-2xl bg-brand-100 p-4">
                <div className="mb-3">
                  <MarqueeBanner texto="Ingreso Graderia" variante="entrada" />
                </div>
                {/* La fila "A" va pegada al recorrido/escenario (abajo), así
                    que se recorre de atrás para adelante: las letras más
                    altas quedan arriba, cerca del ingreso. */}
                <div className="space-y-1.5" onTouchMove={tocarMoverRango}>
                  {Array.from({ length: filas }, (_, i) => filas - 1 - i).map((fila) => (
                    <div key={fila} className="flex items-center gap-1.5">
                      <span className="w-5 text-center text-xs font-bold text-ink-subtle">{letras[fila]}</span>
                      {Array.from({ length: asientosPorFila }, (_, asiento) => {
                        const zona = zonas.find((item) => contiene(item, fila, asiento + 1));
                        const enSeleccionActual = celdasSeleccionadas.has(claveCelda(fila, asiento + 1));
                        return (
                          <button
                            key={asiento}
                            type="button"
                            data-fila={fila}
                            data-asiento={asiento + 1}
                            onMouseDown={() => iniciarSeleccionRango(fila, asiento + 1)}
                            onMouseEnter={() => continuarSeleccionRango(fila, asiento + 1)}
                            onTouchStart={(event) => {
                              if (event.touches.length > 1) return;
                              event.preventDefault();
                              iniciarSeleccionRango(fila, asiento + 1);
                            }}
                            title={
                              zona
                                ? `${zona.nombre} · Fila ${letras[fila]}, asiento ${asiento + 1}`
                                : `Sin zona · Fila ${letras[fila]}, asiento ${asiento + 1}`
                            }
                            style={{ backgroundColor: enSeleccionActual ? zonaColor : (zona?.color ?? "#d8cfcb"), touchAction: "none" }}
                            className={`flex h-6 w-6 shrink-0 select-none items-center justify-center rounded text-[9px] font-bold text-white shadow-sm transition ${
                              enSeleccionActual ? "ring-2 ring-brand-600/30" : ""
                            } ${editandoZonaId && !enSeleccionActual ? "opacity-40" : ""}`}
                          >
                            {asiento + 1}
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
            <div className="mt-5 flex flex-wrap gap-3">
              {zonas.map((zona) => (
                <span key={zona.id} className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: zona.color }} />
                  {zona.nombre} ({asientosEnZona(zona)})
                </span>
              ))}
              {totalZonificado < capacidad && (
                <span className="text-xs font-semibold text-ink-faint">
                  Gris: {capacidad - totalZonificado} asientos sin zona (hay que cubrirlos para poder guardar)
                </span>
              )}
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-brand-200 pt-5 sm:flex-row sm:justify-between">
              <button
                onClick={onClose}
                className="rounded-full border border-brand-300 px-5 py-3 text-sm font-bold text-ink-muted"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={zonas.length === 0}
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Guardar zonas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-ink">
      <span className="mb-2 block">{etiqueta}</span>
      {children}
    </label>
  );
}

