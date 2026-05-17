import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import type { Device } from "../types";
import Icon, { type IconName } from "./Icon";
import Toggle from "./Toggle";

interface EntitiesListProps {
  devices: Device[];
  title?: string;
  onToggle: (id: string, power: "on" | "off") => void;
  onBrightness?: (id: string, value: number) => void;
  onTargetTemp?: (id: string, value: number) => void;
}

function deviceIcon(type: Device["type"]): IconName {
  switch (type) {
    case "light": return "Lightbulb";
    case "thermostat": return "Thermometer";
    case "sensor": return "Motion";
    default: return "Power";
  }
}

function stateText(d: Device): string {
  switch (d.type) {
    case "light":
      return d.power === "on"
        ? d.brightness != null ? `${d.brightness}%` : "On"
        : "Off";
    case "thermostat":
      return d.temperature != null ? `${d.temperature}°C` : d.power === "on" ? "On" : "Off";
    case "sensor":
      if (d.device_class === "motion") return d.power === "on" ? "Motion" : "Clear";
      if (d.device_class === "door") return d.power === "on" ? "Open" : "Closed";
      return d.power === "on" ? "Active" : "Inactive";
    default:
      return d.power === "on" ? "On" : "Off";
  }
}

const EntitiesList: FC<EntitiesListProps> = ({
  devices,
  title,
  onToggle,
  onBrightness,
  onTargetTemp,
}) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </h4>
        </div>
      )}

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {devices.map((d) => {
          const isOn = d.power === "on";
          const iconColor = isOn
            ? d.type === "light" ? "text-amber-500" : d.type === "thermostat" ? "text-sky-500" : d.type === "sensor" ? "text-emerald-500" : "text-md-primary"
            : "text-gray-400 dark:text-gray-500";

          return (
            <div
              key={d.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {/* Icon */}
              <div className={`shrink-0 ${iconColor}`}>
                <Icon name={deviceIcon(d.type)} size={20} />
              </div>

              {/* Name + state — tap to navigate */}
              <button
                onClick={() => navigate(`/devices/${d.id}`)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                  {d.name}
                </p>
                <p className={`text-xs mt-0.5 tabular-nums ${isOn ? iconColor : "text-gray-400 dark:text-gray-500"}`}>
                  {stateText(d)}
                </p>
              </button>

              {/* Inline control */}
              {d.type === "light" && isOn && d.brightness != null && onBrightness ? (
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={d.brightness}
                    onChange={(e) => onBrightness(d.id, Number(e.target.value))}
                    className="w-20 h-1 accent-amber-500 cursor-pointer"
                    aria-label={`${d.name} brightness`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right tabular-nums">
                    {d.brightness}%
                  </span>
                </div>
              ) : d.type === "thermostat" && isOn && d.target_temperature != null && onTargetTemp ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onTargetTemp(d.id, Math.max(15, (d.target_temperature ?? 22) - 1))}
                    className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400
                      flex items-center justify-center text-xs font-bold"
                    aria-label="Decrease temperature"
                  >
                    −
                  </button>
                  <span className="text-xs font-medium text-sky-600 dark:text-sky-400 w-7 text-center tabular-nums">
                    {d.target_temperature}°
                  </span>
                  <button
                    onClick={() => onTargetTemp(d.id, Math.min(35, (d.target_temperature ?? 22) + 1))}
                    className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400
                      flex items-center justify-center text-xs font-bold"
                    aria-label="Increase temperature"
                  >
                    +
                  </button>
                </div>
              ) : d.type !== "sensor" ? (
                <Toggle checked={isOn} onChange={(v) => onToggle(d.id, v ? "on" : "off")} size="sm" />
              ) : (
                <div className={`w-2 h-2 rounded-full shrink-0 ${isOn ? "bg-emerald-500 animate-pulse" : "bg-gray-300 dark:bg-gray-600"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntitiesList;
