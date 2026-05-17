"""Home Assistant WebSocket client for the Hive gateway."""

import asyncio
import json
import logging
import os
from typing import Any, Callable, Optional

import httpx
import websockets
from websockets.asyncio.client import connect as ws_connect

log = logging.getLogger("hive.ha_client")

HA_URL = os.getenv("HA_URL", "http://homeassistant:8123")
HA_TOKEN = os.getenv("HA_TOKEN", "")


class HAClient:
    """Manages the connection to Home Assistant's WebSocket API."""

    def __init__(self):
        self._ws: Optional[Any] = None
        self._msg_id = 0
        self._pending: dict[int, asyncio.Future] = {}
        self._state_listeners: list[Callable] = []
        self._states: dict[str, dict] = {}
        self._areas: list[dict] = []
        self._entity_area_map: dict[str, str] = {}  # entity_id -> area_id
        self._connected = False
        self._listener_running = False
        self._reconnect_task: Optional[asyncio.Task] = None

    @property
    def connected(self) -> bool:
        return self._connected

    def _next_id(self) -> int:
        self._msg_id += 1
        return self._msg_id

    async def connect(self):
        """Connect and authenticate to HA WebSocket API."""
        ws_url = HA_URL.replace("http://", "ws://").replace("https://", "wss://") + "/api/websocket"
        log.info(f"Connecting to HA at {ws_url}")

        try:
            self._ws = await ws_connect(ws_url)
            # Wait for auth_required
            msg = json.loads(await self._ws.recv())
            if msg.get("type") != "auth_required":
                log.error(f"Unexpected message: {msg}")
                return

            # Authenticate
            await self._ws.send(json.dumps({"type": "auth", "access_token": HA_TOKEN}))
            msg = json.loads(await self._ws.recv())
            if msg.get("type") != "auth_ok":
                log.error(f"Auth failed: {msg}")
                return

            self._connected = True
            log.info("Connected and authenticated to HA")

            # Fetch initial state
            await self._fetch_states()
            await self._fetch_areas()
            await self._fetch_entity_area_map()

            # Subscribe to state changes
            await self._subscribe_events()

            # Start listener
            self._listener_running = True
            self._reconnect_task = asyncio.create_task(self._listen())

        except Exception as e:
            log.error(f"Failed to connect to HA: {e}")
            self._connected = False
            # Schedule reconnect
            asyncio.create_task(self._reconnect_loop())

    async def _reconnect_loop(self):
        """Retry connection with backoff."""
        delay = 5
        while not self._connected:
            log.info(f"Reconnecting in {delay}s...")
            await asyncio.sleep(delay)
            await self.connect()
            delay = min(delay * 2, 60)

    async def _send(self, msg: dict) -> dict:
        """Send a message and wait for the response.

        Before the listener loop is running, we read responses inline.
        Once the listener is active, responses arrive via _pending futures.
        """
        msg_id = self._next_id()
        msg["id"] = msg_id

        if self._listener_running:
            # Listener loop resolves pending futures
            future: asyncio.Future = asyncio.get_event_loop().create_future()
            self._pending[msg_id] = future
            await self._ws.send(json.dumps(msg))
            return await future
        else:
            # No listener yet — read the response directly
            await self._ws.send(json.dumps(msg))
            while True:
                raw = await self._ws.recv()
                resp = json.loads(raw)
                if resp.get("type") == "result" and resp.get("id") == msg_id:
                    return resp
                # Stash any event messages we receive while waiting
                if resp.get("type") == "event":
                    log.debug(f"Buffered event while waiting for id={msg_id}")

    async def _fetch_states(self):
        """Get all current entity states."""
        result = await self._send({"type": "get_states"})
        if result.get("success"):
            for entity in result.get("result", []):
                eid = entity["entity_id"]
                self._states[eid] = {
                    "entity_id": eid,
                    "state": entity["state"],
                    "attributes": entity.get("attributes", {}),
                }
            log.info(f"Loaded {len(self._states)} entities")

    async def _fetch_areas(self):
        """Fetch area registry."""
        result = await self._send({
            "type": "config/area_registry/list",
        })
        if result.get("success"):
            self._areas = result.get("result", [])
            log.info(f"Loaded {len(self._areas)} areas")

    async def _subscribe_events(self):
        """Subscribe to state_changed events."""
        await self._send({
            "type": "subscribe_events",
            "event_type": "state_changed",
        })

    async def _fetch_entity_area_map(self):
        """Build entity_id → area_id map via entity & device registries."""
        # Get device registry (device_id → area_id)
        dev_result = await self._send({"type": "config/device_registry/list"})
        device_area = {}
        if dev_result.get("success"):
            for d in dev_result.get("result", []):
                if d.get("area_id"):
                    device_area[d["id"]] = d["area_id"]

        # Get entity registry (entity_id → device_id)
        ent_result = await self._send({"type": "config/entity_registry/list"})
        if ent_result.get("success"):
            for e in ent_result.get("result", []):
                dev_id = e.get("device_id")
                if dev_id and dev_id in device_area:
                    self._entity_area_map[e["entity_id"]] = device_area[dev_id]

        log.info(f"Mapped {len(self._entity_area_map)} entities to areas")

    async def _listen(self):
        """Listen for incoming WebSocket messages."""
        try:
            async for raw in self._ws:
                msg = json.loads(raw)
                msg_type = msg.get("type")

                if msg_type == "result":
                    mid = msg.get("id")
                    if mid in self._pending:
                        self._pending.pop(mid).set_result(msg)

                elif msg_type == "event":
                    event = msg.get("event", {})
                    if event.get("event_type") == "state_changed":
                        data = event.get("data", {})
                        new_state = data.get("new_state")
                        if new_state:
                            eid = new_state["entity_id"]
                            self._states[eid] = {
                                "entity_id": eid,
                                "state": new_state["state"],
                                "attributes": new_state.get("attributes", {}),
                            }
                            # Notify listeners
                            for cb in self._state_listeners:
                                try:
                                    await cb(eid, self._states[eid])
                                except Exception as e:
                                    log.error(f"Listener error: {e}")

        except websockets.exceptions.ConnectionClosed:
            log.warning("HA WebSocket connection closed")
            self._connected = False
            self._listener_running = False
            asyncio.create_task(self._reconnect_loop())
        except Exception as e:
            log.error(f"Listen error: {e}")
            self._connected = False
            asyncio.create_task(self._reconnect_loop())

    def on_state_change(self, callback: Callable):
        """Register a callback for state changes."""
        self._state_listeners.append(callback)

    def get_states(self) -> dict[str, dict]:
        return self._states

    def get_areas(self) -> list[dict]:
        return self._areas

    def get_area_map(self) -> dict[str, str]:
        """Return {area_id: area_name} mapping."""
        return {a.get("area_id", ""): a.get("name", "") for a in self._areas}

    def get_entity_area_map(self) -> dict[str, str]:
        """Return {entity_id: area_id} mapping."""
        return self._entity_area_map

    async def call_service(self, domain: str, service: str, entity_id: str, data: dict = None):
        """Call an HA service (e.g., turn on a light)."""
        msg = {
            "type": "call_service",
            "domain": domain,
            "service": service,
            "target": {"entity_id": entity_id},
        }
        if data:
            msg["service_data"] = data
        return await self._send(msg)

    async def disconnect(self):
        if self._ws:
            await self._ws.close()
            self._connected = False


# Singleton
ha_client = HAClient()
