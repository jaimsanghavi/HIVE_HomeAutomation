import type { FC } from "react";
import type { Device } from "../api/client";
import { t } from "../i18n";
import Card from "./Card";
import Icon, { type IconName } from "./Icon";
import Toggle from "./Toggle";

interface DeviceCardProps {
  device: Device;
  onToggle: (id: string, power: "on" | "off") => void;
  onClick: (id: string) => void;
  hideRoomName?: boolean;
}

function deviceIcon(type: Device["type"]): IconName {
  switch (type) {
    case "light": return "Lightbulb";
    case "thermostat": return "Thermometer";
    case "sensor": return "Motion";
    default: return "Power";
  }
}

const DeviceCard: FC<DeviceCardProps> = ({ device, onToggle, onClick, hideRoomName = false }) => {
  const isOn = device.power === "on";

  return (
    <Card
      variant="filled"
      onClick={() => onClick(device.id)}
      className={`${isOn ? "ring-1 ring-md-primary/30" : ""}`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isOn ? "bg-md-primary-container text-md-on-primary-container" : "bg-md-surface-variant text-md-on-surface-variant"
        }`}>
          <Icon name={deviceIcon(device.type)} size={20} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-md-on-surface truncate">{device.name}</p>
          {!hideRoomName && device.room_name && (
            <p className="text-xs text-md-on-surface-variant truncate">{device.room_name}</p>
          )}
          {/* Extra info */}
          {device.type === "light" && device.brightness != null && isOn && (
            <div className="flex items-center gap-1 mt-1">
              <div className="h-1 flex-1 max-w-[60px] rounded-full bg-md-surface-variant">
                <div className="h-full rounded-full bg-md-primary" style={{ width: `${device.brightness}%` }} />
              </div>
              <span className="text-[10px] text-md-on-surface-variant">{device.brightness}%</span>
            </div>
          )}
          {device.type === "thermostat" && device.temperature != null && (
            <p className="text-xs text-md-on-surface-variant mt-0.5">
              {device.temperature}°C
            </p>
          )}
          {device.type === "sensor" && (
            <p className={`text-xs mt-0.5 ${isOn ? "text-md-primary" : "text-md-on-surface-variant"}`}>
              {isOn ? t("device.motionDetected") : t("device.noMotion")}
            </p>
          )}
        </div>

        {/* Toggle (not for sensors) */}
        {device.type !== "sensor" && (
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <Toggle
              checked={isOn}
              onChange={(checked) => onToggle(device.id, checked ? "on" : "off")}
              size="sm"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default DeviceCard;
