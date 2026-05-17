import { useCallback, useEffect } from "react";
import { useDeviceStore, useRoomStore } from "../stores";
import type { DeviceCommand } from "../types";

/**
 * Hook for device operations with automatic loading.
 * Wraps the Zustand store with lifecycle management.
 */
export function useDevices() {
  const store = useDeviceStore();

  useEffect(() => {
    store.load();
    store.startRealtime();
    return () => store.stopRealtime();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(
    (id: string, power: "on" | "off") => {
      store.command(id, { action: power });
    },
    [store.command],
  );

  const sendCommand = useCallback(
    (id: string, cmd: DeviceCommand) => {
      store.command(id, cmd);
    },
    [store.command],
  );

  return {
    devices: store.devices,
    loading: store.loading,
    error: store.error,
    toggle,
    sendCommand,
  };
}

/**
 * Hook for room data with automatic loading.
 */
export function useRooms() {
  const store = useRoomStore();

  useEffect(() => {
    store.load();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return {
    rooms: store.rooms,
    loading: store.loading,
  };
}

/**
 * Get devices filtered by room.
 */
export function useRoomDevices(roomId: string | undefined) {
  const { devices, loading, toggle, sendCommand } = useDevices();
  const filtered = roomId ? devices.filter((d) => d.room_id === roomId) : devices;
  return { devices: filtered, loading, toggle, sendCommand };
}
