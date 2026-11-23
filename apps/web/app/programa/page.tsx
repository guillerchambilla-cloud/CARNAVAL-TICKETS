'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { rolSabado, rolDomingo } from './data';
import RevealOnScroll from '@repo/ui/revealOnScroll';

const TABS = [
  {
    id: 'sabado',
    label: 'Sábado de Peregrinación',
    sublabel: 'Primer Convite · Último Convite · Sábado de Peregrinación',
    rol: rolSabado,
    accent: '#c71f1f',
  },
  {
    id: 'domingo',
    label: 'Domingo de Carnaval',
    sublabel: 'Entrada Principal · Domingo de Carnaval 2026',
    rol: rolDomingo,
    accent: '#d97a06',
  },
] as const;

export default function RolPage() {
  const [activeTab, setActiveTab] = useState<'sabado' | 'domingo'>('sabado');

  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <>
      {/* ── Keyframes definidos aquí, sin necesidad de CSS global ── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .anim-fade-up {
          animation: fadeUp 0.4s ease-out both;
        }
      `}</style>

      <main>
        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1100px] px-6 pt-6 lg:px-[60px]">
          <RevealOnScroll delay={100}>
            <p className="text-sm text-ink-subtle">
              <Link href="/" className="hover:text-brand-900 transition-colors">
                Inicio
              </Link>{' '}
              / <span className="text-brand-900 font-medium">Rol de Ingreso 2026</span>
            </p>
          </RevealOnScroll>
        </div>

        {/* Header */}
        <section className="mx-auto max-w-[1100px] px-6 pt-6 pb-10 lg:px-[60px]">
          <RevealOnScroll delay={200}>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
              <span className="h-px w-8 bg-gold-500" />
              Carnaval de Oruro 2026
            </p>
            <h1 className="font-display mt-3 text-6xl uppercase text-brand-900 sm:text-7xl">
              Rol de Ingreso
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
              Orden oficial de ingreso de los conjuntos participantes en el
              Carnaval de Oruro 2026, por día y grupo.
            </p>
          </RevealOnScroll>

          {/* Tabs */}
          <RevealOnScroll delay={300}>
            <div className="mt-8 inline-flex rounded-[14px] border border-brand-200 bg-brand-50 p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`relative rounded-[10px] px-5 py-2.5 text-[14px] font-semibold transition-colors duration-300 ${
                    activeTab === t.id ? "text-white" : "text-ink-muted hover:text-brand-900"
                  }`}
                >
                  {activeTab === t.id && (
                    <motion.span
                      layoutId="programa-tab-pill"
                      className="absolute inset-0 rounded-[10px]"
                      style={{ backgroundColor: t.accent }}
                      transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>
          </RevealOnScroll>
        </section>

        {/* Sublabel */}
        <div
          className="border-y border-brand-200 py-3 transition-colors duration-500"
          style={{ backgroundColor: `${tab.accent}10` }}
        >
          <p
            className="mx-auto max-w-[1100px] px-6 text-[13px] font-semibold uppercase tracking-wide lg:px-[60px]"
            style={{ color: tab.accent }}
          >
            {tab.sublabel}
          </p>
        </div>

        {/* Grupos grid */}
        <section className="mx-auto max-w-[1100px] px-6 py-12 lg:px-[60px]">
          <div
            key={activeTab}
            className="anim-fade-up grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {tab.rol.grupos.map((grupo, i) => (
              <GrupoCard
                key={`${activeTab}-${grupo.numero}`}
                numero={grupo.numero}
                conjuntos={grupo.conjuntos}
                accent={tab.accent}
                delay={i * 60}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function GrupoCard({
  numero,
  conjuntos,
  accent,
  delay,
}: {
  numero: number;
  conjuntos: string[];
  accent: string;
  delay: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <div
        className="flex flex-col overflow-hidden rounded-[20px] border border-brand-200
                   transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        style={{ backgroundColor: `${accent}06` }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ backgroundColor: accent }}
        >
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center
                       rounded-full bg-white/20 text-[13px] font-bold text-white"
          >
            {numero}
          </span>
          <h2 className="text-[14px] font-bold uppercase tracking-wider text-white">
            Grupo {numero}
          </h2>
          <span className="ml-auto text-[12px] font-medium text-white/70">
            {conjuntos.length} conjuntos
          </span>
        </div>

        {/* Lista */}
        <ol className="flex flex-col divide-y divide-brand-200">
          {conjuntos.map((nombre, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-3">
              <span
                className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center
                           rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {i + 1}
              </span>
              <p className="text-[13px] leading-snug text-ink">{nombre}</p>
            </li>
          ))}
        </ol>
      </div>
    </RevealOnScroll>
  );
}