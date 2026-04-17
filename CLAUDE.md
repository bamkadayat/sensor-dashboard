# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then build production bundle
- `npm run lint` — run ESLint across the project
- `npm run preview` — preview the production build locally

There is no test suite configured.

## Architecture

Single-page React 19 + TypeScript + Vite dashboard. Despite the "sensor" naming, the data source is the **Binance public API**: the 16 symbols in `src/services/sensorApi.ts` (`SYMBOLS`) are rendered as "sensor" rows with price, change %, and a derived severity status. The "sensor" abstraction is intentional — any real-time numeric feed could swap in behind `fetchSensors` + `createSensorWebSocket` without touching the UI.

**Data flow** (read these together to understand the app):

1. `src/main.tsx` wraps the app in a single `QueryClientProvider`.
2. `src/hooks/useSensors.ts` is the orchestrator. On mount it:
   - Fetches the initial snapshot via React Query (`fetchSensors` → Binance REST `/ticker/24hr`), keyed by `["sensors"]`, `staleTime: Infinity`.
   - REST calls go through the shared axios instance in `src/services/http.ts` (request/response interceptors handle dev logging and error normalization — call sites just catch `Error`).
   - Opens a Binance combined WebSocket stream (`createSensorWebSocket`) and **pushes live updates into the same React Query cache** via `queryClient.setQueryData`. There is no refetch — the WS is the source of truth after the initial load.
   - Tracks `recentlyUpdatedIds` (cleared after 1s) so rows can flash/animate on change.
   - Derives `status` (`active | warning | critical | offline`) from `Math.abs(change%)` thresholds (>10 critical, >5 warning).
3. `src/App.tsx` consumes the hook and composes `ConnectionBadge`, `SummaryBar`, `StatusFilterBar`, and `SensorTable` (which renders memoized `SensorRow`s).

**Key invariants**:
- `SYMBOLS` in `sensorApi.ts` is the single source of truth for both REST fetch and WS subscription. The WS stream URL is built from it at module load (`${s}@miniTicker` joined with `/`). Adding/removing a symbol in `SYMBOLS` automatically propagates to both.
- Stable numeric `sensor.id` is assigned by `SYMBOLS` index (`symbolToSensorId`). `getSensorIdForSymbol` is the bridge from Binance symbol strings back to the UI's numeric id — WS messages must go through it.
- `deriveStatus` (and its `CRITICAL_CHANGE_PCT` / `WARNING_CHANGE_PCT` thresholds) lives in `sensorApi.ts` and is imported by `useSensors.ts` for live updates. Change thresholds in one place.
- Sparkline history: each `Sensor` carries a rolling `history: number[]` capped at `HISTORY_LIMIT` (in `useSensors.ts`). History is in-memory only — a page reload resets it.
- `sensorWebSocket.ts` defers the initial `connect()` via `setTimeout(..., 0)` so React StrictMode's synchronous double-mount in dev can cancel before a `WebSocket` is ever constructed. `dispose()` detaches all handlers before closing so post-dispose events can't fire callbacks or re-trigger the reconnect timer.

**Styling**: Tailwind CSS v4 via the `@tailwindcss/vite` plugin (not PostCSS). Custom animations (`flash-green`, `flash-red`, `value-pop`, `ping-slow`) and the `.sensor-row[data-severity]` severity tint live in `src/index.css` — these are driven from component props/state, not Tailwind utilities.
