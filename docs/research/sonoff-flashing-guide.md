# Sonoff Flashing Guide

## Which Models Can Be Flashed with ESPHome?

### Easily Flashable (Recommended)
| Model | Chip | Flash Method | Notes |
|-------|------|-------------|-------|
| **Sonoff Basic R2** | ESP8266 | UART (solder pads) | Most documented, cheapest |
| **Sonoff Mini R2** | ESP8266 | UART or DIY mode (OTA) | Has OTA flash mode — no soldering! |
| **Sonoff S26** | ESP8266 | UART (solder pads) | Smart plug form factor |
| **Sonoff TH16** | ESP8266 | UART (solder pads) | Temperature/humidity sensor jack |
| **Sonoff 4CH** | ESP8266 | UART (solder pads) | 4-channel relay |

### Flashable but More Complex
| Model | Chip | Notes |
|-------|------|-------|
| Sonoff Mini R4 | ESP32-C3 | Newer chip, ESPHome supports it |
| Sonoff BASICR4 | ESP32-C3 | Same as above |
| Sonoff NSPanel | ESP32 | Touch screen complicates things |

### Cannot Flash / Not Recommended
| Model | Reason |
|-------|--------|
| Sonoff Zigbee models | Different protocol, not Wi-Fi |
| Sonoff RF Bridge | Uses a separate RF chip |
| Very new models (2025+) | Some use encrypted bootloaders |

## Sonoff Mini R2 — Best Choice for Hive MVP

### Why
- Supports **DIY mode** — can flash via OTA without opening the case or soldering
- Small form factor, fits inside a junction box
- Has dedicated switch input (S1/S2) for physical wall switch
- ~$10-12

### DIY Mode OTA Flash (No Soldering!)
1. **Enable DIY Mode**:
   - Long-press the button for 5 seconds → enters pairing mode
   - Connect to its WiFi AP: `ITEAD-XXXXXXXX`
   - Open `http://10.10.7.1` in browser
   - Switch to DIY mode
2. **Connect to your WiFi**: Device joins your network in DIY mode
3. **Flash ESPHome**:
   ```bash
   # Find device IP (check router DHCP)
   esphome run sonoff-mini-r2.yaml --device 192.168.1.XX
   ```
4. Device reboots with ESPHome firmware

### UART Flash (if DIY mode fails)
1. Open the case (4 screws)
2. Locate the 4-pin header: `3V3`, `TX`, `RX`, `GND`
3. Connect USB-to-serial adapter:
   - Adapter TX → Sonoff RX
   - Adapter RX → Sonoff TX
   - Adapter GND → Sonoff GND
   - Adapter 3.3V → Sonoff 3.3V (**NOT 5V!**)
4. Hold button while connecting USB → enters flash mode
5. `esphome run sonoff-mini-r2.yaml`

## Hardware Shopping List
| Item | Price | Where |
|------|-------|-------|
| Sonoff Mini R2 | ~$10 | AliExpress, Amazon |
| Sonoff Basic R2 (backup) | ~$6 | AliExpress, Amazon |
| USB-to-Serial (CP2102 or CH340) | ~$5 | Amazon |
| Dupont jumper wires | ~$3 | Amazon |

## Physical Button Behavior After Flash
- ESPHome firmware handles the physical button via GPIO
- Button press toggles relay **locally on the chip** — no WiFi required
- When WiFi reconnects, ESPHome syncs state with HA automatically
- See `firmware/esphome/sonoff-mini-r2.yaml` for the button configuration

## Risks
- **Warranty void** — flashing third-party firmware voids Sonoff warranty
- **Brick risk** — minimal with OTA/DIY mode, slightly higher with UART
- **Hardware revisions** — Sonoff occasionally changes chip/pinout without changing model name. Buy from a reliable source and check the revision before flashing
- **Recovery** — if flash fails, you can usually re-flash via UART as long as the ESP chip is intact
