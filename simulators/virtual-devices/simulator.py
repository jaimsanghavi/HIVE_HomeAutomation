#!/usr/bin/env python3
"""
Hive Virtual Device Simulator

Publishes MQTT discovery messages and simulates devices for HA.
Devices respond to commands and publish state changes.
"""

import json
import logging
import os
import signal
import sys
import threading
import time

import paho.mqtt.client as mqtt

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("simulator")

MQTT_HOST = os.getenv("MQTT_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))

# ── Device definitions ──────────────────────────────────────────────────────

DEVICES = [
    # On/off switches — Living Room
    {"id": "lr_ceiling", "name": "Living Room Ceiling Light", "area": "Living Room", "type": "switch"},
    {"id": "lr_lamp", "name": "Living Room Lamp", "area": "Living Room", "type": "switch"},
    # On/off switches — Kitchen
    {"id": "kt_main", "name": "Kitchen Main Light", "area": "Kitchen", "type": "switch"},
    {"id": "kt_counter", "name": "Kitchen Counter Light", "area": "Kitchen", "type": "switch"},
    # On/off switches — Bedroom
    {"id": "br_ceiling", "name": "Bedroom Ceiling Light", "area": "Bedroom", "type": "switch"},
    {"id": "br_fan", "name": "Bedroom Fan", "area": "Bedroom", "type": "switch"},
    # Dimmable lights
    {"id": "lr_dimmer", "name": "Living Room Dimmer", "area": "Living Room", "type": "light", "brightness": 128},
    {"id": "br_dimmer", "name": "Bedroom Dimmer", "area": "Bedroom", "type": "light", "brightness": 128},
    # Motion sensor
    {"id": "kt_motion", "name": "Kitchen Motion Sensor", "area": "Kitchen", "type": "binary_sensor", "device_class": "motion"},
    # Thermostat stub
    {"id": "lr_thermo", "name": "Living Room Thermostat", "area": "Living Room", "type": "climate", "temperature": 22, "target": 24},
]

# Runtime state
device_states: dict[str, dict] = {}
shutdown_event = threading.Event()


def init_states():
    """Initialize device states."""
    for dev in DEVICES:
        did = dev["id"]
        if dev["type"] in ("switch", "light"):
            device_states[did] = {"state": "OFF", "brightness": dev.get("brightness", None)}
        elif dev["type"] == "binary_sensor":
            device_states[did] = {"state": "OFF"}
        elif dev["type"] == "climate":
            device_states[did] = {
                "mode": "heat",
                "temperature": dev.get("temperature", 22),
                "target": dev.get("target", 24),
            }


def publish_discovery(client: mqtt.Client):
    """Publish MQTT discovery messages for all devices."""
    for dev in DEVICES:
        did = dev["id"]
        base_topic = f"hive/{did}"

        if dev["type"] == "switch":
            config = {
                "name": None,
                "unique_id": f"hive_sim_{did}",
                "command_topic": f"{base_topic}/set",
                "state_topic": f"{base_topic}/state",
                "payload_on": "ON",
                "payload_off": "OFF",
                "device": {
                    "identifiers": [f"hive_sim_{did}"],
                    "name": dev["name"],
                    "manufacturer": "Hive Simulator",
                    "model": "Virtual Switch",
                    "suggested_area": dev["area"],
                },
            }
            client.publish(
                f"homeassistant/switch/{did}/config",
                json.dumps(config),
                retain=True,
            )

        elif dev["type"] == "light":
            config = {
                "name": None,
                "unique_id": f"hive_sim_{did}",
                "command_topic": f"{base_topic}/set",
                "state_topic": f"{base_topic}/state",
                "brightness_command_topic": f"{base_topic}/brightness/set",
                "brightness_state_topic": f"{base_topic}/brightness/state",
                "brightness_scale": 255,
                "payload_on": "ON",
                "payload_off": "OFF",
                "device": {
                    "identifiers": [f"hive_sim_{did}"],
                    "name": dev["name"],
                    "manufacturer": "Hive Simulator",
                    "model": "Virtual Dimmable Light",
                    "suggested_area": dev["area"],
                },
            }
            client.publish(
                f"homeassistant/light/{did}/config",
                json.dumps(config),
                retain=True,
            )

        elif dev["type"] == "binary_sensor":
            config = {
                "name": None,
                "unique_id": f"hive_sim_{did}",
                "state_topic": f"{base_topic}/state",
                "payload_on": "ON",
                "payload_off": "OFF",
                "device_class": dev.get("device_class", "motion"),
                "device": {
                    "identifiers": [f"hive_sim_{did}"],
                    "name": dev["name"],
                    "manufacturer": "Hive Simulator",
                    "model": "Virtual Sensor",
                    "suggested_area": dev["area"],
                },
            }
            client.publish(
                f"homeassistant/binary_sensor/{did}/config",
                json.dumps(config),
                retain=True,
            )

        elif dev["type"] == "climate":
            config = {
                "name": None,
                "unique_id": f"hive_sim_{did}",
                "mode_command_topic": f"{base_topic}/mode/set",
                "mode_state_topic": f"{base_topic}/mode/state",
                "temperature_command_topic": f"{base_topic}/target/set",
                "temperature_state_topic": f"{base_topic}/target/state",
                "current_temperature_topic": f"{base_topic}/temperature/state",
                "modes": ["off", "heat", "cool", "auto"],
                "device": {
                    "identifiers": [f"hive_sim_{did}"],
                    "name": dev["name"],
                    "manufacturer": "Hive Simulator",
                    "model": "Virtual Thermostat",
                    "suggested_area": dev["area"],
                },
            }
            client.publish(
                f"homeassistant/climate/{did}/config",
                json.dumps(config),
                retain=True,
            )

        log.info(f"Published discovery for {dev['name']} ({dev['type']})")


def publish_states(client: mqtt.Client):
    """Publish current state of all devices."""
    for dev in DEVICES:
        did = dev["id"]
        base_topic = f"hive/{did}"
        state = device_states[did]

        if dev["type"] in ("switch", "light"):
            client.publish(f"{base_topic}/state", state["state"], retain=True)
            if state.get("brightness") is not None:
                client.publish(
                    f"{base_topic}/brightness/state",
                    str(state["brightness"]),
                    retain=True,
                )

        elif dev["type"] == "binary_sensor":
            client.publish(f"{base_topic}/state", state["state"], retain=True)

        elif dev["type"] == "climate":
            client.publish(f"{base_topic}/mode/state", state["mode"], retain=True)
            client.publish(
                f"{base_topic}/target/state", str(state["target"]), retain=True
            )
            client.publish(
                f"{base_topic}/temperature/state",
                str(state["temperature"]),
                retain=True,
            )


def on_connect(client: mqtt.Client, userdata, flags, rc, properties=None):
    log.info(f"Connected to MQTT broker (rc={rc})")
    # Subscribe to all command topics
    client.subscribe("hive/+/set")
    client.subscribe("hive/+/brightness/set")
    client.subscribe("hive/+/mode/set")
    client.subscribe("hive/+/target/set")

    # Publish discovery and initial states
    publish_discovery(client)
    time.sleep(1)
    publish_states(client)


def on_message(client: mqtt.Client, userdata, msg: mqtt.MQTTMessage):
    topic = msg.topic
    payload = msg.payload.decode()
    parts = topic.split("/")

    if len(parts) < 3:
        return

    did = parts[1]  # hive/<device_id>/...

    if did not in device_states:
        return

    state = device_states[did]

    if topic.endswith("/set"):
        # On/off command
        if payload in ("ON", "OFF"):
            state["state"] = payload
            client.publish(f"hive/{did}/state", payload, retain=True)
            log.info(f"{did}: {payload}")

    elif topic.endswith("/brightness/set"):
        try:
            val = max(0, min(255, int(payload)))
            state["brightness"] = val
            client.publish(f"hive/{did}/brightness/state", str(val), retain=True)
            if val > 0:
                state["state"] = "ON"
                client.publish(f"hive/{did}/state", "ON", retain=True)
            log.info(f"{did}: brightness={val}")
        except ValueError:
            pass

    elif topic.endswith("/mode/set"):
        state["mode"] = payload
        client.publish(f"hive/{did}/mode/state", payload, retain=True)
        log.info(f"{did}: mode={payload}")

    elif topic.endswith("/target/set"):
        try:
            val = float(payload)
            state["target"] = val
            client.publish(f"hive/{did}/target/state", str(val), retain=True)
            log.info(f"{did}: target={val}")
        except ValueError:
            pass


def simulate_motion(client: mqtt.Client):
    """Periodically trigger the motion sensor for realism."""
    while not shutdown_event.is_set():
        shutdown_event.wait(30)
        if shutdown_event.is_set():
            break
        did = "kt_motion"
        device_states[did]["state"] = "ON"
        client.publish(f"hive/{did}/state", "ON", retain=True)
        log.info("Kitchen motion detected (simulated)")
        shutdown_event.wait(10)
        if shutdown_event.is_set():
            break
        device_states[did]["state"] = "OFF"
        client.publish(f"hive/{did}/state", "OFF", retain=True)


def main():
    init_states()

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="hive-simulator")
    client.on_connect = on_connect
    client.on_message = on_message

    log.info(f"Connecting to MQTT at {MQTT_HOST}:{MQTT_PORT}")

    # Retry connection
    for attempt in range(30):
        try:
            client.connect(MQTT_HOST, MQTT_PORT)
            break
        except (ConnectionRefusedError, OSError):
            log.info(f"MQTT not ready, retrying ({attempt + 1}/30)...")
            time.sleep(2)
    else:
        log.error("Failed to connect to MQTT after 30 attempts")
        sys.exit(1)

    # Start motion simulation thread
    motion_thread = threading.Thread(target=simulate_motion, args=(client,), daemon=True)
    motion_thread.start()

    def handle_signal(sig, frame):
        log.info("Shutting down simulator...")
        shutdown_event.set()
        client.disconnect()
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    client.loop_forever()


if __name__ == "__main__":
    main()
