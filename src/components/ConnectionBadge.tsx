import type { ConnectionStatus } from "../hooks/useSensors";

const STATUS_CONFIG: Record<
  ConnectionStatus,
  {
    label: string;
    sub: string;
    dot: string;
    border: string;
    bg: string;
    glow: string;
    labelText: string;
    pulse: boolean;
  }
> = {
  connecting: {
    label: "Connecting",
    sub: "establishing feed",
    dot: "bg-amber-400",
    border: "border-amber-400/30",
    bg: "bg-amber-400/5",
    glow: "shadow-[0_0_16px_-4px_rgba(251,191,36,0.45)]",
    labelText: "text-amber-200",
    pulse: true,
  },
  connected: {
    label: "Data feed active",
    sub: "stream connected",
    dot: "bg-emerald-400",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/5",
    glow: "shadow-[0_0_18px_-4px_rgba(52,211,153,0.5)]",
    labelText: "text-emerald-200",
    pulse: true,
  },
  disconnected: {
    label: "Feed disconnected",
    sub: "reconnecting\u2026",
    dot: "bg-red-500",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    glow: "shadow-[0_0_16px_-4px_rgba(239,68,68,0.5)]",
    labelText: "text-red-200",
    pulse: false,
  },
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-lg border px-3.5 py-2 backdrop-blur ${cfg.border} ${cfg.bg} ${cfg.glow}`}
    >
      {/* Dot with sonar ping */}
      <span className="relative flex h-2.5 w-2.5">
        {cfg.pulse && (
          <span
            className={`ping-slow absolute inset-0 rounded-full ${cfg.dot} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${cfg.dot}`}
        />
      </span>
      <div className="flex flex-col leading-tight">
        <span className={`text-[11px] font-semibold ${cfg.labelText}`}>
          {cfg.label}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          {cfg.sub}
        </span>
      </div>
    </div>
  );
}
