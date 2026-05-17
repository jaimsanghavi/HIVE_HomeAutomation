"""Map HA entities to Hive branded domain objects."""

from .models.schemas import Device, DevicePower, DeviceType, Room


def _ha_state_to_power(state: str) -> DevicePower:
    return DevicePower.ON if state in ("on", "heat", "cool", "auto") else DevicePower.OFF


def _detect_device_type(entity_id: str, attributes: dict) -> DeviceType:
    domain = entity_id.split(".")[0]
    if domain == "light":
        return DeviceType.LIGHT
    if domain == "climate":
        return DeviceType.THERMOSTAT
    if domain in ("binary_sensor", "sensor"):
        return DeviceType.SENSOR
    return DeviceType.SWITCH


def ha_entity_to_device(entity_id: str, state: str, attributes: dict, area_map: dict, entity_area_map: dict = None) -> Device:
    """Convert a single HA entity dict into a branded Device."""
    dev_type = _detect_device_type(entity_id, attributes)
    # Try entity_area_map first (device registry), then attributes
    area_id = (entity_area_map or {}).get(entity_id) or attributes.get("area_id")

    brightness = None
    if dev_type == DeviceType.LIGHT and "brightness" in attributes:
        # HA brightness is 0-255, we expose 0-100
        raw = attributes["brightness"]
        brightness = round((raw / 255) * 100) if raw is not None else None

    temperature = None
    target_temperature = None
    if dev_type == DeviceType.THERMOSTAT:
        temperature = attributes.get("current_temperature")
        target_temperature = attributes.get("temperature")

    # HA sometimes appends " None" when MQTT entity name is null
    friendly = attributes.get("friendly_name", entity_id)
    if friendly.endswith(" None"):
        friendly = friendly[:-5]

    return Device(
        id=entity_id,
        name=friendly,
        type=dev_type,
        room_id=area_id,
        room_name=area_map.get(area_id, ""),
        power=_ha_state_to_power(state),
        brightness=brightness,
        temperature=temperature,
        target_temperature=target_temperature,
        device_class=attributes.get("device_class"),
    )


def ha_area_to_room(area: dict) -> Room:
    """Convert an HA area registry entry to a branded Room."""
    return Room(
        id=area.get("area_id", ""),
        name=area.get("name", ""),
    )
