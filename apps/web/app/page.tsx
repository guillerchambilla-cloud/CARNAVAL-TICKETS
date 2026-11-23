import Link from "next/link";
import RevealOnScroll from "@repo/ui/revealOnScroll";
import HeroIntro from "./components/hero/HeroIntro";
import RevealScale from "./components/anime/RevealScale";
import StaggerCards from "./components/anime/StaggerCards";
import MotionLink from "./components/anime/MotionLink";
import { dances } from './danzas/data/danzas';

export const metadata = {
  title: "Carnaval Tickets — Oruro",
  description:
    "Consigue tus entradas para el Carnaval de Oruro, Patrimonio Oral e Intangible de la Humanidad UNESCO.",
};

export default function HomePage() {
  return (
    <main className="bg-[#fafafa] min-h-screen">

      {/* HERO SECTION — cinemática única controlada por HeroIntro/HeroTimeline */}
      <HeroIntro videoSrc="/video/hero-carnaval.mp4" />

      {/* MAPA SECTION */}
      <section
        className="section-y-lg mx-auto max-w-360 px-6 lg:px-15 xl:px-30"
        id="ruta"
      >
        <div className="mb-12 text-center">
          <RevealOnScroll delay={100}>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
              <span className="h-px w-8 bg-gold-500" />
              Cómo llegar
              <span className="h-px w-8 bg-gold-500" />
            </p>
            <h2 className="font-display mt-3 text-6xl uppercase text-brand-900 sm:text-7xl">
              Recorrido Oficial
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Conoce la ruta de peregrinación hacia el Santuario del Socavón.
            </p>
          </RevealOnScroll>
        </div>
        <RevealScale delay={250} className="block">
          <img
            src="/images_Carnaval/recorrido.jpg"
            alt="Mapa del recorrido oficial del Carnaval de Oruro"
            className="mx-auto block w-full max-w-[500px] rounded-[32px] object-cover shadow-2xl ring-1 ring-black/5"
          />
        </RevealScale>
      </section>

      {/* DANZAS CAROUSEL SECTION */}
      <section className="section-y-lg bg-white">
        <div className="mx-auto max-w-360 px-6 lg:px-15 xl:px-30">
          <RevealOnScroll delay={200}>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
                  <span className="h-px w-8 bg-gold-500" />
                  Folklore vivo
                </p>
                <h2 className="font-display mt-3 text-6xl uppercase text-brand-900 sm:text-7xl">
                  Danzas
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
                  Descubre la magia, el color y la historia detrás de cada
                  especialidad que compone el carnaval.
                </p>
              </div>
              <span className="text-sm font-semibold text-ink-subtle sm:hidden">
                Desliza para ver más →
              </span>
            </div>
          </RevealOnScroll>

          <StaggerCards className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar-custom">
            {dances.map(({ name, href, foto }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex-shrink-0 snap-center w-[85vw] sm:w-[400px] overflow-hidden rounded-[24px] shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-200">
                  <img
                    src={foto}
                    alt={`Danza ${name}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-start justify-end p-6">
                  <span className="font-display text-5xl uppercase text-white drop-shadow-md mb-3 transition-transform duration-300 group-hover:-translate-y-1">
                    {name}
                  </span>
                  <span className="inline-block rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-md transition-colors group-hover:bg-brand-700">
                    Conocer historia
                  </span>
                </div>
              </Link>
            ))}
          </StaggerCards>

          <div className="mt-8 text-center sm:text-left">
            <MotionLink
              href="/danzas"
              className="inline-block rounded-full border-2 border-brand-900 px-8 py-3.5 text-[16px] font-bold text-brand-900 transition-colors hover:bg-brand-900 hover:text-white"
            >
              Ver galería completa
            </MotionLink>
          </div>
        </div>
      </section>

      {/* CIERRE — banda oscura + dorado, el mismo tono "premium" del Header,
          para cortar el blanco/crema del resto de la página antes del
          footer y terminar con un CTA fuerte hacia la compra. */}
      <section className="section-y-lg relative overflow-hidden bg-night">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-1/2 h-105 w-105 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[120px]" />
          <div className="absolute -right-24 top-1/2 h-105 w-105 -translate-y-1/2 rounded-full bg-gold-500/15 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-360 px-6 text-center lg:px-15 xl:px-30">
          <RevealOnScroll delay={100}>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-gold-500">
              <span className="h-px w-8 bg-gold-500" />
              Cupos limitados
              <span className="h-px w-8 bg-gold-500" />
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-3xl text-6xl uppercase text-white sm:text-7xl">
              Vive el Carnaval desde primera fila
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/70">
              Reservá tu gradería en la Entrada del Carnaval de Oruro, Patrimonio de la Humanidad UNESCO.
            </p>
            <div className="mt-8">
              <MotionLink
                href="/graderias"
                className="inline-block rounded-full bg-gold-500 px-10 py-4 text-[16px] font-bold text-night shadow-premium transition-colors hover:bg-gold-400"
              >
                Comprar entradas
              </MotionLink>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
}
