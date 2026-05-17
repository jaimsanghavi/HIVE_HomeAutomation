# Shelly Plus Local API

## Overview
Shelly Plus devices (Gen2+) support fully local control with no cloud dependency. They offer three local communication methods:

1. **HTTP/REST API** — simplest for quick integration
2. **MQTT** — best for real-time state updates with a broker
3. **WebSocket (RPC)** — most feature-rich, bidirectional

## Shelly Plus 1 Specs
- **Price**: ~$15
- **Relay**: 1 channel, 16A
- **Chip**: ESP32-U4WDH
- **Connectivity**: Wi-Fi 802.11 b/g/n (2.4 GHz), Bluetooth (for setup)
- **Physical button**: External input terminal (S pin)
- **Power**: 110-240V AC or 12V DC
- **No flashing needed** — works out of the box with local APIs

## HTTP API (Gen2 RPC)

### Get Device Status
```bash
curl http://192.168.1.XX/rpc/Switch.GetStatus?id=0
```
Response:
```json
{
  "id": 0,
  "source": "init",
  "output": true,
  "apower": 0,
  "voltage": 230.5,
  "current": 0,
  "temperature": { "tC": 42.3, "tF": 108.1 }
}
```

### Turn On/Off
```bash
# Turn on
curl http://192.168.1.XX/rpc/Switch.Set?id=0&on=true

# Turn off
curl http://192.168.1.XX/rpc/Switch.Set?id=0&on=false

# Toggle
curl http://192.168.1.XX/rpc/Switch.Toggle?id=0
```

### Get Device Info
```bash
curl http://192.168.1.XX/rpc/Shelly.GetDeviceInfo
```

## MQTT Integration (Recommended for Hive)

### Enable MQTT on the Shelly
1. Open Shelly web UI: `http://192.168.1.XX`
2. Go to Settings → MQTT
3. Enable MQTT
4. Set broker: `mqtt://192.168.1.YY:1883` (your Mosquitto IP)
5. Set Topic Prefix (e.g., `shelly-plus-1`)

### MQTT Topics
```
# State (published by device)
shelly-plus-1/status/switch:0  →  {"id":0,"output":true,...}

# Command (send to device)
shelly-plus-1/command/switch:0  →  "on" | "off" | "toggle"

# Events (button press, etc.)
shelly-plus-1/events/rpc  →  {"method":"NotifyEvent","params":{"events":[...]}}
```

### HA Auto-Discovery
When MQTT is enabled, Shelly Plus devices publish MQTT discovery messages that HA auto-detects. The device appears automatically in HA as a `switch` entity.

## Physical Button Behavior
- The Shelly Plus 1 has a **hardware switch input** (S terminal)
- Button press toggles the relay **locally on the device** — no network needed
- When WiFi reconnects, the device publishes the current state to MQTT
- HA picks up the state change via MQTT subscription

## HA Integration Options
1. **Shelly Integration (built-in)**: HA has a native Shelly integration that auto-discovers devices via mDNS/CoAP. Fully local.
2. **MQTT**: If Mosquitto is already running, MQTT is the most flexible option.
3. **Both**: You can enable both — Shelly integration for primary control, MQTT as backup.

### Recommended for Hive: Use HA's built-in Shelly integration
- Auto-discovers on the LAN
- Fully local (CoAP protocol)
- No MQTT configuration needed on the device
- Faster state updates than MQTT
- The Mosquitto broker is still used for ESPHome/Sonoff devices

## Setup Steps for Hive
1. Power on Shelly Plus 1
2. Connect to its WiFi AP for initial setup
3. Configure it to join your home WiFi network
4. HA auto-discovers the device within seconds
5. Device appears as `switch.shelly_plus_1_<id>` in HA
6. Gateway maps it to a branded device like any other switch
