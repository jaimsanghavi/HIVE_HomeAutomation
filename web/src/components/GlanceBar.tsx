import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import type { Device } from "../types";

interface GlanceBarProps {
  devices: Device[];
}

function deviceIcon(d: Device): "Lightbulb" | "Thermometer" | "Motion" | "Power" {
  switch (d.type) {
    case "light": return "Lightbulb";
    case "thermostat": return "Thermometer";
    case "sensor": return "Motion";
    default: return "Power";
  }
}

function deviceState(d: Device): string {
  switch (d.type) {
    case "light":
      if (d.power !== "on") return "Off";
      return d.brightness != null ? `${d.brightness}%` : "On";
    case "thermostat":
      return d.temperature != null ? `${d.temperature}°` : "—";
    case "sensor":
      if (d.device_class === "motion") return d.power === "on" ? "Motion" : "Clear";
      if (d.device_class === "door") return d.power === "on" ? "Open" : "Closed";
      return d.power === "on" ? "Active" : "Inactive";
    default:
      return d.power === "on" ? "On" : "Off";
  }
}

function isActive(d: Device): boolean {
  if (d.type === "sensor") return d.power === "on";
  return d.power === "on";
}

const ACTIVE_COLORS: Record<string, string> = {
  light: "text-amber-400",
  thermostat: "text-orange-400",
  sensor: "text-sky-400",
  switch: "text-green-400",
};

const GlanceBar: FC<GlanceBarProps> = ({ devices }) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
      {devices.map((d) => {
        const active = isActive(d);
        const colorClass = active ? ACTIVE_COLORS[d.type] ?? "text-md-primary" : "text-gray-400 dark:text-gray-600";

        return (
          <button
            key={d.id}
            onClick={() => navigate(`/devices/${d.id}`)}
            className={`
              flex flex-col items-center gap-0.5 min-w-[56px] px-2 py-2 rounded-xl
              transition-colors duration-150
              hover:bg-white/10 active:scale-95
              ${active ? "bg-white/5" : ""}
            `}
          >
            <Icon name={deviceIcon(d)} size={18} className={colorClass} />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[52px] leading-tight">
              {d.name.replace(/^(Office |Living |Bedroom |Kitchen |Bathroom )/, "")}
            </span>
            <span className={`text-[11px] font-medium tabular-nums ${colorClass}`}>
              {deviceState(d)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default GlanceBar;
