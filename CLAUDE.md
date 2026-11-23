# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Tickest** ("Carnaval Tickets — Oruro") is a ticketing platform for grandstand seating (*graderías*) along the Carnaval de Oruro parade route in Bolivia. Users browse grandstands (*graderías* / *predios*) mapped along the parade streets, buy seats (*asientos*) in a given zone (*zona*), and can resell purchased tickets on a peer-to-peer marketplace (*reventa*).

Turborepo monorepo, package manager is **Bun** (`bun@1.2.11`, see `packageManager` in `package.json`). Workspaces: `apps/*` and `packages/*`.

## Commands

Run from the repo root unless noted. Turbo fans these out to the relevant workspace(s).

```sh
bun install              # install all workspace deps
turbo dev                # run all dev servers (web on :3000)
turbo dev --filter=web   # run just the Next.js app
turbo build              # build all apps/packages
turbo build --filter=web
turbo lint                # eslint across workspaces (max-warnings 0)
turbo check-types         # tsc --noEmit / next typegen across workspaces
bun format                # prettier --write over ts/tsx/md
```

`apps/api` (NestJS) has its own scripts, run from `apps/api/`:

```sh
bun run dev               # nest start --watch (port 8000 by default)
bun run build              # nest build
bun run lint                # eslint --fix
bun run test                 # jest unit tests (spec files under src/)
bun run test -- app.controller.spec.ts   # run a single unit test file
bun run test:watch
bun run test:e2e             # jest e2e (test/*.e2e-spec.ts)
```

Postgres for local dev is provided via `docker-compose.yml` (`docker compose up -d`, exposes `5432`, db `tickets`, user/pass `postgres`/`postgres`). `apps/api/prisma/schema.prisma` currently only declares the datasource/generator — no models yet.

There is no root-level test runner; tests currently only exist under `apps/api`.

## Architecture

### Monorepo layout

- `apps/web` — Next.js 16 (App Router, React 19 RC) customer-facing site. This is where almost all product logic currently lives.
- `apps/api` — NestJS service. Still the unmodified Nest starter (single `AppController`/`AppService`) plus a Prisma schema with no models yet — **not wired into the frontend**. Treat it as scaffolding, not a live source of truth.
- `packages/types` — shared domain types with **no barrel file**; import directly from each file (e.g. `packages/types/graderia.ts`), not from `packages/types/index`. Core entities: `Graderia`, `Zona`, `Asiento`, `Compra`, `Reventa`, `FaseVenta`.
- `packages/auth` — client-only mock auth (`@repo/auth`). No real backend auth exists yet.
- `packages/ui` — shared React components (`@repo/ui/header`, `@repo/ui/button`, etc.), exported per-file via `"./*": "./src/*.tsx"` — import as `@repo/ui/<filename>`, no default export from the package root.
- `packages/eslint-config`, `packages/typescript-config` — shared lint/tsconfig bases (`base`, `nextjs`, `react-library` variants).

### Everything is a frontend demo right now — no real backend

This is the single most important thing to know before changing behavior:

- **Auth** (`packages/auth/src/auth.ts` + `data.ts`): `login()` checks credentials against a hardcoded `USERS` array and simulates network latency with `setTimeout`. The logged-in user is persisted to `localStorage["tickest_user"]`. There is no session/JWT/cookie — `getCurrentUser()` just reads localStorage. Three roles: `admin`, `cliente`, `duenioGrad` (grandstand owner), each redirected to a different landing page by `getRedirectForUser`.
- **Purchases** (`apps/web/app/lib/compra/compra.tsx`): `Compra` records are stored in `localStorage["tickest_compras"]`, seeded with hardcoded `COMPRAS_DEMO` on first read so demo accounts have order history. `registrarCompra` → `pendiente`, `confirmarCompra` → `confirmada`.
- **Cart** (`apps/web/app/lib/compra/carrito.tsx`): held in `sessionStorage["tickest_carrito"]`, cleared on `limpiarCarrito()`.
- **Resale marketplace** (`apps/web/app/lib/reventa/reventa.ts`): `Reventa` records in `localStorage["tickest_reventas"]`. Ownership-transfer rules live here — `puedeRevender()` walks resale history for a seat and only allows a re-listing by the seat's most recent buyer.
- **Grandstand/seat data** (`apps/web/app/data/graderia.ts`, ~12k lines): auto-generated from an external `infopredio.json` source (see file header comment) — seats are synthesized via `generateAsientos(metrosLineales, precioBase)` in `packages/types/generateAsientos.ts` (fixed 9 rows × `floor(metrosLineales * 2)` columns). Don't hand-edit large chunks of this file; regenerate from source data instead.
- `apps/web/app/lib/compra/enriquecer-graderias.ts` overlays demo-only fields (`duenoId`, `fasesVenta`) onto a hardcoded subset of grandstand IDs — this is where owner/sale-phase demo data is injected on top of the base dataset.
- `apps/web/app/services/gradia.service.ts` is dead/commented-out code sketching a future real API client — don't treat it as active.

When adding a feature, match the existing pattern (localStorage/sessionStorage-backed "repository" functions colocated under `apps/web/app/lib/<domain>/`) unless you're explicitly asked to build out the real `apps/api` backend.

### Domain vocabulary (Spanish)

- **Graderías / predios** — grandstands/lots along the route, each with `zonas` (pricing zones) containing `asientos` (seats).
- **Fases de venta** (`FaseVenta`) — timed pricing phases per grandstand (e.g. `preventa1`, `fase1`) with a price `multiplicador`.
- **Reventa** — peer resale of a purchased seat; `estado` moves `activa → vendida | cancelada`.
- **Recorrido** — the parade route itself (see `apps/web/app/recorrido/`, `redDeCalles.ts` street network data).
- **Danzas** — the folkloric dance groups/troupes participating (see `apps/web/app/danzas/`).
- **Duenio de gradería** (`duenioGrad` role) — grandstand owner, manages their own inventory via `apps/web/app/panel-graderia/`.

### Maps & geo

Two mapping stacks are both in use: **Leaflet** (`react-leaflet`, `apps/web/app/graderias/components/LeafletMap.tsx`) for the grandstand list/selection map, and **Google Maps** (`@googlemaps/js-api-loader`, `apps/web/app/lib/street-view-graderias/`) for Street View panels showing a grandstand's physical location. Grandstand geometry (`center`, `coords` polygon) lives directly on the `Graderia` type.

### Styling & animation

Tailwind CSS v4 (via `@tailwindcss/postcss`), no `tailwind.config.*` — config is CSS-first in `globals.css`. `animejs` v4 is used for hero/landing animations (`apps/web/app/components/anime/`).
