import { useCallback, useRef, useState, type FC } from "react";
import Icon from "./Icon";

interface ThermostatDialProps {
  currentTemp: number;
  targetTemp: number;
  mode: "heat" | "cool" | "auto" | "off";
  onTargetChange: (temp: number) => void;
  onModeChange?: (mode: "heat" | "cool" | "auto" | "off") => void;
  min?: number;
  max?: number;
}

const MODE_COLORS: Record<string, { arc: string; bg: string; glow: string }> = {
  heat: { arc: "#f97316", bg: "rgba(249,115,22,0.08)", glow: "rgba(249,115,22,0.2)" },
  cool: { arc: "#38bdf8", bg: "rgba(56,189,248,0.08)", glow: "rgba(56,189,248,0.2)" },
  auto: { arc: "#a78bfa", bg: "rgba(167,139,250,0.08)", glow: "rgba(167,139,250,0.2)" },
  off:  { arc: "#6b7280", bg: "transparent", glow: "transparent" },
};

const MODE_LABELS: Record<string, string> = {
  heat: "Heat",
  cool: "Cool",
  auto: "Auto",
  off:  "Off",
};

const MODES: { key: "off" | "heat" | "cool" | "auto"; icon: string; label: string }[] = [
  { key: "off",  icon: "Power",     label: "Off" },
  { key: "heat", icon: "Flame",     label: "Heat" },
  { key: "cool", icon: "Snowflake", label: "Cool" },
  { key: "auto", icon: "Settings",  label: "Auto" },
];

/* Arc geometry — 270° sweep starting from 135° */
const CX = 120;
const CY = 120;
const R = 96;
const START_ANGLE = 135;
const SWEEP = 270;

function polarToXY(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToXY(startAngle);
  const end = polarToXY(endAngle);
  const sweep = endAngle - startAngle;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function tempToAngle(temp: number, min: number, max: number) {
  const fraction = Math.max(0, Math.min(1, (temp - min) / (max - min)));
  return START_ANGLE + fraction * SWEEP;
}

const ThermostatDial: FC<ThermostatDialProps> = ({
  currentTemp,
  targetTemp,
  mode,
  onTargetChange,
  onModeChange,
  min = 15,
  max = 35,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const colors = MODE_COLORS[mode] || MODE_COLORS.off;
  const isOff = mode === "off";

  const targetAngle = tempToAngle(targetTemp, min, max);
  const currentAngle = tempToAngle(currentTemp, min, max);
  const thumbPos = polarToXY(targetAngle);
  const currentPos = polarToXY(currentAngle);

  /* Drag handler — converts pointer position to temperature */
  const handlePointerEvent = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 240 / rect.width;
      const scaleY = 240 / rect.height;
      const px = (e.clientX - rect.left) * scaleX - CX;
      const py = (e.clientY - rect.top) * scaleY - CY;
      let angle = (Math.atan2(py, px) * 180) / Math.PI;
      if (angle < 0) angle += 360;

      // Map angle to temperature
      let relAngle = angle - START_ANGLE;
      if (relAngle < 0) relAngle += 360;
      if (relAngle > SWEEP + 20) return; // outside arc range

      const fraction = Math.max(0, Math.min(1, relAngle / SWEEP));
      const temp = Math.round(min + fraction * (max - min));
      onTargetChange(Math.max(min, Math.min(max, temp)));
    },
    [min, max, onTargetChange],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOff) return;
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    handlePointerEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    handlePointerEvent(e);
  };

  const handlePointerUp = () => setDragging(false);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Dial */}
      <div
        className="relative select-none touch-none"
        style={{ width: "100%", maxWidth: 280 }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 240 240"
          className="w-full h-auto"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.arc} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors.arc} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background arc (track) */}
          <path
            d={describeArc(START_ANGLE, START_ANGLE + SWEEP)}
            fill="none"
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeWidth={8}
            strokeLinecap="round"
          />

          {/* Active arc (filled portion) */}
          {!isOff && targetAngle > START_ANGLE && (
            <path
              d={describeArc(START_ANGLE, targetAngle)}
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth={8}
              strokeLinecap="round"
              filter="url(#glow)"
            />
          )}

          {/* Current temperature marker (small dot) */}
          {!isOff && (
            <circle
              cx={currentPos.x}
              cy={currentPos.y}
              r={4}
              fill={colors.arc}
              opacity={0.7}
            />
          )}

          {/* Target temperature thumb (draggable) */}
          {!isOff && (
            <circle
              cx={thumbPos.x}
              cy={thumbPos.y}
              r={12}
              fill="white"
              stroke={colors.arc}
              strokeWidth={3}
              className="cursor-grab active:cursor-grabbing"
              filter="url(#glow)"
              style={{ transition: dragging ? "none" : "all 0.3s ease" }}
            />
          )}

          {/* Center content */}
          {/* Mode label */}
          <text
            x={CX}
            y={CY - 28}
            textAnchor="middle"
            className="fill-current text-gray-500 dark:text-gray-400"
            fontSize="13"
            fontWeight="500"
          >
            {MODE_LABELS[mode]}
          </text>

          {/* Target temperature (large) */}
          <text
            x={CX}
            y={CY + 10}
            textAnchor="middle"
            className="fill-current text-gray-900 dark:text-gray-50"
            fontSize="48"
            fontWeight="300"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {isOff ? "—" : targetTemp}
          </text>

          {/* Degree symbol */}
          {!isOff && (
            <text
              x={CX + 34}
              y={CY - 8}
              textAnchor="start"
              className="fill-current text-gray-400 dark:text-gray-500"
              fontSize="18"
              fontWeight="300"
            >
              °C
            </text>
          )}

          {/* Current temperature (small, below) */}
          <g transform={`translate(${CX}, ${CY + 36})`}>
            <text
              x={0}
              y={0}
              textAnchor="middle"
              className="fill-current text-gray-400 dark:text-gray-500"
              fontSize="13"
            >
              🌡 {currentTemp}°C
            </text>
          </g>
        </svg>
      </div>

      {/* +/- Buttons */}
      {!isOff && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTargetChange(Math.max(min, targetTemp - 1))}
            className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center
              text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
              active:scale-95 min-w-[48px] min-h-[48px]"
            aria-label="Decrease temperature"
          >
            <Icon name="Minus" size={20} />
          </button>
          <button
            onClick={() => onTargetChange(Math.min(max, targetTemp + 1))}
            className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center
              text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
              active:scale-95 min-w-[48px] min-h-[48px]"
            aria-label="Increase temperature"
          >
            <Icon name="Plus" size={20} />
          </button>
        </div>
      )}

      {/* HVAC Mode selector */}
      {onModeChange && (
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800">
          {MODES.map((m) => {
            const active = mode === m.key;
            const modeColor = MODE_COLORS[m.key];
            return (
              <button
                key={m.key}
                onClick={() => onModeChange(m.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 min-h-[44px] min-w-[44px]
                  ${
                    active
                      ? "text-white shadow-md"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                style={active ? { backgroundColor: modeColor.arc } : {}}
                aria-label={m.label}
                aria-pressed={active}
              >
                <Icon name={m.icon as any} size={18} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThermostatDial;
