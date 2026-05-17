import type { FC } from "react";
import type { Room, Device } from "../api/client";
import Card from "./Card";
import Icon, { type IconName } from "./Icon";

interface RoomCardProps {
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

const RoomCard: FC<RoomCardProps> = ({ room, devices, onClick }) => {
  const activeCount = devices.filter((d) => d.power === "on").length;
  const typeIcons = [...new Set(devices.map((d) => d.type))];
  const hasActive = activeCount > 0;

  // Inline state summary
  const summaryParts: string[] = [];
  const activeLights = devices.filter((d) => d.type === "light" && d.power === "on");
  if (activeLights.length > 0) {
    const avgBrightness = activeLights
      .filter((d) => d.brightness != null)
      .reduce((sum, d) => sum + (d.brightness ?? 0), 0);
    if (avgBrightness > 0) {
      summaryParts.push(`Lights ${Math.round(avgBrightness / activeLights.length)}%`);
    }
  }
  const thermostat = devices.find((d) => d.type === "thermostat" && d.temperature != null);
  if (thermostat?.temperature != null) {
    summaryParts.push(`${thermostat.temperature}°C`);
  }

  return (
    <Card variant="filled" onClick={() => onClick(room.id)}
      className={hasActive ? "ring-1 ring-md-primary/20" : ""}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-md-on-surface">{room.name}</h3>
            <p className="text-xs text-md-on-surface-variant mt-0.5">
              {devices.length} {devices.length === 1 ? "device" : "devices"}
              {activeCount > 0 && (
                <span className="text-md-primary font-medium"> · {activeCount} on</span>
              )}
            </p>
            {summaryParts.length > 0 && (
              <p className="text-[10px] text-md-on-surface-variant mt-1">
                {summaryParts.join(" · ")}
              </p>
            )}
          </div>
          <Icon name="ChevronRight" size={20} className="text-md-on-surface-variant" />
        </div>
        {typeIcons.length > 0 && (
          <div className="flex gap-2">
            {typeIcons.map((type) => {
              const isTypeActive = devices.some((d) => d.type === type && d.power === "on");
              return (
                <div
                  key={type}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isTypeActive
                      ? type === "light"
                        ? "bg-amber-400/20 text-amber-600 dark:text-amber-400"
                        : type === "thermostat"
                          ? "bg-sky-400/20 text-sky-600 dark:text-sky-400"
                          : "bg-emerald-400/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-md-surface-variant text-md-on-surface-variant"
                  }`}
                >
                  <Icon name={deviceTypeIcon(type)} size={16} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoomCard;
