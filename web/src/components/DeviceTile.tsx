import { useCallback, useRef, useState, type FC } from "react";
import type { Device } from "../types";
import { t } from "../i18n";
import Icon, { type IconName } from "./Icon";

interface DeviceTileProps {
  device: Device;
  onToggle: (id: string, power: "on" | "off") => void;
  onBrightness?: (id: string, value: number) => void;
  onTargetTemp?: (id: string, value: number) => void;
  onClick: (id: string) => void;
  onLongPress?: (id: string) => void;
}

function deviceIcon(type: Device["type"]): IconName {
  switch (type) {
    case "light":
      return "Lightbulb";
    case "thermostat":
      return "Thermometer";
    case "sensor":
      return "Motion";
    default:
      return "Power";
  }
}

/** Mini 270° arc for thermostat tiles */
function MiniArc({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = 16;
  const cx = 20;
  const cy = 20;
  const startAngle = 135;
  const sweep = 270 * frac;
  const endAngle = startAngle + sweep;
  const rad1 = (startAngle * Math.PI) / 180;
  const rad2 = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad1);
  const y1 = cy + r * Math.sin(rad1);
  const x2 = cx + r * Math.cos(rad2);
  const y2 = cy + r * Math.sin(rad2);
  const largeArc = sweep > 180 ? 1 : 0;

  // Track arc (full 270°)
  const tEnd = startAngle + 270;
  const tRad = (tEnd * Math.PI) / 180;
  const tx = cx + r * Math.cos(tRad);
  const ty = cy + r * Math.sin(tRad);

  return (
    <svg width={40} height={40} viewBox="0 0 40 40" className="shrink-0">
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${tx} ${ty}`}
        fill="none"
        stroke="currentColor"
        className="text-gray-200 dark:text-gray-700"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {sweep > 0.5 && (
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9"
        fontWeight="600"
        fill={color}
      >
        {value}°
      </text>
    </svg>
  );
}

const DeviceTile: FC<DeviceTileProps> = ({
  device,
  onToggle,
  onBrightness,
  onTargetTemp,
  onClick,
  onLongPress,
}) => {
  const isOn = device.power === "on";
  const isSensor = device.type === "sensor";
  const isLight = device.type === "light";
  const isThermostat = device.type === "thermostat";
  const [dragging, setDragging] = useState(false);

  // Long-press detection
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const startLongPress = useCallback(() => {
    longPressTriggered.current = false;
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        onLongPress(device.id);
      }, 500);
    }
  }, [onLongPress, device.id]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // State-based tile background
  const tileBg = isOn
    ? isLight
      ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/30"
      : isThermostat
        ? "bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/30"
        : isSensor
          ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/30"
          : "bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/30"
    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800";

  // State-based icon background
  const iconBg = isOn
    ? isLight
      ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
      : isThermostat
        ? "bg-sky-400/20 text-sky-600 dark:text-sky-400"
        : isSensor
          ? "bg-emerald-400/20 text-emerald-600 dark:text-emerald-400"
          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500";

  // Active glow for dark mode
  const glowClass = isOn
    ? isLight
      ? "shadow-[0_0_20px_rgba(251,191,36,0.12)] dark:shadow-[0_0_24px_rgba(251,191,36,0.2)]"
      : isThermostat
        ? "shadow-[0_0_20px_rgba(56,189,248,0.08)] dark:shadow-[0_0_24px_rgba(56,189,248,0.15)]"
        : ""
    : "shadow-sm";

  function handleTileClick(e: React.MouseEvent) {
    if (dragging || longPressTriggered.current) return;
    if (isSensor) {
      onClick(device.id);
    } else {
      onToggle(device.id, isOn ? "off" : "on");
    }
  }

  function handleDetailClick(e: React.MouseEvent) {
    e.stopPropagation();
    onClick(device.id);
  }

  function handleBrightnessChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    onBrightness?.(device.id, val);
  }

  return (
    <div
      onClick={handleTileClick}
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (isSensor) onClick(device.id);
          else onToggle(device.id, isOn ? "off" : "on");
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${device.name} ${isOn ? t("device.on") : t("device.off")}`}
      className={`
        relative flex flex-col justify-between
        min-h-[120px] p-3.5 rounded-2xl
        cursor-pointer select-none
        transition-all duration-300 ease-out
        ${tileBg} ${glowClass}
        hover:scale-[1.02] active:scale-[0.98]
      `}
    >
      {/* Top row: Icon + detail arrow */}
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${iconBg}`}
        >
          <Icon
            name={deviceIcon(device.type)}
            size={20}
            className={isOn && isSensor ? "animate-pulse-slow" : ""}
          />
        </div>

        {/* Detail chevron */}
        <button
          onClick={handleDetailClick}
          className="w-8 h-8 rounded-full flex items-center justify-center
            hover:bg-black/5 dark:hover:bg-white/10 transition-colors
            min-w-[44px] min-h-[44px] -mr-2 -mt-2"
          aria-label={`${device.name} details`}
        >
          <Icon name="ChevronRight" size={16} className="text-gray-400 dark:text-gray-500" />
        </button>
      </div>

      {/* Bottom: Name + state */}
      <div className="mt-auto">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate leading-tight">
          {device.name}
        </p>

        {/* Light: brightness bar + percentage */}
        {isLight && (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">
              {isOn && device.brightness != null ? `${device.brightness}%` : isOn ? t("device.on") : t("device.off")}
            </p>
            {isOn && device.brightness != null && (
              <div
                className="mt-2 relative h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-amber-400 dark:bg-amber-500 transition-[width] duration-150"
                  style={{ width: `${device.brightness}%` }}
                />
                {onBrightness && (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={device.brightness}
                    onChange={handleBrightnessChange}
                    onPointerDown={() => setDragging(true)}
                    onPointerUp={() => setTimeout(() => setDragging(false), 50)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                    aria-label={`${device.name} brightness`}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Thermostat: mini arc gauge + inline +/- */}
        {isThermostat && (
          <div className="flex items-center justify-between mt-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {isOn && device.temperature != null
                  ? `${device.temperature}°C`
                  : isOn ? t("device.on") : t("device.off")}
              </p>
              {isOn && device.target_temperature != null && (
                <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTargetTemp?.(device.id, Math.max(15, (device.target_temperature ?? 22) - 1));
                    }}
                    className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400
                      flex items-center justify-center text-xs font-bold hover:bg-sky-200 dark:hover:bg-sky-800/60
                      transition-colors min-w-[24px]"
                    aria-label="Decrease target temperature"
                  >
                    −
                  </button>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium tabular-nums">
                    {device.target_temperature}°
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTargetTemp?.(device.id, Math.min(35, (device.target_temperature ?? 22) + 1));
                    }}
                    className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400
                      flex items-center justify-center text-xs font-bold hover:bg-sky-200 dark:hover:bg-sky-800/60
                      transition-colors min-w-[24px]"
                    aria-label="Increase target temperature"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            {isOn && device.target_temperature != null && (
              <MiniArc value={device.target_temperature} min={15} max={35} color="#38bdf8" />
            )}
          </div>
        )}

        {/* Sensor: status */}
        {isSensor && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOn ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isOn ? t("device.motionDetected") : t("device.noMotion")}
            </p>
          </div>
        )}

        {/* Switch: simple on/off */}
        {device.type === "switch" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isOn ? t("device.on") : t("device.off")}
          </p>
        )}
      </div>
    </div>
  );
};

export default DeviceTile;
