'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { motion } from 'motion/react';
import FadeIn from '@repo/ui/FadeIn';
import { useAuth } from '../../../../packages/auth/src/use-auth';
import { getRedirectForUser } from '../../../../packages/auth/src/auth';

// 🔑 Requiere un OAuth Client ID real de Google Cloud Console (APIs & Services
// > Credentials > Create Credentials > OAuth client ID > Web application),
// con "http://localhost:3000" (y el dominio de prod) como Authorized
// JavaScript origin. Se pega en apps/web/.env.local:
//   NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// `window.google` ya está tipado como `any` globalmente en
// lib/street-view-graderias/googleMapsLoader.ts (lo comparte con el SDK de
// Google Maps), así que acá solo tipamos la forma que nos interesa de
// `accounts.id` al leerla.
interface GoogleIdCredentialResponse {
  credential: string;
}

// useSearchParams() obliga a envolver la página en Suspense: sin esto,
// `next build` falla al intentar prerenderizar la ruta.
export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0e0606]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gsiScriptReady, setGsiScriptReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { login, loginWithGoogleIdToken, loading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  // Ref para que el callback de Google siempre vea el redirectParam/router
  // actuales sin tener que reinicializar el botón en cada render.
  const handleCredentialRef = useRef<(idToken: string) => void>(() => {});
  handleCredentialRef.current = (idToken: string) => {
    const user = loginWithGoogleIdToken(idToken);
    if (!user) return;
    router.push(getRedirectForUser(user, redirectParam));
  };

  useEffect(() => {
    if (!gsiScriptReady || !GOOGLE_CLIENT_ID || !googleButtonRef.current) return;
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: GoogleIdCredentialResponse) => handleCredentialRef.current(response.credential),
    });

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: 360,
    });
  }, [gsiScriptReady]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = await login(email, password);
    if (!user) return;

    router.push(getRedirectForUser(user, redirectParam));
  }

  // 🧪 SOLO DEV — borrar este bloque antes de producción
  async function handleQuickLogin(quickEmail: string, quickPassword: string) {
    const user = await login(quickEmail, quickPassword);
    if (!user) return;
    router.push(getRedirectForUser(user, redirectParam));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0e0606] pb-10">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setGsiScriptReady(true)}
      />

      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[520px] w-[520px] rounded-full bg-[#d97a06]/15 blur-[130px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#6b2e5c]/20 blur-[100px]" />
      </div>

      {/* Rombos top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-6 opacity-20 select-none">
        {['◆','◇','◆','◇','◆','◇','◆','◇','◆','◇','◆','◇','◆'].map((d, i) => (
          <span key={i} className="text-brand-600 text-2xl">{d}</span>
        ))}
      </div>

      {/* Logo */}
      <div className="relative z-10 pt-8 text-center">
        <Link href="/" className="font-display inline-block text-3xl uppercase tracking-wide text-white/90 transition-colors hover:text-white">
          Carnaval Tickets
        </Link>
      </div>

      {/* Accesos de demostración: las sesiones y los datos viven en este navegador. */}
      <div className="relative z-10 mx-auto mt-4 w-full max-w-[420px] px-4">
        <div className="rounded-[16px] border border-gold-500/40 bg-white/5 p-4">
          <p className="text-center text-[13px] font-bold uppercase tracking-wide text-gold-400">
            Entrar en modo demostración
          </p>
          <p className="mb-3 mt-1 text-center text-[11px] leading-relaxed text-white/60">
            Elige un perfil. No requiere Google ni base de datos; las compras de prueba solo se guardan en este navegador.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: 'Admin', email: 'admin@tickest.com', password: 'admin123' },
              { label: 'Dueño', email: 'conjunto@tickest.com', password: 'conjunto123' },
              { label: 'Cliente', email: 'cliente@tickest.com', password: 'cliente123' },
              { label: 'Cliente 2', email: 'cliente2@tickest.com', password: 'cliente123' },
            ].map((quick) => (
              <motion.button
                key={quick.email}
                type="button"
                onClick={() => handleQuickLogin(quick.email, quick.password)}
                disabled={loading}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="flex min-h-16 flex-col items-start justify-center rounded-[10px] border border-white/10 bg-white/10 px-3 py-2 text-left transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                <span className="text-[12px] font-semibold text-white">Ingresar como {quick.label}</span>
                <span className="mt-0.5 break-all text-[10px] text-white/65">{quick.email}</span>
                <span className="text-[10px] text-gold-400">Clave: {quick.password}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-0.5">
        <FadeIn direction="up" delay={80} className="w-full max-w-[420px]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">

            {/* Careta */}
            <div className="mb-3 flex justify-center">
              <div className="relative flex h-[100px] w-[100px] items-center justify-center rounded-full bg-brand-600 shadow-[0_0_30px_rgba(199,31,31,0.5)]">
                  <img
                    src='caretas/diablada.png'
                    alt='diablada'
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
              </div>
            </div>

            <h1 className="font-display text-center text-5xl uppercase text-white">Bienvenido</h1>
            <p className="mt-1.5 text-center text-[15px] text-white/60">
              Ingresa para gestionar tus entradas del Carnaval
            </p>

            {/* Separador de colores */}
            <div className="mt-5 flex gap-1">
              {['#c71f1f','#d97a06','#c9a233','#6b2e5c','#c71f1f'].map((c, i) => (
                <div key={i} className="h-[3px] flex-1 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-white/70">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-[12px] border border-white/15 bg-white/10 px-4 py-3
                             text-[15px] text-white placeholder-white/30 outline-none
                             transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-white/70">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[12px] border border-white/15 bg-white/10 px-4 py-3 pr-12
                               text-[15px] text-white placeholder-white/30 outline-none
                               transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1
                               text-white/40 transition hover:text-white/80"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-[13px] text-[#e53535] text-center -mt-1">
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { y: -2, boxShadow: '0 6px 24px rgba(199,31,31,0.5)' }}
                whileTap={loading ? undefined : { scale: 0.98, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full
                           bg-brand-600 py-3.5 text-[16px] font-semibold text-white
                           shadow-[0_4px_20px_rgba(199,31,31,0.4)]
                           transition-colors hover:bg-brand-700
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0606]
                           disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Ingresando…
                  </>
                ) : 'Ingresar'}
              </motion.button>

              {/* Separador */}
              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[12px] text-white/35">o</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Botón oficial de Google (Google Identity Services) */}
              {GOOGLE_CLIENT_ID ? (
                <div className="flex justify-center [&>div]:w-full!" ref={googleButtonRef} />
              ) : (
                <p className="rounded-[12px] border border-dashed border-yellow-500/40 bg-yellow-500/5 px-4 py-3 text-center text-[12px] text-yellow-500/80">
                  Falta configurar <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> en{' '}
                  <code>apps/web/.env.local</code> para activar el login real con Google.
                </p>
              )}
            </form>


          </div>
        </FadeIn>
      </div>
      {/* Rombos bottom */}
      <div className="py-5 pointer-events-none absolute inset-x-0 -bottom-2 flex justify-center gap-6 opacity-20 select-none ">
        {['◇','◆','◇','◆','◇','◆','◇','◆','◇','◆','◇','◆','◇'].map((d, i) => (
          <span key={i} className="text-[#d97a06] text-2xl">{d}</span>
        ))}
      </div>
    </main>
  );
}
