# Smart Home Platform — MVP Build Plan
**Local-first build, agent-driven, laptop → Raspberry Pi migration path**

> Replace `<YourBrand>` throughout with your actual brand name before kickoff.

---

## 1. Mission & Scope

### MVP goal
Ship a locally-running, white-labeled smart home platform that:
- Runs entirely on the developer's Mac/Windows laptop during build (no cloud, no Pi yet).
- Uses Home Assistant Core as the backend (unbranded, hidden from end users).
- Exposes a branded web/tablet UI that controls switches.
- Supports both simulated devices (for dev) and at least one real device (Shelly or Sonoff) before MVP signoff.
- Is packaged so it can be moved to a Raspberry Pi with minimal config changes.

### In scope (MVP)
- Local-only operation. No remote/cloud access.
- Web UI optimized for tablet (kiosk mode) and desktop browser.
- On/off control + dimming for compatible switches.
- Scenes and basic schedules.
- Manual button override on real devices (must work even if the network drops).
- Device pairing/onboarding flow inside the branded UI.
- Local user authentication (admin + household users).

### Out of scope (MVP — defer to v2)
- Mobile native app (iOS/Android).
- Cloud relay / remote access.
- Multi-home / multi-tenancy.
- Voice assistants (Alexa, Google).
- Energy monitoring dashboards.
- Automations beyond simple schedules.

### Success criteria
1. From a fresh laptop, a single command brings up the full stack.
2. The branded UI shows zero "Home Assistant" branding, logos, or terminology to end users.
3. A simulated switch can be toggled from the UI in under 200 ms (local LAN).
4. One real device (Shelly Plus 1 or ESPHome-flashed Sonoff) integrates and works end-to-end.
5. Physical button press on the real device updates UI state within 1 second.
6. The entire system can be exported as a Docker stack and started on a Raspberry Pi 4/5.

---

## 2. Architecture (MVP, local-only)

```
┌─────────────────────────────────────────────────────────────┐
│                  Developer Laptop (Mac/Win)                 │
│                                                             │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐  │
│  │  Branded UI  │◄──►│  API Gateway  │◄──►│ Home         │  │
│  │  (Web/Tablet)│ WS │  (thin proxy) │ WS │ Assistant    │  │
│  │              │    │               │    │ Core         │  │
│  └──────────────┘    └───────────────┘    └──────┬───────┘  │
│                                                  │          │
│                              ┌───────────────────┼────────┐ │
│                              ▼                   ▼        │ │
│                       ┌─────────────┐    ┌──────────────┐ │ │
│                       │  Simulated  │    │  MQTT Broker │ │ │
│                       │  Devices    │    │  (Mosquitto) │ │ │
│                       └─────────────┘    └──────┬───────┘ │ │
└──────────────────────────────────────────────────┼────────┘ │
                                                   │          │
                                          ┌────────▼────────┐ │
                                          │ Real Device     │ │
                                          │ (Shelly / ESP)  │ │
                                          │ on LAN          │ │
                                          └─────────────────┘ │
                                                              │
                                            Same physical LAN ┘
```

**Why an API Gateway in front of HA?**
A thin proxy (Node/Fastify or Python/FastAPI) sits between the UI and HA, doing three jobs:
1. Hides HA entirely — frontend never knows HA exists.
2. Translates HA's data model into your own domain model (`Device`, `Room`, `Scene`).
3. Becomes the place you'll later add cloud auth, customer accounts, etc., without changing the frontend.

It's optional for MVP — the frontend *could* talk to HA directly — but adding it later is painful. Build it now, keep it thin.

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Home Assistant Core (Docker) | Open source, huge device support, Apache 2.0 |
| Message bus | Mosquitto (MQTT) | Standard for ESPHome / Shelly / Sonoff local |
| API Gateway | FastAPI (Python) or Fastify (Node) | Thin, fast, easy to deploy; pick what your team knows |
| Web UI | React + Vite + TypeScript | Largest ecosystem, easy tablet PWA |
| UI styling | Tailwind CSS | Fast to brand, easy to theme later |
| State/data | TanStack Query + Zustand | Handles WebSocket + local state cleanly |
| Device firmware | ESPHome (for Sonoff, custom ESP32) | Same team as HA, Apache 2.0, native integration |
| Real device (off-shelf) | Shelly Plus 1 / Plus 1PM | Best local API, no flashing needed |
| Packaging | Docker Compose | Cross-platform, lifts to Pi cleanly |
| Containers on Mac | Docker Desktop or OrbStack | OrbStack is faster |
| Containers on Win | Docker Desktop (WSL2 backend) | Standard |

