# Home Assistant API Reference

## Overview
HA exposes two primary APIs on the same port (default `:8123`):
- **REST API** at `/api/` — stateless request/response
- **WebSocket API** at `/api/websocket` — persistent connection, real-time events

All requests require `Authorization: Bearer <TOKEN>` header (REST) or an auth message (WebSocket).

---

## Authentication

### Long-Lived Access Token (recommended for gateway)
- Valid for 10 years
- Created via HA profile page UI, or programmatically via WebSocket:
```json
{
  "id": 11,
  "type": "auth/long_lived_access_token",
  "client_name": "Hive Gateway",
  "client_icon": null,
  "lifespan": 365
}
```
- Response: `{ "result": "ABCDEFGH" }`
- Store in `.env` as `HA_TOKEN`

### WebSocket Auth Flow
1. Client connects to `ws://localhost:8123/api/websocket`
2. Server sends `{ "type": "auth_required", "ha_version": "..." }`
3. Client sends `{ "type": "auth", "access_token": "TOKEN" }`
4. Server responds with `auth_ok` or `auth_invalid`

---

## Key WebSocket Commands (used by gateway)

### Get All States
```json
{ "id": 1, "type": "get_states" }
```
Returns array of all entity states. Each entity has:
- `entity_id` (e.g., `light.living_room`, `switch.kitchen_fan`)
- `state` ("on", "off", numeric, etc.)
- `attributes` (brightness, color_temp, friendly_name, device_class, etc.)
- `last_changed`, `last_updated`
- `context` (user_id, parent_id)

### Subscribe to State Changes (real-time)
```json
{ "id": 2, "type": "subscribe_events", "event_type": "state_changed" }
```
Pushes events whenever any entity state changes:
```json
{
  "id": 2,
  "type": "event",
  "event": {
    "data": {
      "entity_id": "light.bed_light",
      "new_state": { "state": "on", "attributes": { "brightness": 180, ... } },
      "old_state": { "state": "off", ... }
    },
    "event_type": "state_changed"
  }
}
```

### Call Service (control devices)
```json
{
  "id": 3,
  "type": "call_service",
  "domain": "light",
  "service": "turn_on",
  "service_data": { "brightness": 200 },
  "target": { "entity_id": "light.kitchen" }
}
```
Common services:
- `light.turn_on` / `light.turn_off` — with optional brightness, color_temp
- `switch.turn_on` / `switch.turn_off`
- `homeassistant.turn_on` / `homeassistant.turn_off` — generic, works on any entity

### Get Entity Registry (for listing devices)
```json
{ "id": 4, "type": "config/entity_registry/list_for_display" }
```
Returns compact entity list with abbreviated keys:
- `ei` = entity_id, `pl` = platform, `ai` = area_id, `di` = device_id, `en` = display name

### Ping/Pong (heartbeat)
```json
{ "id": 99, "type": "ping" }
// Response: { "id": 99, "type": "pong" }
```

---

## Key REST Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/` | API health check (returns `{"message": "API running."}`) |
| GET | `/api/states` | Get all entity states |
| GET | `/api/states/<entity_id>` | Get single entity state |
| POST | `/api/states/<entity_id>` | Set entity state |
| POST | `/api/services/<domain>/<service>` | Call a service action |
| GET | `/api/config` | Get HA config |
| GET | `/api/events` | List available event types |

---

## Gateway Integration Strategy
1. **Connect via WebSocket** for real-time state subscriptions
2. **Use `call_service`** for device commands (not REST POST)
3. **Cache entity list** from `get_states` on startup, update via `state_changed` events
4. **Map entity_ids** to branded device IDs in the gateway
5. **Use long-lived access token** stored in `.env`

## HA Docker Image
- Image: `ghcr.io/home-assistant/home-assistant:stable`
- Config mount: `/config`
- Default port: `8123`
- No separate API integration needed when using the frontend (enabled by default)
