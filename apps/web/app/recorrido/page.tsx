"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  conjuntos,
  DURACION_RECORRIDO_MS,
  INTERVALO_ENTRADA_MS,
  posicionEnProgreso,
  posicionEnProgresoRuta,
  distanciaTotalDeRuta,
  distanciaMetros,
  type Waypoint,
} from "./distancia/routeData";
import type { ConjuntoEnPista } from "./RouteMapComponent";
import StreetViewLive from "./StreetViewPanel";
import {
  gruposEnsayo,
  duracionTotalEnsayo,
  rutasEnsayo,
  rutaDe,
  type GrupoEnsayo,
} from "./distancia/rutasEnsayo";
import type { GrupoEnPista } from "./RutasPreviasMapComponent";

const RouteMapWithNoSSR = dynamic(() => import("./RouteMapComponent"), {
  ssr: false,
});

const RutasPreviasMapWithNoSSR = dynamic(() => import("./RutasPreviasMapComponent"), {
  ssr: false,
});

const DURACION_TOTAL_MS =
  (conjuntos.length - 1) * INTERVALO_ENTRADA_MS + DURACION_RECORRIDO_MS;

function progresoDe(index: number, elapsedMs: number): number | null {
  const offset = index * INTERVALO_ENTRADA_MS;
  if (elapsedMs < offset) return null;
  return Math.min(1, (elapsedMs - offset) / DURACION_RECORRIDO_MS);
}

function progresoDeGrupo(g: GrupoEnsayo, elapsedMs: number): number | null {
  if (elapsedMs < g.offsetMs) return null;
  return Math.min(1, (elapsedMs - g.offsetMs) / g.duracionMs);
}

const INTERVALO_RENDER_MS = 120;

