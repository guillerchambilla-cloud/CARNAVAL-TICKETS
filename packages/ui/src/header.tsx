"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, setDemoRole, type User, type UserRole } from "@repo/auth";

// La fuente de titulares (--font-display, Bebas Neue) se carga una sola vez
// en apps/web/app/layout.tsx y queda disponible acá vía CSS variable — antes
// se cargaba de nuevo en este archivo, ahora el logo solo la referencia.

type NavLink = { label: string; href: string };

const INICIO_LINK: NavLink = { label: "Inicio", href: "/" };

const BASE_LINKS: NavLink[] = [
  INICIO_LINK,
  { label: "Graderías", href: "/graderias" },
  { label: "Tiempo real", href: "/recorrido" },
  { label: "Rol de entrada", href: "/programa" },
  { label: "Danzas", href: "/danzas" },
];

const CLIENTE_LINKS: NavLink[] = [
  { label: "Compra de Asientos", href: "/graderias" },
  { label: "Mis asientos", href: "/misAsientos" },
  { label: "Reventa", href: "/reventa" },
];

const DUENO_LINKS: NavLink[] = [
  { label: "Gradería", href: "/panel-graderia" },
  { label: "Reportes", href: "/reportes" },
  { label: "Mis asientos", href: "/misAsientos" },
  { label: "Reventas", href: "/reventa" },
  { label: "Verificar entrada", href: "/panel-graderia/verificar" },
];

const ADMIN_LINKS: NavLink[] = [
  { label: "Panel de administración", href: "/dashboard" },
];

function getLinks(role?: UserRole | null): NavLink[] {
  const resto = BASE_LINKS.slice(1).filter((link) => link.href !== "/graderias");
  if (role === "cliente") return [INICIO_LINK, ...CLIENTE_LINKS, ...resto];
  if (role === "duenioGrad") return [INICIO_LINK, ...DUENO_LINKS, ...resto];
  if (role === "admin") return [INICIO_LINK, ...ADMIN_LINKS, ...resto];
  return BASE_LINKS;
}

function esActivo(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D] focus-visible:ring-offset-2 focus-visible:ring-offset-black/40";

// Rutas con un hero oscuro a pantalla completa detrás del header: son las
// únicas donde tiene sentido el modo `overlay` (transparente sobre el hero).
// Agregar rutas acá cuando tengan su propio hero.
const ROUTES_WITH_HERO = ["/"];

type HeaderProps = {
  variant?: "overlay" | "solid";
};

