import { useSensors } from "./hooks/useSensors";
import { ConnectionBadge } from "./components/ConnectionBadge";
import { SummaryBar } from "./components/SummaryBar";
import { StatusFilterBar } from "./components/StatusFilterBar";
import { SensorTable } from "./components/SensorTable";
import { SensorTableSkeleton } from "./components/SensorTableSkeleton";
import type { SensorStatus } from "./types/sensor";

function App() {
  const {
    sensors,
    allSensors,
    isLoading,
    isError,
    connectionStatus,
    recentlyUpdatedIds,
    lastEvent,
    filter,
    setFilter,
  } = useSensors();

  const counts = allSensors.reduce(
    (acc, s) => {
      acc[s.status]++;
      acc.all++;
      return acc;
    },
    { all: 0, active: 0, warning: 0, critical: 0, offline: 0 } as Record<
      SensorStatus | "all",
      number
    >,
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* ── Header ── */}
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-sky-600/5 text-cyan-300 shadow-[0_0_24px_-6px_rgba(34,211,238,0.5)]">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12h3l2-7 4 14 2-7h7" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-bold tracking-tight text-slate-100">
                  Sensor Monitor
                </h1>
                {connectionStatus === "connected" && <LiveBadge />}
              </div>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500">
                Real-time data feed
                <span className="mx-2 text-slate-700">|</span>
                <span className="text-cyan-400/80">Binance WebSocket</span>
              </p>
            </div>
          </div>

          <ConnectionBadge status={connectionStatus} />
        </div>

        {/* Subtle scan line under header */}
        <div className="scan-underline mt-5 h-px w-full" />
      </header>

      {/* ── Summary strip ── */}
      <div className="mb-5">
        <SummaryBar counts={counts} lastEvent={lastEvent} />
      </div>

      {/* ── Filters ── */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <StatusFilterBar
          current={filter}
          onChange={setFilter}
          counts={counts}
        />
        <span className="font-mono-data text-[10px] uppercase tracking-widest text-slate-500">
          {allSensors.length} sensors tracked
        </span>
      </div>

      {/* ── Table ── */}
      {isLoading && <SensorTableSkeleton />}
      {isError && (
        <div className="surface rounded-xl border-red-500/30 py-16 text-center">
          <p className="font-mono-data text-xs uppercase tracking-widest text-red-400">
            Feed error &mdash; failed to fetch initial state
          </p>
        </div>
      )}
      {!isLoading && !isError && (
        <SensorTable
          sensors={sensors}
          recentlyUpdatedIds={recentlyUpdatedIds}
        />
      )}

      {/* ── Footer hint ── */}
      <p className="mt-6 text-center font-mono-data text-[10px] uppercase tracking-widest text-slate-600">
        Ops Console &middot; v0.1
      </p>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-red-300 shadow-[0_0_12px_-2px_rgba(239,68,68,0.5)]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="ping-slow absolute inset-0 rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
      </span>
      Live
    </span>
  );
}

export default App;
