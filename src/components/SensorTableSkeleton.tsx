const ROWS = 10;

// Varied widths so the skeleton doesn't look like a repeating pattern
const NAME_WIDTHS = [72, 88, 64, 96, 80, 72, 84, 68, 92, 76];
const VALUE_WIDTHS = [64, 72, 56, 68, 60, 76, 64, 70, 58, 66];

export function SensorTableSkeleton() {
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
              <th className="px-3 py-3 text-right">Trend</th>
              <th className="px-3 py-3 pr-5 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, i) => (
              <tr key={i} className="border-b border-slate-800/60">
                {/* Name */}
                <td className="py-3 pr-3 pl-5">
                  <div
                    className="skeleton h-3.5"
                    style={{ width: NAME_WIDTHS[i % NAME_WIDTHS.length] }}
                  />
                </td>

                {/* State: dot + short label */}
                <td className="px-3 py-3">
                  <div className="inline-flex items-center gap-2">
                    <div className="skeleton h-2 w-2 rounded-full" />
                    <div className="skeleton h-3 w-12" />
                  </div>
                </td>

                {/* Value (right) */}
                <td className="px-3 py-3">
                  <div className="flex justify-end">
                    <div
                      className="skeleton h-3.5"
                      style={{
                        width: VALUE_WIDTHS[i % VALUE_WIDTHS.length],
                      }}
                    />
                  </div>
                </td>

                {/* Delta (right) */}
                <td className="px-3 py-3">
                  <div className="flex justify-end">
                    <div className="skeleton h-3 w-14" />
                  </div>
                </td>

                {/* Trend (right) — same size as real Sparkline (110x32) */}
                <td className="px-3 py-3">
                  <div className="flex justify-end">
                    <div
                      className="skeleton"
                      style={{ width: 110, height: 32 }}
                    />
                  </div>
                </td>

                {/* Updated (right) */}
                <td className="px-3 py-3 pr-5">
                  <div className="flex justify-end">
                    <div className="skeleton h-3 w-8" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
