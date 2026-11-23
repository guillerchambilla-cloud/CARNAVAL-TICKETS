// jspdf no declara tipos para este subpath específico (solo para el paquete
// "jspdf" en sí). Se importa directo por acá (en vez de "jspdf" a secas)
// para esquivar la condición "node" del package.json, que apunta a una
// build que Next no puede empaquetar en SSR (ver reportes/page.tsx).
declare module "jspdf/dist/jspdf.es.min.js" {
  export * from "jspdf";
  export { default } from "jspdf";
}