---

## 4. Repository Structure

```
yourbrand-platform/
├── README.md
├── docker-compose.yml          # full stack, local
├── docker-compose.pi.yml       # Pi-specific overrides (Phase 6)
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── research/               # output from research subagent
│   └── runbooks/
├── homeassistant/
│   ├── config/                 # HA configuration.yaml etc.
│   └── README.md
├── mqtt/
│   └── mosquitto.conf
├── gateway/                    # API gateway service
│   ├── src/
│   ├── tests/
│   └── Dockerfile
├── web/                        # branded UI
│   ├── src/
│   ├── public/
│   └── Dockerfile
├── firmware/
│   ├── esphome/                # ESPHome YAMLs
│   └── README.md
├── simulators/
│   └── virtual-devices/        # MQTT-based fake switches
├── scripts/
│   ├── bootstrap.sh            # one-command setup
│   ├── seed-ha.py              # create HA admin user, tokens, areas
│   └── ...
└── tests/
    └── e2e/
```

---

## 5. Agent System Design

### Orchestrator (lead agent)
**Role:** Reads this plan, executes phases in order, dispatches subagents per task, integrates their outputs, maintains a running `PROJECT_STATUS.md` at the repo root.

**Responsibilities:**
- Maintain a task queue derived from the phased plan in Section 7.
- For each task, select the subagent, prepare its input spec, and review its output against the task's success criteria.
- Reject and re-dispatch on failure with clearer constraints.
- After each phase, run the phase's exit checklist before moving on.
- Never skip phases. Never start a phase whose prerequisites aren't green.

**Tools:** file system, shell, git, docker, web search, the subagents themselves.

### Subagents (specialists)
Each subagent has a tight charter, a defined input contract, and a defined output contract. They do not start work without a written spec from the orchestrator and they do not finish until their success criteria pass.

| # | Subagent | Primary deliverable |
|---|---|---|
| 1 | Research & Discovery | `docs/research/*.md` |
| 2 | Environment & Repo Setup | working `docker-compose up`, seeded repo |
| 3 | HA Backend & Device Sim | HA config + virtual devices + auth tokens |
| 4 | API Gateway | running service exposing branded API |
| 5 | Web/Tablet UI | branded web app at `localhost:3000` |
| 6 | Device Firmware & Integration | ESPHome YAMLs + one real device working |
| 7 | Packaging & Pi Migration | Pi-ready Docker stack + migration runbook |
| 8 | QA & Integration Testing | E2E test suite + green CI |

Detailed charters are in Section 6.

### Communication protocol
- All cross-agent communication is **file-based** in the repo (no in-memory state).
- Each task gets a spec file: `docs/tasks/TASK-XXX.md` (orchestrator writes it, subagent reads it, subagent appends results).
- Each subagent writes a `HANDOFF.md` at the end of its work describing what it built, what it didn't, and what surprises came up.
- The orchestrator updates `PROJECT_STATUS.md` after every task.

---

## 6. Subagents — Detailed Charters

### Subagent 1 — Research & Discovery
**Mission:** De-risk every other subagent by producing decision-ready research notes before they start.

**Inputs:** This plan.

**Outputs (all in `docs/research/`):**
- `ha-api-reference.md` — HA REST + WebSocket API, auth, key endpoints used by this project, code examples.
- `ha-trademark-and-licensing.md` — what you can/can't do with HA branding, Apache 2.0 obligations.
- `esphome-overview.md` — flashing flow, device YAML structure, OTA mechanism.
- `shelly-local-api.md` — Shelly Plus local API (no cloud, no MQTT broker needed but MQTT supported).
- `sonoff-flashing-guide.md` — which Sonoff models can be flashed, how, what cannot.
- `competitive-survey.md` — quick notes on Homey, SmartThings, OpenHAB UI projects, anything already doing white-label HA.

**Success criteria:** Every other subagent can start without needing to do its own research detour.

**Do NOT:** Write any code. This subagent is read + summarize only.

---

### Subagent 2 — Environment & Repo Setup
**Mission:** Make `git clone && ./scripts/bootstrap.sh && docker compose up` work on a fresh Mac and a fresh Windows machine.

**Inputs:** Research notes from Subagent 1.

