import { useEffect, useState, type FC } from "react";
import type { Device } from "../types";

interface StatusHeaderProps {
  devices: Device[];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(): string {
  return new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

const StatusHeader: FC<StatusHeaderProps> = ({ devices }) => {
  const [time, setTime] = useState(formatTime);

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  const activeLights = devices.filter((d) => d.type === "light" && d.power === "on");
  const thermostat = devices.find((d) => d.type === "thermostat");
  const activeSensors = devices.filter((d) => d.type === "sensor" && d.power === "on");
  const totalActive = devices.filter((d) => d.power === "on").length;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      {/* Left: Greeting + time */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-50">
          {getGreeting()}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {formatDate()} · {time}
        </p>
      </div>

      {/* Right: Status badges */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Lights badge */}
        {activeLights.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {activeLights.length} {activeLights.length === 1 ? "light" : "lights"} on
          </span>
        )}

        {/* Thermostat badge */}
        {thermostat && thermostat.temperature != null && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            {thermostat.temperature}°C
          </span>
        )}

        {/* Motion badge */}
        {activeSensors.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Motion
          </span>
        )}

        {/* All off badge */}
        {totalActive === 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            All off
          </span>
        )}
      </div>
    </div>
  );
};

export default StatusHeader;
