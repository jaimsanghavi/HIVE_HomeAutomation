import type { FC } from "react";
import type { Room } from "../types";
import type { Device } from "../types";
import Icon, { type IconName } from "./Icon";

interface AreaCardProps {
  room: Room;
  devices: Device[];
  onClick: (roomId: string) => void;
}

function deviceTypeIcon(type: Device["type"]): IconName {
  switch (type) {
    case "light": return "Lightbulb";
    case "thermostat": return "Thermometer";
    case "sensor": return "Motion";
    default: return "Power";
  }
}

const GRADIENTS: Record<string, string> = {
  "Living Room": "from-amber-500/20 to-orange-500/10",
  "Bedroom": "from-indigo-500/20 to-purple-500/10",
  "Kitchen": "from-emerald-500/20 to-teal-500/10",
  "Office": "from-sky-500/20 to-blue-500/10",
  "Bathroom": "from-cyan-500/20 to-sky-500/10",
};
const DEFAULT_GRADIENT = "from-gray-500/15 to-gray-400/5";

const AreaCard: FC<AreaCardProps> = ({ room, devices, onClick }) => {
  const activeCount = devices.filter((d) => d.power === "on").length;
  const types = [...new Set(devices.map((d) => d.type))];
  const gradient = GRADIENTS[room.name] ?? DEFAULT_GRADIENT;

  // Quick stats
  const thermostat = devices.find((d) => d.type === "thermostat" && d.temperature != null);
  const activeLights = devices.filter((d) => d.type === "light" && d.power === "on");

  return (
    <button
      onClick={() => onClick(room.id)}
      className={`
        relative w-full text-left rounded-3xl p-5 overflow-hidden
        bg-gradient-to-br ${gradient}
        border border-white/20 dark:border-white/5
        backdrop-blur-sm
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
        group
      `}
    >
      {/* Active ring */}
      {activeCount > 0 && (
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20 dark:ring-white/10 pointer-events-none" />
      )}

      {/* Room name */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">
        {room.name}
      </h3>

      {/* Device count + active */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        {devices.length} {devices.length === 1 ? "device" : "devices"}
        {activeCount > 0 && (
          <span className="text-green-600 dark:text-green-400 font-medium"> · {activeCount} on</span>
        )}
      </p>

      {/* Quick stats */}
      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
        {thermostat?.temperature != null && (
          <span className="flex items-center gap-1 tabular-nums">
            <Icon name="Thermometer" size={12} className="text-sky-500" />
            {thermostat.temperature}°
          </span>
        )}
        {activeLights.length > 0 && (
          <span className="flex items-center gap-1">
            <Icon name="Lightbulb" size={12} className="text-amber-500" />
            {activeLights.length} on
          </span>
        )}
      </div>

      {/* Device type chips */}
      <div className="flex gap-1.5 flex-wrap">
        {types.map((type) => {
          const isActive = devices.some((d) => d.type === type && d.power === "on");
          return (
            <div
              key={type}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isActive
                  ? type === "light"
                    ? "bg-amber-400/30 text-amber-600 dark:text-amber-400"
                    : type === "thermostat"
                      ? "bg-sky-400/30 text-sky-600 dark:text-sky-400"
                      : type === "sensor"
                        ? "bg-emerald-400/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-gray-400/20 text-gray-600 dark:text-gray-400"
                  : "bg-white/20 dark:bg-white/5 text-gray-400 dark:text-gray-500"
              }`}
            >
              <Icon name={deviceTypeIcon(type)} size={14} />
            </div>
          );
        })}
      </div>

      {/* Arrow */}
      <div className="absolute top-5 right-5 text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 transition-transform">
        <Icon name="ChevronRight" size={18} />
      </div>
    </button>
  );
};

export default AreaCard;
