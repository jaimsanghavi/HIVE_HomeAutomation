import { create } from "zustand";
import {
  fetchDevices,
  fetchRooms,
  sendDeviceCommand,
  subscribeDeviceUpdates,
  type Device,
  type DeviceCommand,
  type Room,
} from "../api/client";

/* ── Device Store ────────────────────────────────────────────────────── */

interface DeviceStore {
  devices: Device[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  load: () => Promise<void>;
  command: (id: string, cmd: DeviceCommand) => Promise<void>;
  startRealtime: () => void;
  stopRealtime: () => void;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  loading: false,
  error: null,
  unsubscribe: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const devices = await fetchDevices();
      set({ devices, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  command: async (id, cmd) => {
    // Optimistic update
    const prev = get().devices;
    set({
      devices: prev.map((d) => {
        if (d.id !== id) return d;
        const updated = { ...d };
        if (cmd.action === "on") updated.power = "on";
        else if (cmd.action === "off") updated.power = "off";
        else if (cmd.action === "set_brightness" && cmd.value != null)
          updated.brightness = cmd.value;
        else if (cmd.action === "set_temperature" && cmd.value != null)
          updated.target_temperature = cmd.value;
        return updated;
      }),
    });

    try {
      await sendDeviceCommand(id, cmd);
    } catch {
      // Revert on failure
      set({ devices: prev });
    }
  },

  startRealtime: () => {
    const unsub = subscribeDeviceUpdates((device) => {
      set((state) => ({
        devices: state.devices.map((d) => (d.id === device.id ? device : d)),
      }));
    });
    set({ unsubscribe: unsub });
  },

  stopRealtime: () => {
    get().unsubscribe?.();
    set({ unsubscribe: null });
  },
}));

/* ── Room Store ──────────────────────────────────────────────────────── */

interface RoomStore {
  rooms: Room[];
  loading: boolean;
  load: () => Promise<void>;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const rooms = await fetchRooms();
      set({ rooms, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
