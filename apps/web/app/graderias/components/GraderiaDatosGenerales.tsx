import { Graderia } from "../../../../../packages/types/graderia";
import WhatsAppIcon from "@repo/ui/whatsapp-icon";
import DescripcionExpandible from "./DescripcionExpandible";

type Props = {
  graderia: Graderia;
  // h1 en la página de detalle, h2 en card/sidebar.
  tituloComo?: "h1" | "h2";
  tituloClassName?: string;
  descripcionClassName?: string;
  // Card trunca más corto que sidebar, que tiene más espacio.
  descripcionLimite?: number;
  // Hero la muestra aparte, a todo el ancho de la página.
  mostrarDescripcion?: boolean;
};

// Bloque de datos generales compartido por Card, Sidebar y Hero — antes cada
// uno tenía su propia copia y terminaron mostrando datos distintos (nombre
// vs. propietario como título, cédula filtrada donde iba la descripción).
// Con un solo lugar que arma estos campos, los tres quedan sincronizados.
export default function GraderiaDatosGenerales({
  graderia,
  tituloComo = "h2",
  tituloClassName = "text-2xl font-bold text-brand-900",
  descripcionClassName = "mt-3 text-sm leading-relaxed text-gray-600",
  descripcionLimite = 140,
  mostrarDescripcion = true,
}: Props) {
  const Titulo = tituloComo;
  const tieneDireccion = graderia.cuadra || graderia.acera || graderia.codigo;
  // Todavía no hay dato real de celular cargado (telefonoPropietario), así
  // que mientras tanto se muestra la cédula en su lugar. wa.me solo acepta
  // dígitos, sin "+", espacios ni guiones (mismo criterio que en
  // misAsientos/ResumenCompra).
  const contacto = graderia.telefonoPropietario || graderia.cedula;
  const numeroWhatsApp = contacto?.replace(/\D/g, "") || null;

  return (
    <div>
      <Titulo className={tituloClassName}>{graderia.nombre}</Titulo>

      {graderia.propietario && (
        <p className="mt-1 text-sm font-medium text-gray-700">
          {graderia.propietario}
        </p>
      )}

      {numeroWhatsApp && (
        <p className="mt-1 text-sm">
          <a
            href={`https://wa.me/${numeroWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-[#25D366]"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 text-[#25D366]" />
            WhatsApp: {contacto}
          </a>
        </p>
      )}

      <p className="mt-2 text-sm text-gray-500">📍 {graderia.ubicacion}</p>

      {tieneDireccion && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
          {graderia.cuadra && (
            <span>
              <strong>Cuadra:</strong> {graderia.cuadra}
            </span>
          )}
          {graderia.acera && (
            <span>
              <strong>Acera:</strong> {graderia.acera}
            </span>
          )}
          {graderia.codigo && (
            <span>
              <strong>Código:</strong> {graderia.codigo}
            </span>
          )}
        </div>
      )}

      {mostrarDescripcion && graderia.descripcion && (
        <DescripcionExpandible
          texto={graderia.descripcion}
          className={descripcionClassName}
          limite={descripcionLimite}
        />
      )}
    </div>
  );
}