export default function RecorridoPage() {
  // ================= Sección 1: recorrido de la Entrada =================
  const [elapsedMs, setElapsedMs] = useState(0);
  const [enMarcha, setEnMarcha] = useState(false);
  const [velocidad, setVelocidad] = useState(1);
  const [vista, setVista] = useState<"mapa" | "calle">("mapa");
  const [puntoManual, setPuntoManual] = useState<Waypoint | null>(null);
  const [conjuntoSeguidoId, setConjuntoSeguidoId] = useState<string | null>(null);
  const frameRef = useRef<number | null>(null);
  const ultimoTickRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const ultimoRenderRef = useRef(0);

  useEffect(() => {
    if (!enMarcha) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      ultimoTickRef.current = null;
      return;
    }

    const tick = (t: number) => {
      if (ultimoTickRef.current === null) ultimoTickRef.current = t;
      const delta = (t - ultimoTickRef.current) * velocidad;
      ultimoTickRef.current = t;

      elapsedRef.current = Math.min(DURACION_TOTAL_MS, elapsedRef.current + delta);
      const terminado = elapsedRef.current >= DURACION_TOTAL_MS;

      if (t - ultimoRenderRef.current >= INTERVALO_RENDER_MS || terminado) {
        ultimoRenderRef.current = t;
        setElapsedMs(elapsedRef.current);
        if (terminado) setEnMarcha(false);
      }

      if (!terminado) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [enMarcha, velocidad]);

  const conjuntosEnPista: ConjuntoEnPista[] = conjuntos.map((c, i) => ({
    ...c,
    progreso: progresoDe(i, elapsedMs),
  }));

  const conjuntoLider = [...conjuntosEnPista]
    .filter((c) => c.progreso !== null && c.progreso < 1)
    .sort((a, b) => (b.progreso as number) - (a.progreso as number))[0];

  const conjuntoSeguido = conjuntoSeguidoId
    ? conjuntosEnPista.find((c) => c.id === conjuntoSeguidoId)
    : undefined;

  const posicionVista = puntoManual
    ? { ...puntoManual, heading: 0 }
    : conjuntoSeguido && conjuntoSeguido.progreso !== null
    ? posicionEnProgreso(conjuntoSeguido.progreso)
    : conjuntoLider
    ? posicionEnProgreso(conjuntoLider.progreso as number)
    : posicionEnProgreso(0);

  const etiquetaVista = puntoManual
    ? puntoManual.tramo
    : conjuntoSeguido && conjuntoSeguido.progreso !== null
    ? `${conjuntoSeguido.nombre} · ${posicionVista.tramo}`
    : conjuntoLider
    ? `${conjuntoLider.nombre} · ${posicionVista.tramo}`
    : "Punto de partida";

  const siguiendoAlgo = puntoManual !== null || conjuntoSeguido !== undefined;

  const seguirConjunto = (id: string) => {
    setConjuntoSeguidoId(id);
    setPuntoManual(null);
    setVista("calle");
  };

  const dejarDeSeguir = () => {
    setConjuntoSeguidoId(null);
    setPuntoManual(null);
  };

  const conjuntosCercanos = conjuntosEnPista
    .filter((c) => c.progreso !== null)
    .map((c) => {
      const pos = posicionEnProgreso(c.progreso as number);
      return {
        ...c,
        distanciaM: Math.round(distanciaMetros(pos, posicionVista)),
      };
    })
    .sort((a, b) => a.distanciaM - b.distanciaM);

  const reiniciar = () => {
    setEnMarcha(false);
    setElapsedMs(0);
    elapsedRef.current = 0;
    ultimoTickRef.current = null;
  };

  const progresoGlobal = elapsedMs / DURACION_TOTAL_MS;

  // ============= Sección 2: recorridos previos (rutas independientes) =============
  const [elapsedMs2, setElapsedMs2] = useState(0);
  const [enMarcha2, setEnMarcha2] = useState(false);
  const [velocidad2, setVelocidad2] = useState(1);
  const [vista2, setVista2] = useState<"mapa" | "calle">("mapa");
  const [puntoManual2, setPuntoManual2] = useState<Waypoint | null>(null);
  const [grupoSeguidoId2, setGrupoSeguidoId2] = useState<string | null>(null);
  const frameRef2 = useRef<number | null>(null);
  const ultimoTickRef2 = useRef<number | null>(null);
  const elapsedRef2 = useRef(0);
  const ultimoRenderRef2 = useRef(0);

  useEffect(() => {
    if (!enMarcha2) {
      if (frameRef2.current) cancelAnimationFrame(frameRef2.current);
      ultimoTickRef2.current = null;
      return;
    }

    const tick = (t: number) => {
      if (ultimoTickRef2.current === null) ultimoTickRef2.current = t;
      const delta = (t - ultimoTickRef2.current) * velocidad2;
      ultimoTickRef2.current = t;

      elapsedRef2.current = Math.min(duracionTotalEnsayo, elapsedRef2.current + delta);
      const terminado = elapsedRef2.current >= duracionTotalEnsayo;

      if (t - ultimoRenderRef2.current >= INTERVALO_RENDER_MS || terminado) {
        ultimoRenderRef2.current = t;
        setElapsedMs2(elapsedRef2.current);
        if (terminado) setEnMarcha2(false);
      }

      if (!terminado) frameRef2.current = requestAnimationFrame(tick);
    };

    frameRef2.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef2.current) cancelAnimationFrame(frameRef2.current);
    };
  }, [enMarcha2, velocidad2]);

  const gruposEnPista: GrupoEnPista[] = gruposEnsayo.map((g) => ({
    ...g,
    progreso: progresoDeGrupo(g, elapsedMs2),
  }));

  const grupoLider2 = [...gruposEnPista]
    .filter((g) => g.progreso !== null && g.progreso < 1)
    .sort((a, b) => (b.progreso as number) - (a.progreso as number))[0];

  const grupoSeguido2 = grupoSeguidoId2
    ? gruposEnPista.find((g) => g.id === grupoSeguidoId2)
    : undefined;

  const puntoInicial2 = rutasEnsayo[0]!.puntos[0]!;

  const posicionVista2 = puntoManual2
    ? { ...puntoManual2, heading: 0 }
    : grupoSeguido2 && grupoSeguido2.progreso !== null
    ? posicionEnProgresoRuta(
        rutaDe(grupoSeguido2.rutaId),
        grupoSeguido2.progreso,
        distanciaTotalDeRuta(rutaDe(grupoSeguido2.rutaId))
      )
    : grupoLider2
    ? posicionEnProgresoRuta(
        rutaDe(grupoLider2.rutaId),
        grupoLider2.progreso as number,
        distanciaTotalDeRuta(rutaDe(grupoLider2.rutaId))
      )
    : { lat: puntoInicial2.lat, lng: puntoInicial2.lng, tramo: puntoInicial2.tramo, heading: 0 };

  const etiquetaVista2 = puntoManual2
    ? puntoManual2.tramo
    : grupoSeguido2 && grupoSeguido2.progreso !== null
    ? `${grupoSeguido2.nombre} · ${posicionVista2.tramo}`
    : grupoLider2
    ? `${grupoLider2.nombre} · ${posicionVista2.tramo}`
    : "Punto de partida";

  const siguiendoAlgo2 = puntoManual2 !== null || grupoSeguido2 !== undefined;

  const seguirGrupo = (id: string) => {
    setGrupoSeguidoId2(id);
    setPuntoManual2(null);
    setVista2("calle");
  };

  const dejarDeSeguir2 = () => {
    setGrupoSeguidoId2(null);
    setPuntoManual2(null);
  };

  const gruposCercanos2 = gruposEnPista
    .filter((g) => g.progreso !== null)
    .map((g) => {
      const ruta = rutaDe(g.rutaId);
      const pos = posicionEnProgresoRuta(ruta, g.progreso as number, distanciaTotalDeRuta(ruta));
      return { ...g, distanciaM: Math.round(distanciaMetros(pos, posicionVista2)) };
    })
    .sort((a, b) => a.distanciaM - b.distanciaM);

  const reiniciar2 = () => {
    setEnMarcha2(false);
    setElapsedMs2(0);
    elapsedRef2.current = 0;
    ultimoTickRef2.current = null;
  };

  const progresoGlobal2 = elapsedMs2 / duracionTotalEnsayo;

  return (
    <main className="mx-auto max-w-[1440px] pb-10">
      {/* Header sección 1 */}
      <div className="bg-night-soft text-center px-5 py-8 sm:py-10">
        <h1 className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
          Recorrido en Tiempo Real
        </h1>
        <p className="text-sm text-white/60 mt-2 max-w-md mx-auto">
          Sigue el avance de cada conjunto por el circuito de la Entrada
        </p>
      </div>

      <div className="grid gap-6 px-5 sm:px-12 py-6 bg-night-soft lg:grid-cols-[500px_1fr] lg:items-start">
        <section className="w-full max-w-[500px] mx-auto lg:mx-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setVista("mapa")}
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: vista === "mapa" ? "#e8a33d" : "rgba(255,255,255,0.06)",
                color: vista === "mapa" ? "#0c0908" : "#ffffff",
              }}
            >
              Mapa
            </button>
            <button
              onClick={() => setVista("calle")}
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: vista === "calle" ? "#e8a33d" : "rgba(255,255,255,0.06)",
                color: vista === "calle" ? "#0c0908" : "#ffffff",
              }}
            >
              Vista de calle
            </button>
            {siguiendoAlgo && vista === "calle" && (
              <button
                onClick={dejarDeSeguir}
                className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold border border-gold-500/33 text-white"
              >
                Volver al automático
              </button>
            )}
          </div>

          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            {vista === "mapa" ? (
              <RouteMapWithNoSSR
                conjuntosEnPista={conjuntosEnPista}
                onSelectPunto={(w) => {
                  setPuntoManual(w);
                  setConjuntoSeguidoId(null);
                  setVista("calle");
                }}
                onSelectConjunto={seguirConjunto}
              />
            ) : (
              <StreetViewLive
                lat={posicionVista.lat}
                lng={posicionVista.lng}
                label={etiquetaVista}
              />
            )}
          </div>

          {vista === "calle" && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-white/60 mb-1">Conjuntos en este tramo</p>
              {conjuntosCercanos.length === 0 && (
                <p className="text-xs text-white/60">Todavía ningún conjunto entró al recorrido.</p>
              )}
              {conjuntosCercanos.map((c) => {
                const esElQueSeVe =
                  !puntoManual && (conjuntoSeguido?.id === c.id || (!conjuntoSeguido && conjuntoLider?.id === c.id));
                return (
                  <button
                    key={c.id}
                    onClick={() => seguirConjunto(c.id)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-left"
                    style={{
                      backgroundColor: esElQueSeVe ? `${c.color}33` : `${c.color}12`,
                      border: esElQueSeVe ? `1px solid ${c.color}` : "1px solid transparent",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-xs font-medium text-white">{c.nombre}</span>
                    </span>
                    <span className="text-[10px]" style={{ color: c.color }}>
                      {c.distanciaM < 15 ? "Aquí mismo" : `a ${c.distanciaM} m`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="space-y-2 min-w-0">
          {conjuntosEnPista.map((c, i) => {
            const offsetMs = i * INTERVALO_ENTRADA_MS;
            const faltan = Math.max(0, offsetMs - elapsedMs);
            const puedeSeguirse = c.progreso !== null;
            return (
              <button
                key={c.id}
                onClick={() => puedeSeguirse && seguirConjunto(c.id)}
                disabled={!puedeSeguirse}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left disabled:cursor-default"
                style={{
                  backgroundColor:
                    !puntoManual && conjuntoSeguido?.id === c.id ? `${c.color}33` : `${c.color}1a`,
                  border:
                    !puntoManual && conjuntoSeguido?.id === c.id
                      ? `1px solid ${c.color}`
                      : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm font-medium text-white">{c.nombre}</span>
                </div>
                <span className="text-xs" style={{ color: c.color }}>
                  {c.progreso === null
                    ? `Entra en ${Math.ceil(faltan / 1000)}s`
                    : c.progreso >= 1
                    ? "Completado"
                    : `En recorrido · ${Math.round(c.progreso * 100)}%`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 sm:px-12 pb-6 bg-night-soft">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Progreso general</span>
          <span className="text-sm text-white/60">{Math.round(progresoGlobal * 100)}%</span>
        </div>

        <input
          type="range"
          min={0}
          max={DURACION_TOTAL_MS}
          step={1}
          value={elapsedMs}
          onChange={(e) => {
            setEnMarcha(false);
            const nuevo = Number(e.target.value);
            setElapsedMs(nuevo);
            elapsedRef.current = nuevo;
          }}
          className="w-full accent-gold-500 mb-5"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setEnMarcha((v) => !v)}
            disabled={elapsedMs >= DURACION_TOTAL_MS && !enMarcha}
            className="rounded-full px-6 py-2.5 text-sm font-bold bg-gold-500 text-night disabled:opacity-50"
          >
            {enMarcha ? "Pausar" : elapsedMs >= DURACION_TOTAL_MS ? "Finalizado" : "Iniciar"}
          </button>

          <button
            onClick={reiniciar}
            className="rounded-full px-5 py-2.5 text-sm font-semibold border border-gold-500/33 text-white"
          >
            Reiniciar
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-white/60">Velocidad</span>
            {[1, 2, 4].map((v) => (
              <button
                key={v}
                onClick={() => setVelocidad(v)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: velocidad === v ? "#e8a33d" : "rgba(255,255,255,0.06)",
                  color: velocidad === v ? "#0c0908" : "#ffffff",
                }}
              >
                {v}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header sección 2 */}
      <div className="bg-night-soft text-center px-5 py-8 sm:py-10">
        <h2 className="font-display text-4xl uppercase tracking-wide text-white sm:text-5xl">
          Recorridos Previos al Carnaval
        </h2>
        <p className="text-sm text-white/60 mt-2 max-w-md mx-auto">
          Ensayos y traslados de cada conjunto, cada uno por su propia ruta
        </p>
      </div>

      <div className="grid gap-6 px-5 sm:px-12 py-6 bg-night-soft lg:grid-cols-[500px_1fr] lg:items-start">
        <section className="w-full max-w-[500px] mx-auto lg:mx-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setVista2("mapa")}
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: vista2 === "mapa" ? "#e8a33d" : "rgba(255,255,255,0.06)",
                color: vista2 === "mapa" ? "#0c0908" : "#ffffff",
              }}
            >
              Mapa
            </button>
            <button
              onClick={() => setVista2("calle")}
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: vista2 === "calle" ? "#e8a33d" : "rgba(255,255,255,0.06)",
                color: vista2 === "calle" ? "#0c0908" : "#ffffff",
              }}
            >
              Vista de calle
            </button>
            {siguiendoAlgo2 && vista2 === "calle" && (
              <button
                onClick={dejarDeSeguir2}
                className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold border border-gold-500/33 text-white"
              >
                Volver al automático
              </button>
            )}
          </div>

          <div className="relative w-full aspect-square rounded-lg overflow-hidden">
            {vista2 === "mapa" ? (
              <RutasPreviasMapWithNoSSR
                gruposEnPista={gruposEnPista}
                onSelectPunto={(w) => {
                  setPuntoManual2(w);
                  setGrupoSeguidoId2(null);
                  setVista2("calle");
                }}
                onSelectGrupo={seguirGrupo}
              />
            ) : (
              <StreetViewLive
                lat={posicionVista2.lat}
                lng={posicionVista2.lng}
                label={etiquetaVista2}
              />
            )}
          </div>

          {vista2 === "calle" && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-white/60 mb-1">Conjuntos cerca de este punto</p>
              {gruposCercanos2.length === 0 && (
                <p className="text-xs text-white/60">Todavía ningún conjunto salió a su ruta.</p>
              )}
              {gruposCercanos2.map((g) => {
                const esElQueSeVe =
                  !puntoManual2 && (grupoSeguido2?.id === g.id || (!grupoSeguido2 && grupoLider2?.id === g.id));
                return (
                  <button
                    key={g.id}
                    onClick={() => seguirGrupo(g.id)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-left"
                    style={{
                      backgroundColor: esElQueSeVe ? `${g.color}33` : `${g.color}12`,
                      border: esElQueSeVe ? `1px solid ${g.color}` : "1px solid transparent",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                      <span className="text-xs font-medium text-white">{g.nombre}</span>
                    </span>
                    <span className="text-[10px]" style={{ color: g.color }}>
                      {g.distanciaM < 15 ? "Aquí mismo" : `a ${g.distanciaM} m`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="space-y-2 min-w-0">
          {gruposEnPista.map((g) => {
            const faltan = Math.max(0, g.offsetMs - elapsedMs2);
            const puedeSeguirse = g.progreso !== null;
            return (
              <button
                key={g.id}
                onClick={() => puedeSeguirse && seguirGrupo(g.id)}
                disabled={!puedeSeguirse}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left disabled:cursor-default"
                style={{
                  backgroundColor:
                    !puntoManual2 && grupoSeguido2?.id === g.id ? `${g.color}33` : `${g.color}1a`,
                  border:
                    !puntoManual2 && grupoSeguido2?.id === g.id
                      ? `1px solid ${g.color}`
                      : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-sm font-medium text-white">{g.nombre}</span>
                  <span className="text-[10px] text-white/60">
                    {rutasEnsayo.find((r) => r.id === g.rutaId)?.nombre}
                  </span>
                </div>
                <span className="text-xs" style={{ color: g.color }}>
                  {g.progreso === null
                    ? `Sale en ${Math.ceil(faltan / 1000)}s`
                    : g.progreso >= 1
                    ? "Completado"
                    : `En ruta · ${Math.round(g.progreso * 100)}% · bloque ~${g.tamanoBloqueM}m`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 sm:px-12 pb-10 bg-night-soft">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Progreso general</span>
          <span className="text-sm text-white/60">{Math.round(progresoGlobal2 * 100)}%</span>
        </div>

        <input
          type="range"
          min={0}
          max={duracionTotalEnsayo}
          step={1}
          value={elapsedMs2}
          onChange={(e) => {
            setEnMarcha2(false);
            const nuevo = Number(e.target.value);
            setElapsedMs2(nuevo);
            elapsedRef2.current = nuevo;
          }}
          className="w-full accent-gold-500 mb-5"
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setEnMarcha2((v) => !v)}
            disabled={elapsedMs2 >= duracionTotalEnsayo && !enMarcha2}
            className="rounded-full px-6 py-2.5 text-sm font-bold bg-gold-500 text-night disabled:opacity-50"
          >
            {enMarcha2 ? "Pausar" : elapsedMs2 >= duracionTotalEnsayo ? "Finalizado" : "Iniciar"}
          </button>

          <button
            onClick={reiniciar2}
            className="rounded-full px-5 py-2.5 text-sm font-semibold border border-gold-500/33 text-white"
          >
            Reiniciar
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-white/60">Velocidad</span>
            {[1, 2, 4].map((v) => (
              <button
                key={v}
                onClick={() => setVelocidad2(v)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: velocidad2 === v ? "#e8a33d" : "rgba(255,255,255,0.06)",
                  color: velocidad2 === v ? "#0c0908" : "#ffffff",
                }}
              >
                {v}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}