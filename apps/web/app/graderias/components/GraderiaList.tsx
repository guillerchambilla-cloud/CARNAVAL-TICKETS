import { Graderia } from "../../../../../packages/types/graderia";
import GraderiaCard from "./GraderiaCard";

type Props = {
  graderias: Graderia[];
  onVerEnMapa?: (graderia: Graderia) => void;
};

export default function GraderiaList({ graderias, onVerEnMapa }: Props) {
  if (graderias.length === 0) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-100 p-8 text-center">
        <svg className="h-10 w-10 text-brand-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
        </svg>

        <h2 className="mt-4 text-xl font-bold text-brand-900">
          No encontramos graderías
        </h2>

        <p className="mt-2 max-w-sm text-ink-muted">
          Prueba cambiando el nombre de búsqueda o los filtros para ver más
          resultados.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {graderias.map((graderia) => (
        <GraderiaCard key={graderia.id} graderia={graderia} onVerEnMapa={onVerEnMapa} />
      ))}
    </section>
  );
}
