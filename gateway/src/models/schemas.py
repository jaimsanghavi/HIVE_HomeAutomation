"""Pydantic models for the Hive branded API."""

from enum import Enum
from typing import Optional
from pydantic import BaseModel


class DeviceType(str, Enum):
    SWITCH = "switch"
    LIGHT = "light"
    SENSOR = "sensor"
    THERMOSTAT = "thermostat"


class DevicePower(str, Enum):
    ON = "on"
    OFF = "off"


class Device(BaseModel):
    id: str
    name: str
    type: DeviceType
    room_id: Optional[str] = None
    room_name: Optional[str] = None
    power: DevicePower
    brightness: Optional[int] = None  # 0-100 for dimmable
    temperature: Optional[float] = None  # current temp for thermostats
    target_temperature: Optional[float] = None
    device_class: Optional[str] = None


class Room(BaseModel):
    id: str
    name: str
    device_count: int = 0


class DeviceAction(str, Enum):
    ON = "on"
    OFF = "off"
    SET_BRIGHTNESS = "set_brightness"
    SET_TEMPERATURE = "set_temperature"


class DeviceCommand(BaseModel):
    action: DeviceAction
    value: Optional[float] = None


class Scene(BaseModel):
    id: str
    name: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class WSMessage(BaseModel):
    """WebSocket message pushed to clients."""
    event: str  # "state_changed", "device_added", "device_removed"
    device: Optional[Device] = None