export default function Header({ variant }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isOverlay = variant
    ? variant === "overlay"
    : ROUTES_WITH_HERO.includes(pathname);

  const links = getLinks(user?.role);
  function handleDemoRoleChange(role: UserRole) {
    const demoUser = setDemoRole(role);
    setUser(demoUser);
    setMobileOpen(false);
    router.push(role === "admin" ? "/dashboard" : role === "duenioGrad" ? "/panel-graderia" : "/graderias");
  }

  // Estado inicial transparente sobre el hero; a partir de un pequeño scroll
  // pasa a vidrio oscuro. `passive: true` porque solo lee scrollY, nunca lo
  // previene. Solo aplica en modo `overlay`: en `solid` el fondo es fijo y no
  // hace falta escuchar el scroll.
  useEffect(() => {
    if (!isOverlay) return;

    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isOverlay]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setUser(getCurrentUser());

    function handleAuthChange() {
      setUser(getCurrentUser());
    }

    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  // Cambiar de ruta cierra cualquier menú abierto (mobile o de usuario).
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Next.js reusa la página "/" desde el Router Cache al volver a ella por
  // navegación cliente, así que HeroIntro no siempre se remonta y su
  // cinemática no se repite sola. El Header nunca se desmonta entre rutas,
  // así que es quien avisa (evento global) cada vez que "/" vuelve a quedar
  // activo — pero no en el montaje inicial, donde HeroIntro ya se encarga
  // solo. El nombre del evento debe coincidir con
  // apps/web/app/components/hero/hooks/useHeroTimeline.ts.
  const esPrimeraRuta = useRef(true);
  useEffect(() => {
    if (esPrimeraRuta.current) {
      esPrimeraRuta.current = false;
      return;
    }
    if (pathname === "/") {
      window.dispatchEvent(new Event("hero:replay"));
    }
  }, [pathname]);

  // `solid` (cualquier ruta sin hero) usa exactamente el mismo vidrio oscuro
  // que `overlay` una vez scrolleado — mismos colores en todas las pestañas,
  // solo cambia si hay o no un tramo transparente antes de llegar a él (el
  // de `overlay`, sobre el hero, cuando todavía no se scrolleó).
  // El "via"/"to" del degradado terminan bien antes del borde inferior (65%)
  // a propósito: el hero tiene su propio degradado independiente debajo,
  // mucho más alto. Si este llegara a 0 de opacidad justo en el último
  // píxel, la suma de ambos degradados deja un quiebre visible (una línea
  // tenue) justo en el borde del header. Terminando antes, ese tramo ya
  // llega "plano" en cero.
  const fondoClases =
    !isOverlay || scrolled
      ? "border-[#E8A33D]/15 bg-[#0C0908]/85 backdrop-blur-xl"
      : "border-transparent bg-linear-to-b from-black/70 via-black/25 via-40% to-transparent to-65%";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b ${isOverlay ? "motion-safe:transition-colors motion-safe:duration-300" : ""} ${fondoClases}`}
      >
        <div className="mx-auto flex h-(--header-h) max-w-[1440px] items-center justify-between px-6 lg:px-[43px]">
          {/* Logo */}
          <Link
            href="/"
            className={`shrink-0 text-2xl uppercase tracking-wide text-white ${FOCUS_RING} sm:text-[28px]`}
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            Carnaval Tickets
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden items-center gap-1 text-[15px] lg:flex">
            {links.map(({ label, href }) => {
              const active = esActivo(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative whitespace-nowrap rounded-full px-3.5 py-2 font-medium motion-safe:transition-colors motion-safe:duration-200 ${FOCUS_RING} ${
                    active ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-px h-px bg-[#E8A33D]"
                      style={{ boxShadow: "0 0 10px 1px #E8A33D" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Lado derecho — desktop */}
          <div className="hidden lg:flex">
            <label className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              <span className="text-white/60">Demo</span>
              <select
                aria-label="Cambiar perfil de demostración"
                value={user?.role ?? "cliente"}
                onChange={(event) => handleDemoRoleChange(event.target.value as UserRole)}
                className="max-w-40 cursor-pointer bg-transparent text-white outline-none [&>option]:bg-[#0C0908]"
              >
                <option value="cliente">Cliente</option>
                <option value="duenioGrad">Dueño</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
          </div>

          {/* Mobile: avatar (si hay sesión) + botón hamburguesa */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="rounded-full border border-gold-500/40 px-2.5 py-1 text-[11px] font-bold text-gold-400">
              DEMO · {user?.role === "admin" ? "ADMIN" : user?.role === "duenioGrad" ? "DUEÑO" : "CLIENTE"}
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 ${FOCUS_RING}`}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <span className="text-[14px] font-medium text-white">
                {mobileOpen ? "Cerrar" : "Menú"}
              </span>
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span
                  className={`block h-0.5 w-6 bg-white motion-safe:transition-transform motion-safe:duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
                />
                <span
                  className={`block h-0.5 w-6 bg-white motion-safe:transition-opacity motion-safe:duration-300 ${mobileOpen ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`block h-0.5 w-6 bg-white motion-safe:transition-transform motion-safe:duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Backdrop mobile — cerrar tocando afuera */}
        {mobileOpen && (
          <div
            className="fixed inset-0 top-(--header-h) z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile dropdown */}
        <div
          id="mobile-menu"
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
          className={`fixed inset-x-0 top-(--header-h) z-50 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-t border-white/10 bg-[#0C0908] shadow-2xl motion-safe:transition-[opacity,transform,visibility] motion-safe:duration-200 lg:hidden ${
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-2 px-6 py-4">
            {/* Usuario arriba de todo en mobile */}
            <label className="mb-2 flex items-center justify-between rounded-2xl border border-gold-500/30 bg-white/5 p-4 text-sm font-semibold text-white">
              <span>Cambiar perfil demo</span>
              <select
                aria-label="Cambiar perfil de demostración"
                value={user?.role ?? "cliente"}
                onChange={(event) => handleDemoRoleChange(event.target.value as UserRole)}
                className="max-w-36 rounded-lg bg-[#0C0908] px-2 py-2 text-gold-400 outline-none"
              >
                <option value="cliente">Cliente</option>
                <option value="duenioGrad">Dueño</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            {links.map(({ label, href }) => {
              const active = esActivo(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-[15px] font-medium motion-safe:transition-colors ${FOCUS_RING} ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {/* Empuja el contenido hacia abajo en modo `solid`: sale del propio
        componente (no del layout raíz) para que ambas variantes convivan sin
        que una necesite saber de la otra. En `overlay` no hace falta: el
        header flota transparente sobre el hero. */}
      {!isOverlay && <div className="h-(--header-h)" aria-hidden="true" />}
    </>
  );
}
