/* ── Domain Types ─────────────────────────────────────────────────────── */

export type DeviceType = "switch" | "light" | "sensor" | "thermostat";
export type PowerState = "on" | "off";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room_id: string | null;
  room_name: string | null;
  power: PowerState;
  brightness: number | null;
  temperature: number | null;
  target_temperature: number | null;
  device_class: string | null;
}

export interface Room {
  id: string;
  name: string;
  device_count: number;
}

export interface Scene {
  id: string;
  name: string;
}

export type DeviceAction = "on" | "off" | "set_brightness" | "set_temperature";

export interface DeviceCommand {
  action: DeviceAction;
  value?: number;
}

/* ── API Error ───────────────────────────────────────────────────────── */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
