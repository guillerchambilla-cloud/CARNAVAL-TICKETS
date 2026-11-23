import Link from 'next/link';
import RevealOnScroll from "@repo/ui/revealOnScroll";
import { dances } from './data/danzas';

export const metadata = {
  title: 'Danzas del Carnaval — Carnaval Tickets',
  description: 'Conoce las danzas más representativas del Carnaval de Oruro, su origen y departamento.',
};

export default function DanzasPage() {
  return (
    <main>
      <section className="mx-auto max-w-360 px-6 pt-10 lg:px-15 xl:px-30">
        <RevealOnScroll delay={100}>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
            <span className="h-px w-8 bg-gold-500" />
            Folklore vivo
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={200}>
          <h1 className="font-display mt-3 text-6xl uppercase text-brand-900 sm:text-7xl">Danzas del Carnaval</h1>
        </RevealOnScroll>
        <RevealOnScroll delay={300}>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Conoce algunas de las danzas más representativas que se presentan en la Entrada
            del Carnaval de Oruro, cada una con su origen y significado propio.
          </p>
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {dances.map(({ name, dept, slug, color, image }) => (
              <RevealOnScroll key={slug} delay={500}>
              <Link
                href={`/danzas/${slug}`}
                className="group flex items-center gap-5 rounded-[20px] border border-brand-200
                           bg-brand-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="relative flex h-[90px] w-[90px] flex-shrink-0 items-center justify-center rounded-full overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  <img
                    src={image}
                    alt={`Danza ${name}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div>
                  <h3 className="text-[21px] font-bold text-ink">{name}</h3>
                  <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wide text-ink-subtle">
                    Departamento
                  </p>
                  <p className="text-[16px] font-semibold" style={{ color }}>
                    {dept}
                  </p>
                </div>
              </Link>
              </RevealOnScroll>
            ))}
          </div>
      </section>
    </main>
  );
}