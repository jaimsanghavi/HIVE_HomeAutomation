# Philips Smart Bulb Integration

## Identifying Your Bulb
Philips sells smart bulbs under two product lines with different protocols:

### Philips Hue (Zigbee)
- Uses **Zigbee** protocol → requires a **Hue Bridge** (hub)
- Bridge connects to your network via Ethernet
- HA Integration: Built-in `hue` integration (excellent, official)
- Products: Hue White, Hue Color, Hue Ambiance

### Philips WiZ (Wi-Fi)
- Uses **Wi-Fi** (2.4 GHz) → connects directly to your router, **no hub needed**
- HA Integration: Built-in `wiz` integration
- Products: WiZ branded bulbs (often sold at retail stores without "Hue" branding)
- If your Philips bulb connects via Wi-Fi and uses the "WiZ" app → this is it

### How to Tell Which You Have
- **Check the app**: If you use the "Philips Hue" app → it's Zigbee/Hue. If "WiZ" app → it's Wi-Fi/WiZ
- **Check for a bridge**: If you needed a bridge/hub → Hue. If it connected directly to Wi-Fi → WiZ
- **Check the box**: Look for "WiZ" or "Hue" branding

## Integration: Philips WiZ (most likely for a single IoT bulb)

### HA Setup
1. Ensure the bulb is on the same network/VLAN as HA
2. HA auto-discovers WiZ bulbs via the `wiz` integration
3. Or manually add: Settings → Integrations → Add → WiZ
4. Provide the bulb's IP address if not auto-discovered

### Capabilities
- On/Off
- Brightness (0-255)
- Color temperature (warm to cool white)
- RGB color (if color bulb)
- Scenes/effects (built into the bulb firmware)

### Local Control
- WiZ uses a **local UDP protocol** on port 38899
- Fully local — no cloud needed after initial setup
- HA's WiZ integration works completely locally
- **Perfect fit** for Hive's local-only architecture

### Entity Mapping
- Appears as `light.wiz_<name>` in HA
- Attributes: `brightness`, `color_temp`, `rgb_color`, `effect`

## Integration: Philips Hue (if applicable)

### HA Setup
1. Connect Hue Bridge to network via Ethernet
2. HA auto-discovers the bridge
3. Press the button on the bridge when prompted
4. All bulbs on the bridge appear automatically

### Local Control
- Hue Bridge v2 supports **fully local** API
- HA communicates with the bridge locally
- The bridge communicates with bulbs via Zigbee (no Wi-Fi needed per bulb)

## Recommended Approach for Hive
1. **Determine bulb type** (WiZ vs Hue)
2. **If WiZ**: Simplest path — add `wiz` integration, fully local, no extra hardware
3. **If Hue**: Need Hue Bridge (~$50) but integration is rock-solid
4. Both will appear in the gateway as standard `light` entities with brightness/color control

## Gateway Mapping
Both WiZ and Hue lights map to the branded `Device` model:
- `device.power` ← entity state ("on"/"off")
- `device.brightness` ← attribute `brightness` (scale 0-255 → 0-100%)
- `device.type` = "light"
- `device.capabilities` = ["on_off", "brightness", "color_temp"]
