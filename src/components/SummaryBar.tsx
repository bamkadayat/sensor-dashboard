import type { SensorStatus } from "../types/sensor";

interface Props {
  counts: Record<SensorStatus | "all", number>;
  lastEvent: string | null; // ISO timestamp of most recent WebSocket update
}

const METRICS: {
  key: SensorStatus;
  label: string;
  dot: string;
  text: string;
  ring: string;
}[] = [
  {
    key: "active",
    label: "Active",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    ring: "hover:border-emerald-500/40",
  },
  {
    key: "warning",
    label: "Warning",
    dot: "bg-amber-400",
    text: "text-amber-300",
    ring: "hover:border-amber-500/40",
  },
  {
    key: "critical",
    label: "Critical",
    dot: "bg-red-500",
    text: "text-red-300",
    ring: "hover:border-red-500/40",
  },
  {
    key: "offline",
    label: "Offline",
    dot: "bg-slate-500",
    text: "text-slate-300",
    ring: "hover:border-slate-500/60",
  },
];

export function SummaryBar({ counts, lastEvent }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
      {METRICS.map(({ key, label, dot, text, ring }) => (
        <div
          key={key}
          className={`metric-card surface flex items-center gap-3 rounded-xl px-4 py-3 ${ring}`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`absolute inset-0 rounded-full ${dot} opacity-40 blur-[3px]`}
            />
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`}
            />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              {label}
            </span>
            <span
              className={`font-mono-data text-2xl font-bold leading-none ${text}`}
            >
              {counts[key].toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      ))}

      {/* Last stream event timestamp */}
      <div className="metric-card surface flex min-w-[180px] items-center justify-between gap-3 rounded-xl px-4 py-3 lg:flex-col lg:items-start lg:justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          Last event
        </span>
        <span className="font-mono-data text-sm font-semibold text-cyan-300">
          {lastEvent ? new Date(lastEvent).toLocaleTimeString() : "—"}
        </span>
      </div>
    </div>
  );
}
