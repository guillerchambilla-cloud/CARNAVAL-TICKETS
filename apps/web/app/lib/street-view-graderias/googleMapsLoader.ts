// lib/street-view-graderias/googleMapsLoader.ts

declare global {
  interface Window {
    google: any;
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script-svg";
const GOOGLE_MAPS_CALLBACK_NAME = "__streetViewGraderiasGmapsReady";

export function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.StreetViewService) {
      resolve();
      return;
    }
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existing) {
      // Ya se está cargando desde otra instancia — esperar al callback global
      const prevCallback = (window as any)[GOOGLE_MAPS_CALLBACK_NAME];
      (window as any)[GOOGLE_MAPS_CALLBACK_NAME] = () => {
        prevCallback?.();
        resolve();
      };
      return;
    }

    (window as any)[GOOGLE_MAPS_CALLBACK_NAME] = () => resolve();

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry&loading=async&callback=${GOOGLE_MAPS_CALLBACK_NAME}`;
    script.async = true;
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });
}