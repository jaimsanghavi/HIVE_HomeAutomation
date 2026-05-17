import { useState, type FC } from "react";
import type { Device } from "../types";
import { t } from "../i18n";
import Icon, { type IconName } from "./Icon";

interface DeviceTileProps {
  device: Device;
  onToggle: (id: string, power: "on" | "off") => void;
  onBrightness?: (id: string, value: number) => void;
  onClick: (id: string) => void;
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

const DeviceTile: FC<DeviceTileProps> = ({
  device,
  onToggle,
  onBrightness,
  onClick,
}) => {
  const isOn = device.power === "on";
  const isSensor = device.type === "sensor";
  const isLight = device.type === "light";
  const isThermostat = device.type === "thermostat";
  const [dragging, setDragging] = useState(false);

  // State-based tile background
  const tileBg = isOn
    ? isLight
      ? "bg-amber-50 dark:bg-amber-950/40"
      : isThermostat
        ? "bg-sky-50 dark:bg-sky-950/40"
        : isSensor
          ? "bg-emerald-50 dark:bg-emerald-950/40"
          : "bg-md-primary-container"
    : "bg-md-surface-container-high";

  // State-based icon background
  const iconBg = isOn
    ? isLight
      ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
      : isThermostat
        ? "bg-sky-400/20 text-sky-600 dark:text-sky-400"
        : isSensor
          ? "bg-emerald-400/20 text-emerald-600 dark:text-emerald-400"
          : "bg-md-primary/20 text-md-primary"
    : "bg-md-surface-variant text-md-on-surface-variant";

  // Active glow for dark mode
  const glowClass = isOn
    ? isLight
      ? "shadow-[0_0_20px_rgba(251,191,36,0.15)] dark:shadow-[0_0_24px_rgba(251,191,36,0.25)]"
      : isThermostat
        ? "shadow-[0_0_20px_rgba(56,189,248,0.1)] dark:shadow-[0_0_24px_rgba(56,189,248,0.2)]"
        : ""
    : "";

  function handleTileClick(e: React.MouseEvent) {
    if (dragging) return;
    // If sensor, go to detail; otherwise toggle
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
          <Icon name="ChevronRight" size={16} className="text-md-on-surface-variant" />
        </button>
      </div>

      {/* Bottom: Name + state */}
      <div className="mt-auto">
        <p className="text-sm font-medium text-md-on-surface truncate leading-tight">
          {device.name}
        </p>
        <p className="text-xs text-md-on-surface-variant mt-0.5">
          {isSensor
            ? isOn
              ? t("device.motionDetected")
              : t("device.noMotion")
            : isThermostat && device.temperature != null
              ? `${device.temperature}°C`
              : isLight && isOn && device.brightness != null
                ? `${device.brightness}%`
                : isOn
                  ? t("device.on")
                  : t("device.off")}
        </p>

        {/* Inline brightness bar for lights */}
        {isLight && isOn && device.brightness != null && (
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

        {/* Thermostat target temp */}
        {isThermostat && isOn && device.target_temperature != null && (
          <p className="text-[10px] text-md-on-surface-variant mt-1">
            Target: {device.target_temperature}°C
          </p>
        )}
      </div>
    </div>
  );
};

export default DeviceTile;
