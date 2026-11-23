"use client";

import { useEffect, useRef, useState } from "react";
import { setDemoRole } from "@repo/auth";
import jsQR from "jsqr";
import { decodificarTicketQR, type TicketQR } from "../../lib/compra/ticket-qr";

export default function VerificarEntradaPage() {
  const [checked, setChecked] = useState(false);
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<TicketQR | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    setDemoRole("duenioGrad");
    setChecked(true);
  }, []);

  function detener() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setEscaneando(false);
  }

  // Cortar la cámara si se sale de la página con el escaneo activo.
  useEffect(() => () => detener(), []);

  function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      frameRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imagen = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const codigo = jsQR(imagen.data, imagen.width, imagen.height);

    if (codigo) {
      const ticket = decodificarTicketQR(codigo.data);
      if (ticket) {
        setResultado(ticket);
        setError("");
        detener();
        return;
      }
      setError("Ese código QR no corresponde a una entrada de Tickest.");
    }

    frameRef.current = requestAnimationFrame(tick);
  }

  async function pedirCamara(): Promise<MediaStream> {
    // "environment" (cámara trasera) es lo ideal en un celular, pero una
    // laptop/PC solo tiene cámara frontal — pedirla como constraint estricto
    // puede tirar OverconstrainedError en esos equipos. Si falla por
    // cualquier motivo, reintenta sin especificar cámara (cualquier webcam).
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch {
      return navigator.mediaDevices.getUserMedia({ video: true });
    }
  }

  async function iniciarEscaneo() {
    setError("");
    setResultado(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Este navegador no puede acceder a la cámara acá. Probá con Chrome/Edge/Firefox, y que la página se abra en localhost o con HTTPS.",
      );
      return;
    }

    try {
      const stream = await pedirCamara();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setEscaneando(true);
      frameRef.current = requestAnimationFrame(tick);
    } catch (err) {
      const nombre = err instanceof DOMException ? err.name : "";
      if (nombre === "NotAllowedError") {
        setError("Permiso de cámara denegado. Habilitalo en la configuración del sitio y volvé a intentar.");
      } else if (nombre === "NotFoundError" || nombre === "OverconstrainedError") {
        setError("No se encontró ninguna cámara en este dispositivo.");
      } else if (nombre === "NotReadableError") {
        setError("La cámara está siendo usada por otra aplicación (cerrá otras pestañas/apps que la estén usando).");
      } else {
        setError("No se pudo acceder a la cámara. Revisá los permisos del navegador.");
      }
    }
  }

  if (!checked) {
    return (
      <main className="mx-auto flex min-h-[60vh] items-center justify-center">
        <p className="text-ink-muted">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-50">
      <section className="bg-brand-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Panel de propietario
          </p>
          <h1 className="font-display mt-3 text-4xl uppercase sm:text-5xl">Verificar entrada</h1>
          <p className="mt-2 text-white/70">
            Escaneá el QR de la entrada de un cliente. Los datos se leen directo del código, sin
            buscar nada en una base de datos — funciona desde cualquier dispositivo, no solo el que
            hizo la compra.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-8">
        {!resultado ? (
          <div className="rounded-[22px] border border-brand-200 bg-white p-6 text-center">
            <div className={escaneando ? "block" : "hidden"}>
              <video
                ref={videoRef}
                muted
                playsInline
                className="mx-auto w-full max-w-sm rounded-xl bg-black"
              />
              <p className="mt-3 text-sm text-ink-subtle">Apuntá la cámara al QR de la entrada.</p>
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {!escaneando && (
              <button
                onClick={iniciarEscaneo}
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
              >
                Iniciar escaneo
              </button>
            )}
            {escaneando && (
              <button
                onClick={detener}
                className="mt-4 rounded-full border border-brand-300 px-6 py-3 text-sm font-bold text-ink-muted"
              >
                Cancelar
              </button>
            )}
            {error && <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
          </div>
        ) : (
          <div className="rounded-[22px] border border-green-200 bg-green-50 p-6">
            <p className="text-lg font-extrabold text-green-700">✓ Asiento vendido</p>
            <div className="mt-4 space-y-2 text-sm">
              <Info titulo="Gradería" valor={resultado.graderiaNombre} />
              <Info titulo="Zona" valor={resultado.zonaNombre} />
              <Info titulo="Fila · Asiento" valor={`Fila ${resultado.fila} · Asiento ${resultado.numero}`} />
              <Info titulo="Comprador" valor={resultado.compradorNombre} />
              <Info titulo="Precio pagado" valor={`Bs ${resultado.precio.toFixed(2)}`} />
              <Info
                titulo="Estado de la compra"
                valor={
                  resultado.estado === "confirmada"
                    ? "Confirmada"
                    : resultado.estado === "pendiente"
                      ? "Pendiente"
                      : "Cancelada"
                }
              />
            </div>
            <button
              onClick={() => setResultado(null)}
              className="mt-6 w-full rounded-full bg-brand-900 py-3 text-sm font-bold text-white"
            >
              Escanear otra entrada
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function Info({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="flex justify-between border-b border-green-100 pb-2">
      <span className="text-ink-muted">{titulo}</span>
      <span className="font-semibold text-ink">{valor}</span>
    </div>
  );
}
