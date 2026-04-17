import type { SensorStatus } from "../types/sensor";
import type { StatusFilter } from "../hooks/useSensors";

const OPTIONS: { value: StatusFilter; label: string; accent: string }[] = [
  { value: "all", label: "All", accent: "bg-slate-700 text-slate-100" },
  {
    value: "active",
    label: "Active",
    accent: "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40",
  },
  {
    value: "warning",
    label: "Warn",
    accent: "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40",
  },
  {
    value: "critical",
    label: "Crit",
    accent: "bg-red-500/20 text-red-200 ring-1 ring-red-500/40",
  },
  {
    value: "offline",
    label: "Offline",
    accent: "bg-slate-500/20 text-slate-200 ring-1 ring-slate-500/40",
  },
];

interface Props {
  current: StatusFilter;
  onChange: (f: StatusFilter) => void;
  counts: Record<SensorStatus | "all", number>;
}

export function StatusFilterBar({ current, onChange, counts }: Props) {
  return (
    <div className="surface-inset inline-flex rounded-xl p-1">
      {OPTIONS.map(({ value, label, accent }) => {
        const active = current === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={[
              "rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-150",
              active
                ? accent + " shadow-sm"
                : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/40",
            ].join(" ")}
          >
            {label}
            <span
              className={`ml-1.5 font-mono-data text-[10px] ${
                active ? "opacity-80" : "text-slate-600"
              }`}
            >
              {counts[value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
