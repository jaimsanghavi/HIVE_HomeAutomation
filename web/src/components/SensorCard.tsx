import type { FC } from "react";

interface SensorCardProps {
  name: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
  isActive: boolean;
  history?: number[];
}

/** Render a simple SVG sparkline from a data array. */
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 200;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  // Area fill points (close path at bottom)
  const areaPoints = `0,${height} ${points} ${w},${height}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkFill)" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Simulated 24h sensor data for display
function generateFakeHistory(isActive: boolean): number[] {
  const pts: number[] = [];
  let v = isActive ? 1 : 0;
  for (let i = 0; i < 24; i++) {
    v = isActive
      ? Math.min(1, Math.max(0, v + (Math.random() - 0.45) * 0.3))
      : Math.min(0.3, Math.max(0, v + (Math.random() - 0.5) * 0.1));
    pts.push(v);
  }
  return pts;
}

const SensorCard: FC<SensorCardProps> = ({
  name,
  value,
  unit,
  icon,
  isActive,
  history,
}) => {
  const data = history ?? generateFakeHistory(isActive);
  const color = isActive ? "#10b981" : "#6b7280";

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Status dot */}
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full transition-colors ${
              isActive ? "bg-emerald-500" : "bg-gray-400 dark:bg-gray-600"
            }`}
          />
          {isActive && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
            {name}
          </p>
        </div>
        {icon}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-light text-gray-900 dark:text-gray-50 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        )}
      </div>

      {/* Sparkline */}
      <div className="mt-1">
        <Sparkline data={data} color={color} />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">24h ago</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Now</span>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