**Outputs:**
- Repo skeleton matching Section 4.
- `docker-compose.yml` running: HA Core, Mosquitto, API Gateway stub, Web UI stub.
- `scripts/bootstrap.sh` (bash) + `scripts/bootstrap.ps1` (PowerShell) — install Docker check, copy `.env`, run compose.
- `scripts/seed-ha.py` — creates HA admin user, generates long-lived access token, writes it to `.env`, configures basic areas (Living Room, Kitchen, Bedroom).
- `README.md` with platform-specific gotchas (Docker Desktop vs OrbStack, WSL2, port conflicts).
- `.gitignore`, `.env.example`, `LICENSE` (placeholder).

**Success criteria:**
- Fresh Mac: bootstrap completes in under 10 min, all services healthy.
- Fresh Windows: same.
- Idempotent: running bootstrap twice doesn't break anything.

---

### Subagent 3 — HA Backend & Device Simulation
**Mission:** Configure HA so it has a usable state of the world from day one, including simulated devices to develop the UI against without buying hardware.

**Inputs:** Working environment from Subagent 2.

**Outputs:**
- `homeassistant/config/configuration.yaml` and friends — minimal, no Lovelace dashboards (we hide HA's UI).
- 8–12 simulated devices via MQTT-published virtual switches in `simulators/virtual-devices/`:
  - 6 on/off switches across the 3 areas.
  - 2 dimmable lights.
  - 1 motion sensor.
  - 1 thermostat (for future-proofing the data model).
- Areas, device classes, friendly names all configured.
- Long-lived access token issued and stored.
- Documentation: `homeassistant/README.md` explaining what's configured and how to extend.

**Success criteria:**
- HA WebSocket API returns all simulated devices.
- Each simulated switch can be toggled via API and the state change is observable.
- HA's own frontend remains reachable on `:8123` for *developer debugging only*, not for end users.

---

### Subagent 4 — API Gateway
**Mission:** Build the thin proxy that the frontend talks to. Frontend never knows HA exists.

**Inputs:** HA running with simulated devices, access token in `.env`.

**Outputs:**
- `gateway/` service (FastAPI recommended for fastest iteration; Node/Fastify if team prefers).
- REST endpoints:
  - `GET /api/devices` → list of devices in branded schema.
  - `GET /api/devices/:id`
  - `POST /api/devices/:id/command` → `{action: "on"|"off"|"set_brightness", value?}`
  - `GET /api/rooms`
  - `GET /api/scenes`, `POST /api/scenes/:id/activate`
  - `POST /api/auth/login`, `POST /api/auth/logout`
- WebSocket endpoint `/ws` for real-time state updates pushed from HA, re-serialized into branded schema.
- Dockerfile, basic unit tests, OpenAPI spec auto-generated.

**Mapping rules (HA → branded):**
- HA `entity_id` → branded `device.id`
- HA `state` → branded `device.power` ("on"/"off") + `device.brightness`
- HA `area_id` → branded `room.id`
- Hide everything else (HA-specific attributes, integration names, etc.)

**Success criteria:**
- Postman/curl can list and control simulated devices via the gateway.
- WebSocket pushes a state update within 200 ms of an HA state change.
- Zero references to "Home Assistant" or HA-specific terminology in the gateway's public API or responses.

---

### Subagent 5 — Web/Tablet UI
**Mission:** Build the branded UI customers will actually see. Must look like a product, not a developer tool.

**Inputs:** Working API Gateway, brand color/logo placeholders (define a `theme.ts` with CSS variables so brand can be swapped later).

**Outputs:**
- React + Vite + TypeScript app in `web/`.
- Screens:
  - Login.
  - Home dashboard (rooms as cards, primary devices visible).
  - Room detail (all devices in that room).
  - Device detail (full controls).
  - Scenes screen.
  - Settings (users, device pairing entry point).
- PWA manifest so it installs as a kiosk app on a tablet.
- Responsive: phone, tablet portrait, tablet landscape, desktop.
- Optimistic UI updates with WebSocket reconciliation.
- All copy in a single `i18n/en.json` so translation is easy later.

**Brand constraints:**
- Single `theme.ts` for all colors, radii, fonts.
- No mention of Home Assistant anywhere visible.
- Logo placeholder swappable via one file.

**Success criteria:**
- All simulated devices controllable from the UI.
- Toggling a switch in the UI updates state in HA within 200 ms.
- A state change from HA (simulated external event) updates the UI within 1 second.
- Tablet (iPad or Android tablet on the LAN) can open the URL and use the UI fluidly.

---

### Subagent 6 — Device Firmware & Real Device Integration
**Mission:** Get one real physical device working end-to-end. This is the proof MVP isn't a toy.

**Inputs:** Working stack with simulated devices.

**Outputs:**
- ESPHome YAML templates in `firmware/esphome/`:
  - `sonoff-basic-r2.yaml` (flashable Sonoff with physical button override).
  - `esp32-generic-switch.yaml` (template for own-brand hardware later).
- Shelly Plus 1 integration: documented setup (no flashing needed — uses its local MQTT or HTTP API).
- Documentation: `firmware/README.md` with flashing instructions, physical button behavior, OTA notes.
- A short demo script/video instructions showing: button on the physical device → light toggles → UI reflects change.

**Hardware to acquire for this phase:**
- 1× Shelly Plus 1 (preferred — no flashing, ~$15).
- 1× Sonoff Basic R2 or Mini R2 (for the flashing flow).
- 1× USB-to-serial adapter (FTDI) if flashing Sonoff via UART.

**Success criteria:**
- Shelly Plus 1 controllable from the branded UI.
- Flashed Sonoff controllable from the branded UI.
- Physical button on either device works *with the WiFi disconnected*. (Disconnect the laptop's WiFi to the IoT VLAN and confirm.)
- When WiFi reconnects, UI state syncs correctly.

---

### Subagent 7 — Packaging & Pi Migration
**Mission:** Make the system Pi-ready without rewriting it.

**Inputs:** Fully working stack on the laptop.

**Outputs:**
- `docker-compose.pi.yml` — overrides for ARM64 images, Pi-specific volume paths, USB device passthrough (for future Zigbee dongles).
- `docs/runbooks/pi-migration.md` — step-by-step:
  1. Flash Raspberry Pi OS Lite 64-bit.
  2. Install Docker + Compose.
  3. Clone repo, run Pi bootstrap script.
  4. Restore HA snapshot exported from laptop.
  5. Reconfigure devices to point at Pi's IP.
- `scripts/export-snapshot.sh` — exports HA config + MQTT retained state.
- `scripts/import-snapshot.sh` — imports on the Pi.

**Success criteria:**
- A Pi 4 (4GB+) with the migration runbook executed runs the full stack within 30 minutes from blank SD card.
- All devices (simulated + real) work identically to laptop.

**Pi alternatives to evaluate in the runbook:**
- Raspberry Pi 5 (8GB) — preferred for headroom.
- Home Assistant Green — pre-built, but locks you to their OS.
- Mini PC (Intel N100) — overkill for one home, but faster and more reliable; consider for a "premium tier" SKU.

---

### Subagent 8 — QA & Integration Testing
**Mission:** Keep the orchestrator honest. Define and run the tests that prove each phase exit is real.

**Inputs:** Every other subagent's deliverables.

**Outputs:**
- `tests/e2e/` — Playwright tests for the UI (login → toggle device → assert state).
- `gateway/tests/` — pytest or vitest for API contracts.
- A device-control smoke test that exercises the full path: UI → Gateway → HA → MQTT → simulated device → state back to UI.
- A CI workflow (`.github/workflows/ci.yml`) that runs all tests on every push.
- `docs/test-plan.md` — what's tested, what isn't, known gaps.

**Success criteria:**
- All tests green at every phase exit.
- Catches a regression introduced deliberately (orchestrator should plant one to verify QA actually works).

---

## 7. Phased Execution Plan

The orchestrator works through these phases in order. Each phase has an **entry condition** (must be true to start) and an **exit checklist** (must all be green to advance).

### Phase 0 — Research (Subagent 1)
**Entry:** This plan exists, brand placeholder agreed.
**Exit checklist:**
- [ ] All research docs in `docs/research/` exist and are non-trivial.
- [ ] Trademark/licensing notes reviewed by the human owner.
- [ ] Hardware shopping list confirmed.

**Estimated effort:** 1–2 days of agent time.

---

### Phase 1 — Environment up (Subagent 2)
**Entry:** Phase 0 exit checklist green.
**Exit checklist:**
- [ ] `docker compose up` runs clean on Mac.
- [ ] `docker compose up` runs clean on Windows.
- [ ] `bootstrap.sh`/`.ps1` are idempotent.
- [ ] HA reachable on `:8123`, MQTT on `:1883`, gateway stub on `:8000`, web stub on `:3000`.

---

### Phase 2 — HA + simulated devices (Subagent 3)
**Entry:** Phase 1 exit green.
**Exit checklist:**
- [ ] All 8–12 simulated devices visible in HA.
- [ ] Each can be toggled via HA WebSocket API using the seeded token.
- [ ] Areas configured correctly.

---

### Phase 3 — API Gateway (Subagent 4)
**Entry:** Phase 2 exit green.
**Exit checklist:**
- [ ] All gateway endpoints return correct branded data.
- [ ] WebSocket relays HA state changes.
- [ ] No "Home Assistant" string in any gateway response or schema.
- [ ] Gateway tests green.

---

### Phase 4 — Web/Tablet UI (Subagent 5)
**Entry:** Phase 3 exit green.
**Exit checklist:**
- [ ] All simulated devices controllable from UI.
- [ ] UI responsive on phone/tablet/desktop.
- [ ] Theme swap test: change brand color in `theme.ts`, every screen reflects it.
- [ ] PWA installs on tablet.

---

### Phase 5 — Real device integration (Subagent 6)
**Entry:** Phase 4 exit green, hardware acquired.
**Exit checklist:**
- [ ] Shelly Plus 1 controllable from UI.
- [ ] Sonoff (ESPHome-flashed) controllable from UI.
- [ ] Physical button works with WiFi disconnected.
- [ ] State syncs on WiFi reconnect.

---

### Phase 6 — Pi migration dry run (Subagent 7)
**Entry:** Phase 5 exit green.
**Exit checklist:**
- [ ] Pi runs the stack.
- [ ] All real and simulated devices work on Pi.
- [ ] Migration runbook validated by a second person following it from scratch.

---

### Phase 7 — Hardening (Subagent 8 + all)
**Entry:** Phase 6 exit green.
**Exit checklist:**
- [ ] E2E test suite green in CI.
- [ ] Documented known limitations.
- [ ] One-page demo script for showing the MVP to stakeholders.

**MVP done.**

---

## 8. Testing & Validation Strategy

- **Unit tests** in the gateway and any UI components with logic.
- **Contract tests** between gateway and HA (mock HA, verify gateway behavior).
- **E2E tests** with Playwright, run against the real local stack.
- **Manual smoke test** at every phase exit (10-minute checklist the orchestrator runs).
- **WiFi-down test** specifically for real devices — easy to forget, critical.

---

## 9. Migration Path Beyond MVP (informational, not in scope)

Once the local MVP is green, the natural v2 work:
1. **Cloud relay** — add a tunnel (WireGuard / Tailscale / Cloudflare Tunnel) and a thin VPS so the branded app can reach the home from anywhere. The gateway becomes the auth boundary.
2. **Mobile app** — React Native sharing the gateway client code.
3. **Per-customer provisioning** — each Pi auto-registers to your cloud on first boot with a unique device key.
4. **Fleet management** — admin dashboard for your team: which homes are healthy, what firmware version, push OTA.

The architecture in Section 2 is deliberately designed so none of these break the MVP code — they're additive.

---

## 10. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| HA upstream changes break the gateway | Pin HA version; upgrade quarterly in a branch |
| Sonoff hardware revision unflashable | Buy 2–3 different SKUs in Phase 5; document which work |
| WiFi/MQTT timing flakiness on Pi | Use wired ethernet during dev; document WiFi best practices |
| Brand trademark conflict | Run a trademark search before naming finalization |
| Customer doesn't have stable WiFi | Spec the installer kit to include a small dedicated IoT router |

**Open questions for the human owner before kickoff:**
- Final brand name and trademark status?
- Mac, Windows, or both for primary dev machine?
- Will you self-host the GitHub repo or use GitHub.com / GitLab?
- Budget for hardware in Phase 5 (~$50–$100)?
- Who is the second person doing the Pi migration dry run (Phase 6)?

---

## Appendix A — Suggested orchestrator prompt skeleton

> You are the Orchestrator for the `<YourBrand>` smart home MVP. Your job is to execute the phased plan in `mvp-build-plan.md`. For each task: write a spec to `docs/tasks/TASK-XXX.md`, dispatch the correct subagent, review their `HANDOFF.md` against the success criteria, and update `PROJECT_STATUS.md`. Never advance phases without the exit checklist green. When uncertain, ask the human owner via a question logged in `docs/questions/OPEN.md` and pause.

## Appendix B — Suggested subagent prompt skeleton

> You are Subagent `<N>` (`<name>`) for the `<YourBrand>` MVP. Your charter is Section 6.`<N>` of `mvp-build-plan.md`. Read your task spec at `docs/tasks/TASK-XXX.md`. Do only what's in the charter. When done, write `HANDOFF.md` in your subdirectory describing what you built, what you didn't, surprises, and any followups. Do not start work outside your charter without an explicit new task spec.

---

*End of plan. Version 0.1. Update this document as the project evolves.*
