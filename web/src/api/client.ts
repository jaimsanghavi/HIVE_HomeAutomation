import { ApiError } from "../types";
import type { Device, DeviceCommand, Room, Scene } from "../types";

export type { Device, DeviceCommand, Room, Scene };

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws";

/* ── Types ───────────────────────────────────────────────────────────── */
// Types are defined in ../types/index.ts and re-exported above

/* ── Auth helpers ────────────────────────────────────────────────────── */

function getToken(): string | null {
  return localStorage.getItem("hive-token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem("hive-token");
    window.location.href = "/login";
    throw new ApiError("Unauthorized", 401);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(`API error ${res.status}`, res.status, body);
  }
  return res.json();
}

/* ── API functions ───────────────────────────────────────────────────── */

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new ApiError("Invalid credentials", res.status);
  const data = await res.json();
  const token = data.access_token;
  localStorage.setItem("hive-token", token);
  return token;
}

export function logout() {
  localStorage.removeItem("hive-token");
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function fetchDevices(): Promise<Device[]> {
  const res = await fetch(`${API_BASE}/api/devices`, { headers: authHeaders() });
  return handleResponse<Device[]>(res);
}

export async function fetchDevice(id: string): Promise<Device> {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  });
  return handleResponse<Device>(res);
}

export async function sendDeviceCommand(id: string, command: DeviceCommand): Promise<void> {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(id)}/command`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(command),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(`Command failed`, res.status, body);
  }
}

export async function fetchRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE}/api/rooms`, { headers: authHeaders() });
  return handleResponse<Room[]>(res);
}

export async function fetchScenes(): Promise<Scene[]> {
  const res = await fetch(`${API_BASE}/api/scenes`, { headers: authHeaders() });
  return handleResponse<Scene[]>(res);
}

export async function activateScene(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/scenes/${encodeURIComponent(id)}/activate`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new ApiError("Failed to activate scene", res.status);
}

/* ── WebSocket ───────────────────────────────────────────────────────── */

export type WSEventHandler = (device: Device) => void;

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<WSEventHandler>();

export function subscribeDeviceUpdates(handler: WSEventHandler): () => void {
  listeners.add(handler);
  ensureWSConnection();
  return () => {
    listeners.delete(handler);
    if (listeners.size === 0 && ws) {
      ws.close();
      ws = null;
    }
  };
}

function ensureWSConnection() {
  if (ws && ws.readyState <= WebSocket.OPEN) return;
  const token = getToken();
  if (!token) return;

  ws = new WebSocket(`${WS_BASE}?token=${encodeURIComponent(token)}`);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === "state_changed" && msg.device) {
        listeners.forEach((fn) => fn(msg.device));
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    ws = null;
    if (listeners.size > 0) {
      reconnectTimer = setTimeout(ensureWSConnection, 3000);
    }
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export function disconnectWS() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (ws) ws.close();
  ws = null;
  listeners.clear();
}
