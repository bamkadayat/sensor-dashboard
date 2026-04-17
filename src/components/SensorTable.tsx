import type { Sensor } from "../types/sensor";
import { SensorRow } from "./SensorRow";

interface Props {
  sensors: Sensor[];
  recentlyUpdatedIds: Set<number>;
}

export function SensorTable({ sensors, recentlyUpdatedIds }: Props) {
  if (sensors.length === 0) {
    return (
      <div className="surface rounded-xl py-14 text-center">
        <p className="font-mono-data text-xs uppercase tracking-widest text-slate-500">
          No sensors match the current filter
        </p>
      </div>
    );
  }

  return (
    <div className="surface overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/60 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              <th className="py-3 pr-3 pl-5">Sensor</th>
              <th className="px-3 py-3">State</th>
              <th className="px-3 py-3 text-right">Value</th>
              <th className="px-3 py-3 text-right">Delta</th>
              <th className="hidden px-3 py-3 text-right md:table-cell">
                Trend
              </th>
              <th className="px-3 py-3 pr-5 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((sensor) => (
              <SensorRow
                key={sensor.id}
                sensor={sensor}
                isHighlighted={recentlyUpdatedIds.has(sensor.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
