import type { FC } from "react";

interface Segment {
  from: number;
  color: string;
  label?: string;
}

interface GaugeCardProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  name?: string;
  segments?: Segment[];
}

const DEFAULT_SEGMENTS: Segment[] = [
  { from: 0, color: "#3b82f6", label: "Cold" },
  { from: 18, color: "#22c55e", label: "Comfort" },
  { from: 26, color: "#f97316", label: "Warm" },
  { from: 32, color: "#ef4444", label: "Hot" },
];

const CX = 100;
const CY = 100;
const R = 80;
const START_ANGLE = 180; // left
const SWEEP = 180; // half circle

function polarToXY(angleDeg: number, radius: number = R) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function describeArc(startAngle: number, endAngle: number, radius: number = R) {
  const start = polarToXY(startAngle, radius);
  const end = polarToXY(endAngle, radius);
  const sweep = endAngle - startAngle;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function valueToAngle(value: number, min: number, max: number) {
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return START_ANGLE + frac * SWEEP;
}

function getSegmentColor(value: number, segments: Segment[]): string {
  let color = segments[0]?.color ?? "#6b7280";
  for (const seg of segments) {
    if (value >= seg.from) color = seg.color;
  }
  return color;
}

const GaugeCard: FC<GaugeCardProps> = ({
  value,
  min = 0,
  max = 40,
  unit = "°C",
  name,
  segments = DEFAULT_SEGMENTS,
}) => {
  const needleAngle = valueToAngle(value, min, max);
  const needleEnd = polarToXY(needleAngle, R - 10);
  const activeColor = getSegmentColor(value, segments);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        <defs>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Segment arcs */}
        {segments.map((seg, i) => {
          const nextFrom = segments[i + 1]?.from ?? max;
          const startA = valueToAngle(seg.from, min, max);
          const endA = valueToAngle(nextFrom, min, max);
          if (endA <= startA) return null;
          return (
            <path
              key={i}
              d={describeArc(startA, endA)}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeLinecap="butt"
              opacity={value >= seg.from ? 0.9 : 0.25}
            />
          );
        })}

        {/* Needle */}
        <line
          x1={CX}
          y1={CY}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={activeColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          style={{
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={5} fill={activeColor} />

        {/* Min / Max labels */}
        <text
          x={CX - R - 2}
          y={CY + 16}
          textAnchor="middle"
          fontSize="10"
          className="fill-gray-400 dark:fill-gray-500"
        >
          {min}
        </text>
        <text
          x={CX + R + 2}
          y={CY + 16}
          textAnchor="middle"
          fontSize="10"
          className="fill-gray-400 dark:fill-gray-500"
        >
          {max}
        </text>
      </svg>

      {/* Value + name */}
      <div className="flex flex-col items-center -mt-4">
        <div className="flex items-baseline gap-0.5">
          <span
            className="text-3xl font-light tabular-nums"
            style={{ color: activeColor }}
          >
            {value}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">{unit}</span>
        </div>
        {name && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{name}</p>
        )}
      </div>
    </div>
  );
};

export default GaugeCard;
