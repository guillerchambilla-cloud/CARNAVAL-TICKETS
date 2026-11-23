import Link from "next/link";

export default function Footer() {
  const links = [
    { label: "Inicio", href: "/" },
    { label: "Graderías", href: "/graderias" },
    { label: "Mis asientos", href: "/misAsientos" },
    { label: "Danzas", href: "/danzas" },
    { label: "Recorrido", href: "/recorrido" },
  ];

  const social = [
    {
      label: "Instagram",
      href: "https://instagram.com",
      icon: (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37a4 4 0 1 1-3.37-3.37A4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: "https://facebook.com",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6H17V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H8v3h2.5v8h3z" />
        </svg>
      ),
    },
  ];

  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-night text-white">
      {/* Mismo tratamiento "premium" que el Header/cierre de home: línea
          superior dorada tenue + glow de marca, en vez del borde blanco
          genérico que traía antes — así el footer se lee como parte del
          mismo sistema, no como una sección aparte. */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-gold-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-360 px-6 py-16 lg:px-15 xl:px-30">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Logo */}
          <div>
            <Link
              href="/"
              className="font-display text-3xl uppercase tracking-wide text-white"
            >
              Carnaval Tickets
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Viví la magia del Carnaval de Oruro. Aplicación construida para la
              difusión de eventos y venta de entradas.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-500/80">
              Navegación
            </p>

            <nav className="mt-4 flex flex-col gap-3">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit text-[15px] font-medium text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Redes sociales */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-500/80">
              Síguenos
            </p>

            <nav className="mt-4 flex flex-col gap-3">
              {social.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-3 text-[15px] font-medium text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Parte inferior */}
        <div className="mt-14 flex flex-col-reverse items-start gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-white/40">
            © {year} Carnaval Tickets. Todos los derechos reservados.
          </p>

          <p className="text-[13px] text-white/30">Oruro, Bolivia</p>
        </div>
      </div>
    </footer>
  );
}
