# Sensor Monitor

A real-time monitoring dashboard that renders live market data as operator-style "sensor" rows. Prices, deltas, and trend sparklines update in place from a WebSocket feed, with a dark control-room aesthetic.

The data source is the **Binance public API** — each row corresponds to a trading pair. The app is structured so the UI is data-source agnostic: any real-time numeric feed could replace Binance without touching components.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **@tanstack/react-query** — snapshot cache, mutated live by WS
- **axios** — REST calls with request/response interceptors
- Native `WebSocket` — no library needed

## Getting started

```bash
npm install
npm run dev
```

The app runs on Vite's default port (5173, or the next free one). Open the URL printed in the terminal.

## Commands

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start the dev server with HMR               |
| `npm run build`   | Type-check (`tsc -b`) and build for production |
| `npm run lint`    | Run ESLint across the project               |
| `npm run preview` | Preview the production build locally        |

## Architecture

**Data flow**

1. On mount, `useSensors` (in `src/hooks/`) fetches the initial snapshot from Binance's `/api/v3/ticker/24hr` endpoint. React Query caches the result under the key `["sensors"]` with `staleTime: Infinity` — there is no polling or refetch.
2. A combined Binance WebSocket stream is opened (`src/services/sensorWebSocket.ts`). Each incoming tick is pushed directly into the React Query cache via `queryClient.setQueryData`. From that point on, the WebSocket is the source of truth.
3. Each update also appends the new price to a rolling `history: number[]` array on the sensor (capped at 60 points) which drives the per-row sparkline.

**Key files**

```
src/
├── App.tsx                     # Layout shell: header, summary, filter, table
├── main.tsx                    # QueryClientProvider + StrictMode root
├── index.css                   # Tailwind + surfaces, shimmer, pop keyframes
├── hooks/
│   └── useSensors.ts           # Orchestrator: query + WS + filter
├── services/
│   ├── http.ts                 # Shared axios instance + interceptors
│   ├── sensorApi.ts            # SYMBOLS, NAMES, deriveStatus, fetchSensors
│   └── sensorWebSocket.ts      # Binance combined stream client
├── components/
│   ├── ConnectionBadge.tsx
│   ├── SummaryBar.tsx
│   ├── StatusFilterBar.tsx
│   ├── SensorTable.tsx
│   ├── SensorTableSkeleton.tsx
│   ├── SensorRow.tsx
│   └── Sparkline.tsx           # Zero-dep SVG sparkline
└── types/
    └── sensor.ts               # Sensor + SensorStatus types
```

**Conventions**

- `SYMBOLS` in `services/sensorApi.ts` is the single source of truth for both the REST fetch and the WebSocket subscription. Adding or removing a symbol propagates to both automatically.
- Severity thresholds (`CRITICAL_CHANGE_PCT`, `WARNING_CHANGE_PCT`) and the `deriveStatus` function live in `sensorApi.ts` and are imported wherever needed — don't duplicate.
- REST calls go through `services/http.ts`. The response interceptor normalizes failures to `Error(message)` so call sites don't need to pattern-match on the axios error shape.
- The WS client defers its initial `connect()` by a microtask so React StrictMode's synchronous double-mount in dev doesn't trigger the "WebSocket is closed before the connection is established" warning.

## Notes

- Sparkline history is in-memory only; a page reload resets it.
- Styling is dark-theme first — see the `.surface` / `.surface-inset` utility classes in `index.css` for the paneled console look.
- No test suite is configured.
