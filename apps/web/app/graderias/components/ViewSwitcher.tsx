"use client";

import { motion } from "motion/react";

type Props = {
  view: "map" | "list";
  onChange: (view: "list" | "map") => void;
};

const OPTIONS = [
  { id: "list" as const, label: "Lista" },
  { id: "map" as const, label: "Mapa" },
];

export default function ViewSwitcher({ view, onChange }: Props) {
  return (
    <div className="flex w-fit rounded-xl border border-brand-200 bg-white p-1 shadow-sm">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`relative rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
            view === option.id ? "text-white" : "text-ink-muted hover:text-brand-900"
          }`}
        >
          {view === option.id && (
            <motion.span
              layoutId="graderias-view-pill"
              className="absolute inset-0 rounded-lg bg-brand-600"
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          )}
          <span className="relative">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
