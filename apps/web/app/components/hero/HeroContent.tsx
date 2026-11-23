"use client";

import HeroTitle from "./HeroTitle";
import HeroCTA from "./HeroCTA";
import HeroButtons from "./HeroButtons";
import type { HeroRefs } from "./types";

type Props = Pick<
  HeroRefs,
  | "contentRef"
  | "titleRef"
  | "ctaRef"
  | "ctaLinkRef"
  | "ctaGlowRef"
  | "buttonsRef"
>;

export default function HeroContent({
  contentRef,
  titleRef,
  ctaRef,
  ctaLinkRef,
  ctaGlowRef,
  buttonsRef,
}: Props) {
  return (
    <div
      ref={contentRef}
      className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-6"
    >
      {/* COLUMNA IZQUIERDA: título + párrafo descriptivo + botones secundarios */}
      <div className="flex flex-col items-start gap-5">
        <HeroTitle titleRef={titleRef} />

        <div
          data-secondary
          className="max-h-[45vh] max-w-md overflow-y-auto rounded-xl border border-white/10 bg-black/30 px-6 py-5 backdrop-blur-sm sm:max-w-lg lg:max-w-xl"
        >
          <p className="text-justify text-sm leading-relaxed text-gray-200 sm:text-base">
            El <strong className="text-white">Carnaval de Oruro</strong> es
            una de las manifestaciones culturales, religiosas y folklóricas
            más representativas de Bolivia y del mundo. Sus orígenes se
            remontan a la antigua Fiesta de Ito, celebración del pueblo Uru
            que, con la llegada de los españoles, se fusionó con la
            tradición católica en un proceso de sincretismo religioso
            vinculado a la{" "}
            <strong className="text-white">
              devoción de la Virgen del Socavón.
            </strong>{" "}
            Esta festividad reúne música, danza, coloridas vestimentas y una
            profunda expresión de fe, razón por la cual la{" "}
            <strong className="text-white">UNESCO</strong> la reconoció
            como{" "}
            <strong className="text-white">
              Patrimonio Cultural Inmaterial de la Humanidad
            </strong>{" "}
            por su extraordinario valor histórico, artístico y cultural.
          </p>
        </div>

        <HeroButtons buttonsRef={buttonsRef} />
      </div>

      {/* COLUMNA DERECHA: CTA + tagline */}
      <div className="flex flex-col items-start gap-4 lg:items-end">
        <HeroCTA ctaRef={ctaRef} ctaLinkRef={ctaLinkRef} ctaGlowRef={ctaGlowRef} />

        <p
          data-secondary
          className="text-[9px] font-medium uppercase tracking-widest text-gray-300 sm:text-xs lg:text-right"
        >
          Entradas oficiales · Pago seguro · QR verificado
        </p>
      </div>
    </div>
  );
}
