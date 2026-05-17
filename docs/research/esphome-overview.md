# ESPHome Overview

## What Is ESPHome?
ESPHome is a firmware framework for ESP8266/ESP32 microcontrollers. You define device behavior in YAML, ESPHome compiles it into firmware, and the device integrates natively with Home Assistant.

## Key Features
- **YAML-based configuration** — no C/Arduino code needed
- **Native HA integration** via ESPHome API (not MQTT, though MQTT is also supported)
- **OTA updates** — flash over Wi-Fi after initial USB flash
- **Physical button support** — works even when WiFi is down (local GPIO)
- **Apache 2.0 licensed** — same as HA

## Device YAML Structure
```yaml
esphome:
  name: sonoff-basic-r2
  friendly_name: "Sonoff Basic R2"

esp8266:
  board: esp01_1m  # Sonoff Basic R2 uses ESP8266 with 1MB flash

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  ap:
    ssid: "Sonoff-Fallback"
    password: "fallback123"

# Enable Home Assistant API
api:
  encryption:
    key: !secret api_encryption_key

# Enable OTA updates
ota:
  password: !secret ota_password

# Enable logging
logger:

# Define the relay (switch)
switch:
  - platform: gpio
    name: "Relay"
    pin: GPIO12
    id: relay

# Define the physical button
binary_sensor:
  - platform: gpio
    pin:
      number: GPIO0
      mode: INPUT_PULLUP
      inverted: true
    name: "Button"
    on_press:
      - switch.toggle: relay

# Status LED
status_led:
  pin:
    number: GPIO13
    inverted: true
```

## Flashing Flow

### Initial Flash (USB/UART)
1. **Hardware needed**: USB-to-serial adapter (FTDI/CH340/CP2102), 3.3V logic level
2. **Connect**: TX→RX, RX→TX, GND→GND, 3.3V→VCC
3. **Enter flash mode**: Hold GPIO0 button while powering on
4. **Flash**: `esphome run sonoff-basic-r2.yaml` (connects via USB serial)
5. **Takes**: ~2-3 minutes

### OTA Flash (after initial)
1. Device connects to WiFi
2. `esphome run sonoff-basic-r2.yaml` — ESPHome auto-detects device on network
3. Uploads firmware over WiFi
4. Device reboots with new firmware
5. **Takes**: ~30-60 seconds

## Physical Button Override
The YAML above includes a `binary_sensor` for the physical button that directly toggles the relay. This works **entirely on the device** — no WiFi/HA needed:
- Button press → GPIO interrupt → relay toggles
- This is firmware-level, not dependent on any network connection
- When WiFi reconnects, HA state syncs automatically via the ESPHome API

## Common ESP Boards for Sonoff
| Device | Chip | Flash | GPIO Relay | GPIO Button |
|--------|------|-------|-----------|-------------|
| Sonoff Basic R2 | ESP8266 | 1MB | GPIO12 | GPIO0 |
| Sonoff Mini R2 | ESP8266 | 1MB | GPIO12 | GPIO0 |
| Sonoff S26 (plug) | ESP8266 | 1MB | GPIO12 | GPIO0 |
| Sonoff TH16 | ESP8266 | 1MB | GPIO12 | GPIO0 |
| Generic ESP32 | ESP32 | 4MB | varies | varies |

## ESPHome + HA Integration
- ESPHome devices use a **native API** (not MQTT) — faster, more reliable
- HA auto-discovers ESPHome devices on the network
- Each sensor/switch/light in the YAML becomes an HA entity
- State sync is near-instantaneous over the native API

## MQTT Alternative
If you prefer MQTT (e.g., for non-HA systems or testing):
```yaml
mqtt:
  broker: 192.168.1.100
  username: mqtt_user
  password: mqtt_pass
```
This replaces the `api:` section — device publishes state to MQTT topics instead.

## Files for Hive
- `firmware/esphome/sonoff-basic-r2.yaml` — template for Sonoff Basic R2
- `firmware/esphome/esp32-generic-switch.yaml` — template for custom ESP32 boards
- `firmware/esphome/secrets.yaml` — WiFi creds, API keys (gitignored)
