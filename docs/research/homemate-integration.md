# Homemate Switch Integration

## Identifying the Protocol
Most "Homemate" branded Wi-Fi smart switches are **Tuya-based** devices. They use:
- **Tuya Smart / Smart Life** cloud platform under the hood
- The **Tuya protocol** for local communication (encrypted UDP on port 6668)
- Wi-Fi (2.4 GHz) connectivity

## How to Confirm
1. Check if the Homemate app asks you to create a "Smart Life" or "Tuya Smart" account
2. Check if the device appears in the **Tuya IoT Developer Platform** (https://iot.tuya.com)
3. Look at the device's FCC ID — search on fcc.io to confirm Tuya chipset

## HA Integration Options

### Option A: LocalTuya (Recommended for local-only)
- **Integration**: [LocalTuya](https://github.com/rospogriern/localtuya) (HACS custom integration)
- **How it works**: Communicates directly with the device on your LAN using Tuya's local protocol
- **Requirements**:
  1. Extract the device's `local_key` (encryption key) from Tuya IoT Platform
  2. Get the `device_id` from the Tuya app/platform
  3. Configure in HA with the device's IP, ID, and local key
- **Pros**: Fully local, no cloud dependency, fast response
- **Cons**: Requires one-time cloud access to extract keys; keys may rotate on firmware update

### Option B: Tuya Integration (Built-in, cloud-based)
- **Integration**: Built-in `tuya` integration in HA
- **How it works**: Uses Tuya Cloud API
- **Pros**: Easy setup, official support
- **Cons**: Requires internet, adds latency, depends on Tuya cloud availability
- **Not recommended** for Hive's local-only architecture

### Option C: Tuya Local (via HA built-in)
- **Integration**: Newer versions of HA have improved local Tuya support
- **How it works**: Auto-discovers Tuya devices on the LAN after initial cloud pairing
- **Status**: Still requires initial cloud setup for key exchange

## Recommended Approach for Hive
1. **Phase 0**: Confirm Homemate uses Tuya by checking the app/cloud platform
2. **Phase 2**: Install LocalTuya via HACS in the HA container
3. **One-time setup**: Extract `local_key` via Tuya IoT Developer Portal
4. **Configure**: Add each switch in HA with its local IP, device_id, and local_key
5. **Result**: Fully local control, no cloud dependency

## Key Extraction Steps
1. Create account at https://iot.tuya.com
2. Create a Cloud Project (select "Smart Home" industry)
3. Link your Smart Life / Homemate app account to the project
4. Go to "Devices" → find your switch → note the `device_id`
5. Use the API Explorer to get the `local_key`:
   - API: `GET /v1.0/devices/{device_id}`
   - The `local_key` field in the response is what you need
6. Note the device's local IP (from your router's DHCP table)

## Entity Mapping
- Each Homemate switch will appear as `switch.homemate_<name>` in HA
- DP (Data Point) mapping:
  - DP 1: Main switch (on/off)
  - DP 2-N: Additional switches if multi-gang
  - Some may have DP for LED indicator, countdown timer

## Risks
- Firmware OTA updates from Tuya can change the local_key → need to re-extract
- Some newer Tuya devices use protocol 3.4+ which may have different encryption
- LocalTuya is a community integration, not officially maintained by HA core team
