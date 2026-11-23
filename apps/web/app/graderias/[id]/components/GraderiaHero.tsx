"use client";

import Link from "next/link";
import { Graderia } from "../../../../../../packages/types/graderia";
import GraderiaDatosGenerales from "../../components/GraderiaDatosGenerales";
import GraderiaBanner from "../../components/GraderiaBanner";
import DescripcionExpandible from "../../components/DescripcionExpandible";

type Props = {
  graderia: Graderia;
};

export default function GraderiaHero({ graderia }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <GraderiaBanner graderia={graderia} />

      <div className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <GraderiaDatosGenerales
            graderia={graderia}
            tituloComo="h1"
            tituloClassName="font-display text-4xl uppercase text-brand-900 sm:text-5xl"
            mostrarDescripcion={false}
          />

          <div className="text-right">
            <p className="text-sm font-medium text-ink-subtle">Desde</p>

            <h2 className="text-3xl font-extrabold text-brand-600">
              Bs {graderia.precioMin}
            </h2>

            <p className="text-sm text-ink-subtle">
              hasta Bs {graderia.precioMax}
            </p>
          </div>
        </div>

        {graderia.descripcion && (
          <DescripcionExpandible
            texto={graderia.descripcion}
            className="leading-relaxed text-ink-muted"
            limite={280}
          />
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Capacidad" value={graderia.capacidad} icon={<UsersIcon />} />
            <StatCard label="Longitud" value={`${graderia.metrosLineales} m`} icon={<RulerIcon />} />
            <StatCard label="Zonas" value={graderia.zonas.length} icon={<TicketIcon />} />
          </div>

          {/* Antes había un mini-mapa embebido acá; se reemplazó por un link
              directo al mapa grande de /graderias (ya centrado y con el pin
              de esta gradería seleccionado) — mismo mapa, sin duplicar otra
              instancia de Leaflet chica en esta página. */}
          <Link
            href={`/graderias?vista=mapa&id=${graderia.id}`}
            className="group flex h-40 flex-col justify-between rounded-xl border border-brand-200 bg-brand-100 p-4 transition-colors hover:border-brand-600 hover:bg-brand-200/60 sm:h-full"
          >
            <div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition-transform group-hover:scale-105">
                <PinIcon />
              </span>
              <p className="mt-3 text-sm font-bold text-brand-900">Ubicación</p>
              <p className="mt-1 line-clamp-2 text-xs text-ink-subtle">{graderia.ubicacion}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-colors group-hover:text-brand-700">
              Ver en el mapa
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-brand-100 p-4">
      <p className="text-sm font-medium text-ink-subtle">{label}</p>
      <h3 className="mt-1.5 flex items-center gap-2 text-xl font-bold text-brand-900">
        <span className="text-brand-600">{icon}</span>
        {value}
      </h3>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-5.5-3.7M9 20H4v-1a4 4 0 015.5-3.7M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l14-14M6 20l14-14M8 6l2 2M12 10l2 2M16 14l2 2" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H4a1 1 0 00-1 1v3a2 2 0 010 4v3a1 1 0 001 1h5m0-12h11a1 1 0 011 1v3a2 2 0 000 4v3a1 1 0 01-1 1H9m0-12v12" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
