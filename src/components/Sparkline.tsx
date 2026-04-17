import { memo, useId } from "react";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

type Trend = "up" | "down" | "flat";

const STROKE: Record<Trend, string> = {
  up: "#34d399",   // emerald-400
  down: "#f87171", // red-400
  flat: "#64748b", // slate-500
};

/**
 * Lightweight SVG sparkline: area under a stroked line, colored by overall trend.
 * - Uses preserveAspectRatio="none" so the viewBox stretches to the given width.
 * - Gradient fades the fill from 35% opacity at top to 0% at baseline.
 */
export const Sparkline = memo(function Sparkline({
  data,
  width = 110,
  height = 32,
  className = "",
}: Props) {
  const gradId = useId();

  if (data.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        className={className}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padY = 2;
  const usableH = height - padY * 2;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = padY + (1 - (v - min) / range) * usableH;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const [firstX] = points[0];
  const [lastX] = points[points.length - 1];
  const areaPath = `${linePath} L ${lastX.toFixed(2)} ${height} L ${firstX.toFixed(2)} ${height} Z`;

  const trend: Trend =
    data[data.length - 1] > data[0]
      ? "up"
      : data[data.length - 1] < data[0]
        ? "down"
        : "flat";
  const color = STROKE[trend];

  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Head marker — current value */}
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="1.75"
        fill={color}
      />
    </svg>
  );
});
