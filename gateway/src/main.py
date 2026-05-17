"""Hive API Gateway — FastAPI application."""

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .auth import authenticate_user, create_access_token, get_current_user, verify_ws_token
from .ha_client import ha_client
from .mappers import ha_area_to_room, ha_entity_to_device
from .models.schemas import DeviceCommand, LoginRequest, TokenResponse

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("hive.gateway")

# Track connected WebSocket clients
ws_clients: set[WebSocket] = set()

# Domains we expose (filter out HA internal entities)
EXPOSED_DOMAINS = {"switch", "light", "binary_sensor", "climate"}


def _get_devices():
    """Build branded device list from HA states."""
    area_map = ha_client.get_area_map()
    entity_area_map = ha_client.get_entity_area_map()
    devices = []
    for eid, entity in ha_client.get_states().items():
        domain = eid.split(".")[0]
        if domain not in EXPOSED_DOMAINS:
            continue
        devices.append(
            ha_entity_to_device(eid, entity["state"], entity["attributes"], area_map, entity_area_map)
        )
    return devices


async def _broadcast_state_change(entity_id: str, entity: dict):
    """Push state change to all connected WebSocket clients."""
    domain = entity_id.split(".")[0]
    if domain not in EXPOSED_DOMAINS:
        return
    area_map = ha_client.get_area_map()
    entity_area_map = ha_client.get_entity_area_map()
    device = ha_entity_to_device(entity_id, entity["state"], entity["attributes"], area_map, entity_area_map)
    msg = json.dumps({"event": "state_changed", "device": device.model_dump()})
    disconnected = set()
    for ws in ws_clients:
        try:
            await ws.send_text(msg)
        except Exception:
            disconnected.add(ws)
    ws_clients.difference_update(disconnected)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start HA client on startup, disconnect on shutdown."""
    ha_client.on_state_change(_broadcast_state_change)
    asyncio.create_task(ha_client.connect())
    yield
    await ha_client.disconnect()


app = FastAPI(
    title="Hive Smart Home API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"http://localhost:{os.getenv('WEB_PORT', '3000')}",
        os.getenv("CORS_ORIGIN", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


# ── Health ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "hive-gateway", "ha_connected": ha_client.connected}


# ── Auth ────────────────────────────────────────────────────────────────────

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return TokenResponse(access_token=token)


@app.post("/api/auth/logout")
async def logout():
    return {"status": "ok"}


# ── Devices ─────────────────────────────────────────────────────────────────

@app.get("/api/devices")
async def list_devices(user: dict = Depends(get_current_user)):
    return _get_devices()


@app.get("/api/devices/{device_id}")
async def get_device(device_id: str, user: dict = Depends(get_current_user)):
    area_map = ha_client.get_area_map()
    entity_area_map = ha_client.get_entity_area_map()
    entity = ha_client.get_states().get(device_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Device not found")
    return ha_entity_to_device(device_id, entity["state"], entity["attributes"], area_map, entity_area_map)


@app.post("/api/devices/{device_id}/command")
async def command_device(device_id: str, cmd: DeviceCommand, user: dict = Depends(get_current_user)):
    entity = ha_client.get_states().get(device_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Device not found")

    domain = device_id.split(".")[0]

    if cmd.action == "on":
        await ha_client.call_service(domain, "turn_on", device_id)
    elif cmd.action == "off":
        await ha_client.call_service(domain, "turn_off", device_id)
    elif cmd.action == "set_brightness" and domain == "light":
        # Convert 0-100 to 0-255
        brightness = int((cmd.value or 0) / 100 * 255)
        await ha_client.call_service(domain, "turn_on", device_id, {"brightness": brightness})
    elif cmd.action == "set_temperature" and domain == "climate":
        await ha_client.call_service(domain, "set_temperature", device_id, {"temperature": cmd.value})
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {cmd.action}")

    return {"status": "ok"}


# ── Rooms ───────────────────────────────────────────────────────────────────

@app.get("/api/rooms")
async def list_rooms(user: dict = Depends(get_current_user)):
    rooms = [ha_area_to_room(a) for a in ha_client.get_areas()]
    # Count devices per room
    devices = _get_devices()
    for room in rooms:
        room.device_count = sum(1 for d in devices if d.room_id == room.id)
    return rooms


# ── Scenes ──────────────────────────────────────────────────────────────────

@app.get("/api/scenes")
async def list_scenes(user: dict = Depends(get_current_user)):
    scenes = []
    for eid, entity in ha_client.get_states().items():
        if eid.startswith("scene."):
            scenes.append({
                "id": eid,
                "name": entity["attributes"].get("friendly_name", eid),
            })
    return scenes


@app.post("/api/scenes/{scene_id}/activate")
async def activate_scene(scene_id: str, user: dict = Depends(get_current_user)):
    await ha_client.call_service("scene", "turn_on", scene_id)
    return {"status": "ok"}


# ── WebSocket ───────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    # Validate JWT from query param
    token = ws.query_params.get("token")
    user = verify_ws_token(token)
    if not user:
        await ws.close(code=1008, reason="Unauthorized")
        return

    await ws.accept()
    ws_clients.add(ws)
    log.info(f"WebSocket client connected ({len(ws_clients)} total)")
    try:
        while True:
            # Keep connection alive; clients can send pings
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_clients.discard(ws)
        log.info(f"WebSocket client disconnected ({len(ws_clients)} total)")
