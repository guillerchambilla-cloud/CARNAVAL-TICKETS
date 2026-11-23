import { type Waypoint, type Conjunto } from "./routeData";

export type RutaEnsayo = {
  id: string;
  nombre: string; // zona / motivo del recorrido
  puntos: Waypoint[];
};

export const rutasEnsayo: RutaEnsayo[] = [
  {
    id: "zona-norte",
    nombre: "Zona Norte · Héroes del Chaco",
    puntos: [
      { id: "zn-1", lat: -17.9519707, lng: -67.1105388, tramo: "Av. Héroes del Chaco (Inicio)" }, // Punto 31
      { id: "zn-2", lat: -17.9544736, lng: -67.1089938, tramo: "Av. Héroes del Chaco" },         // Punto 30
      { id: "zn-3", lat: -17.9572798, lng: -67.1093705, tramo: "Av. Héroes del Chaco" },         // Punto 29
      { id: "zn-4", lat: -17.9575349, lng: -67.1076754, tramo: "Calle Teniente León" },          // Punto 28
      { id: "zn-5", lat: -17.9582768, lng: -67.106756,  tramo: "Calle Teniente León" },          // Punto 27
      { id: "zn-6", lat: -17.9592668, lng: -67.1061445, tramo: "Calle Aroma y Pagador" },        // Punto 26
    ],
  },
  {
    id: "zona-sur",
    nombre: "Zona Sur · Av. España",
    puntos: [
      { id: "zs-1", lat: -17.9820668, lng: -67.111228,  tramo: "Av. España (Inicio)" },          // Punto 32
      { id: "zs-2", lat: -17.9802299, lng: -67.1113996, tramo: "Av. España" },                   // Punto 33
      { id: "zs-3", lat: -17.9792707, lng: -67.1120112, tramo: "Av. España y Velasco" },         // Punto 34
      { id: "zs-4", lat: -17.9764054, lng: -67.1111506, tramo: "Calle Velasco Galvarro" },       // Punto 35
      { id: "zs-5", lat: -17.9746983, lng: -67.1107284, tramo: "Calle Velasco Galvarro" },       // Punto 36
      { id: "zs-6", lat: -17.9732162, lng: -67.1103637, tramo: "Calle Velasco Galvarro" },       // Punto 37
    ],
  },
  {
    id: "zona-este",
    nombre: "Zona Este · Av. del Ejército",
    puntos: [
      { id: "ze-1", lat: -17.9614421, lng: -67.1058935, tramo: "Av. del Ejército (Inicio)" },    // Punto 1
      { id: "ze-2", lat: -17.9629934, lng: -67.1063227, tramo: "Av. del Ejército" },             // Punto 2
      { id: "ze-3", lat: -17.9642895, lng: -67.1067089, tramo: "Av. del Ejército y Brasil" },    // Punto 3
      { id: "ze-4", lat: -17.9647181, lng: -67.1068269, tramo: "Av. del Ejército y Backovic" },  // Punto 4
      { id: "ze-5", lat: -17.9646161, lng: -67.1078998, tramo: "Calle Backovic" },               // Punto 5
      { id: "ze-6", lat: -17.9645753, lng: -67.1088869, tramo: "Calle Backovic y Bolívar" },     // Punto 6
    ],
  },
  {
    id: "zona-oeste",
    nombre: "Zona Oeste · San Felipe",
    puntos: [
      { id: "zo-1", lat: -17.9799354, lng: -67.127951,  tramo: "Calle San Felipe (Inicio)" },    // Punto 51
      { id: "zo-2", lat: -17.9802415, lng: -67.1269613, tramo: "Calle San Felipe" },             // Punto 50
      { id: "zo-3", lat: -17.9806859, lng: -67.1254633, tramo: "Calle San Felipe" },             // Punto 49
      { id: "zo-4", lat: -17.981183,  lng: -67.123672,  tramo: "San Felipe y Petot" },           // Punto 48
      { id: "zo-5", lat: -17.9805315, lng: -67.1235561, tramo: "Calle Petot" },                  // Punto 47
    ],
  },
];

export type GrupoEnsayo = Conjunto & {
  rutaId: string;
  duracionMs: number;
  offsetMs: number;
};

export const gruposEnsayo: GrupoEnsayo[] = [
  { id: "diablada-ensayo", nombre: "Diablada", color: "#b91c1c", imagen: "/caretas/diablada.png", tamanoBloqueM: 90, rutaId: "zona-norte", duracionMs: 45000, offsetMs: 0 },
  { id: "morenada-ensayo", nombre: "Morenada", color: "#d4a017", imagen: "/caretas/morenada.png", tamanoBloqueM: 110, rutaId: "zona-sur", duracionMs: 50000, offsetMs: 3000 },
  { id: "caporales-ensayo", nombre: "Caporales", color: "#0f766e", imagen: "/caretas/caporales.png", tamanoBloqueM: 70, rutaId: "zona-este", duracionMs: 40000, offsetMs: 6000 },
  { id: "tinku-ensayo", nombre: "Tinku", color: "#6b7280", imagen: "/caretas/tinku.png", tamanoBloqueM: 60, rutaId: "zona-oeste", duracionMs: 42000, offsetMs: 1500 },
];

export function rutaDe(rutaId: string): Waypoint[] {
  return rutasEnsayo.find((r) => r.id === rutaId)?.puntos ?? [];
}

export const duracionTotalEnsayo = Math.max(
  ...gruposEnsayo.map((g) => g.offsetMs + g.duracionMs)
);