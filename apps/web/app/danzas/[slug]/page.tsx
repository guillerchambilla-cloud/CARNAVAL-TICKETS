import { notFound } from 'next/navigation';
import Link from 'next/link';
import RevealOnScroll from "@repo/ui/revealOnScroll";
import { dances, getDanzaBySlug } from '../data/danzas';

// ─── Iconos SVG por categoría ──────────────────────────────────────────────
const ICONS = {
  origen: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="2" width="20" height="20">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5" fill="currentColor" stroke="none"/>
  </svg>`,

  vestimenta: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="2" width="20" height="20">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M6 2l-4 4 4 4V8h3v13h6V8h3v2l4-4-4-4-3 2a3 3 0 01-6 0L6 2z"/>
  </svg>`,

  personajes: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="2" width="20" height="20">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M17 20h5v-1a4 4 0 00-5.5-3.7M9 20H4v-1a4 4 0 015.5-3.7M15 7a4 4 0 11-8 0 4 4 0 018 0z"/>
    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7a3 3 0 110-6 3 3 0 010 6z"/>
  </svg>`,

  musica: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="2" width="20" height="20">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M9 19V6l12-3v13"/>
    <circle cx="6" cy="19" r="3" stroke-width="2"/>
    <circle cx="18" cy="16" r="3" stroke-width="2"/>
  </svg>`,
};

// ─── Metadata ──────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return dances.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const danza = getDanzaBySlug(slug);
  if (!danza) return {};
  return {
    title: `${danza.name} — Carnaval Tickets`,
    description: danza.descripcion,
  };
}

// ─── Página ────────────────────────────────────────────────────────────────
export default async function DanzaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const danza = getDanzaBySlug(slug);
  if (!danza) notFound();

  return (
    <main>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1100px] px-6 pt-6 lg:px-[60px]">
        <RevealOnScroll delay={100}>
          <p className="text-sm text-ink-subtle">
            <Link href="/danzas" className="hover:text-brand-900 transition-colors">
              Danzas
            </Link>{' '}
            / <span className="text-brand-900 font-medium">{danza.name}</span>
          </p>
        </RevealOnScroll>
      </div>

      {/* Hero */}
      <section className="px-6 pt-6 pb-16 lg:px-[60px]">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 md:grid-cols-2 md:items-start">

          {/* Columna imagen */}
          <RevealOnScroll delay={200}>
            <div
              key={danza.slug}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px]
                         shadow-xl animate-[fadeScale_0.6s_ease-out]"
              style={{ backgroundColor: `${danza.color}15` }}
            >
              {danza.foto ? (
                <img
                  src={danza.foto}
                  alt={`Danza ${danza.name}`}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-subtle">
                  <span className="text-sm font-medium">Imagen de {danza.name}</span>
                  <span className="text-xs opacity-70">pendiente de cargar</span>
                </div>
              )}

              
                <span
                  className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-full
                             bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase
                             leading-tight tracking-wide text-ink shadow-sm backdrop-blur-sm"
                >
                Declarada Obra Maestra del Patrimonio Oral e Intangible de la Humanidad
                </span>
          
            </div>
          </RevealOnScroll>

          {/* Columna texto */}
          <div>
            <RevealOnScroll delay={250}>
              <p className="text-[13px] font-bold uppercase tracking-widest text-brand-700">
                Danza destacada
              </p>
            </RevealOnScroll>

            <div className="mt-1 flex items-center gap-4">
              <RevealOnScroll delay={300}>
                <h1 className="font-display text-6xl uppercase leading-none text-brand-900 lg:text-7xl">
                  {danza.name}
                </h1>
              </RevealOnScroll>

              {danza.image && (
                <RevealOnScroll delay={320}>
                  {/* h-24 w-24 — Tailwind sí incluye estos valores */}
                  <div
                    className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full shadow-md"
                    style={{ backgroundColor: danza.color }}
                  >
                    <img
                      src={danza.image}
                      alt={danza.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </RevealOnScroll>
              )}
            </div>

            <RevealOnScroll delay={350}>
              <span
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1
                           text-[13px] font-semibold"
                style={{ backgroundColor: `${danza.color}18`, color: danza.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: danza.color }} />
                {danza.dept}
              </span>
            </RevealOnScroll>

            <RevealOnScroll delay={400}>
              <h2 className="mt-8 text-[16px] font-bold text-ink">Historia</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink">{danza.origen}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink text-justify">{danza.descripcion}</p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Tarjetas */}
      <section className="mx-auto max-w-[1100px] px-6 pb-24 lg:px-[60px]">
        <RevealOnScroll delay={150}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard title="Origen"     text={danza.dept}        color={danza.color} icon={ICONS.origen}     />
            <InfoCard title="Vestimenta" text={danza.vestimenta}  color={danza.color} icon={ICONS.vestimenta} />
            {danza.personajes && (
              <InfoCard title="Personajes" text={danza.personajes} color={danza.color} icon={ICONS.personajes} />
            )}
            <InfoCard title="Música"    text={danza.musica}       color={danza.color} icon={ICONS.musica}     />
          </div>
        </RevealOnScroll>

        {danza.conjuntos && danza.conjuntos.length > 0 && (
        <RevealOnScroll delay={550}>
            <h2 className="mt-10 text-[16px] font-bold text-ink">Conjuntos destacados</h2>
            <div className="mt-3 flex flex-wrap gap-2">
            {danza.conjuntos.map((conjunto, i) => (
                <span
                key={i}
                className="rounded-full border px-4 py-2 text-[13px] font-semibold"
                style={{ borderColor: danza.color, color: danza.color, backgroundColor: `${danza.color}10` }}
                >
                {conjunto}
                </span>
            ))}
            </div>
        </RevealOnScroll>
        )}

        {/* Navegación entre danzas */}
        <RevealOnScroll delay={650}>
          <div className="mt-16 border-t border-brand-200 pt-10">
            <h2 className="text-[18px] font-bold text-ink">Otras danzas</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {dances
                .filter((d) => d.slug !== danza.slug)
                .map((d) => (
                  <Link
                    key={d.slug}
                    href={`/danzas/${d.slug}`}
                    className="rounded-full border px-4 py-2 text-[14px] font-semibold
                               transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: d.color, color: d.color }}
                  >
                    {d.name}
                  </Link>
                ))}
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}

// ─── Componente InfoCard ───────────────────────────────────────────────────
function InfoCard({
  title,
  text,
  color,
  icon,
}: {
  title: string;
  text: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-[16px] border border-brand-200 p-5"
      style={{ backgroundColor: `${color}08` }}
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-white"
        style={{ backgroundColor: color }}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
      <h3 className="mt-3 text-[15px] font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}