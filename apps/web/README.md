# Carnaval Tickets · Demo web

## Iniciar en local

Desde la raíz del monorepo:

```powershell
bun run dev --filter=web
```

La web queda disponible en `http://localhost:3000`.

## Perfiles de demostración

No hace falta iniciar sesión. El selector **Demo** del encabezado permite cambiar entre:

- **Cliente:** catálogo, compra simulada, mis entradas y reventa.
- **Dueño:** panel de gradería, reservas, reportes y verificación de entradas.
- **Administrador:** asignación de graderías y panel administrativo.

Los datos de ejemplo se cargan una sola vez por navegador. Compras, reservas, asignaciones y reventas se guardan en `localStorage`; cambiar de perfil conserva esos datos en ese mismo navegador. Cada visitante que abra el enlace en su propio navegador tendrá su copia local, no compartida con los demás.

Esta versión sirve para presentar y recorrer el front. No valida acceso, no guarda los cambios en un servidor/Firebase y no procesa pagos reales. Para persistencia compartida hay que conectar posteriormente Firebase y configurar reglas de seguridad antes de publicar datos reales.
