import { memo, useEffect, useState } from "react";
import type { Sensor, SensorStatus } from "../types/sensor";
import { Sparkline } from "./Sparkline";

// ── Severity indicator: dot + label (operator-style, not cartoonish badges) ──
const SEVERITY: Record<
  SensorStatus,
  { dot: string; text: string; label: string }
> = {
  active: {
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    label: "ACTIVE",
  },
  warning: {
    dot: "bg-amber-400",
    text: "text-amber-300",
    label: "WARN",
  },
  critical: {
    dot: "bg-red-500",
    text: "text-red-300",
    label: "CRIT",
  },
  offline: {
    dot: "bg-slate-500",
    text: "text-slate-400",
    label: "OFFLINE",
  },
};

type Direction = "up" | "down" | "flat";

function getDirection(change: number): Direction {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

function formatPrice(v: number): string {
  if (v >= 1)
    return v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  return v.toPrecision(4);
}

function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(3)}%`;
}

export const SensorRow = memo(function SensorRow({
  sensor,
  isHighlighted,
}: {
  sensor: Sensor;
  isHighlighted: boolean;
}) {
  const dir = getDirection(sensor.change);
  const sev = SEVERITY[sensor.status];

  return (
    <tr
      className="sensor-row border-b border-slate-800/60"
      data-severity={sensor.status}
    >
      {/* Name */}
      <td className="py-3 pr-3 pl-5">
        <span className="text-[13px] font-semibold text-slate-100">
          {sensor.name}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inset-0 rounded-full ${sev.dot} opacity-40 blur-[2px]`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${sev.dot}`}
            />
          </span>
          <span
            className={`text-[11px] font-bold tracking-[0.12em] ${sev.text}`}
          >
            {sev.label}
          </span>
        </span>
      </td>

      {/* Price — keyed on value so the "pop" CSS animation restarts on each change */}
      <td className="px-3 py-3 text-right">
        <span
          key={sensor.value}
          className={[
            "font-mono-data inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-300",
            dir === "up"
              ? "text-emerald-300"
              : dir === "down"
                ? "text-red-400"
                : "text-slate-200",
            isHighlighted ? "value-pop" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Arrow dir={dir} />
          {formatPrice(sensor.value)}
        </span>
      </td>

      {/* Change */}
      <td className="px-3 py-3 text-right">
        {dir === "flat" ? (
          <span className="font-mono-data text-[12px] text-slate-600">
            0.000%
          </span>
        ) : (
          <span
            className={`font-mono-data text-[12px] font-medium ${
              dir === "up" ? "text-emerald-300" : "text-red-400"
            }`}
          >
            {formatChange(sensor.change)}
          </span>
        )}
      </td>

      {/* Trend */}
      <td className="px-3 py-3 text-right">
        <div className="ml-auto inline-block">
          <Sparkline data={sensor.history} />
        </div>
      </td>

      {/* Updated */}
      <td className="px-3 py-3 pr-5 text-right">
        <span className="font-mono-data text-[11px] text-slate-500">
          <RelativeTime iso={sensor.lastUpdated} />
        </span>
      </td>
    </tr>
  );
});

function Arrow({ dir }: { dir: Direction }) {
  if (dir === "flat") return null;
  const up = dir === "up";
  return (
    <span
      className={`text-[9px] leading-none transition-transform duration-200 ${
        up ? "-translate-y-px text-emerald-400" : "translate-y-px text-red-400"
      }`}
    >
      {up ? "\u25B2" : "\u25BC"}
    </span>
  );
}

function RelativeTime({ iso }: { iso: string }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secs = Math.max(
    0,
    Math.floor((now - new Date(iso).getTime()) / 1000),
  );

  if (secs < 3)
    return <span className="font-semibold text-emerald-300">now</span>;
  if (secs < 60) return <span>{secs}s</span>;
  return <span>{Math.floor(secs / 60)}m</span>;
}
