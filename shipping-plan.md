# Hive Smart Home — Shipping Plan

> **Status:** MVP codebase hardened & refactored. Ready for next phase.
> **Date:** May 2025

---

## Current State (What's Done)

### Infrastructure
- [x] Docker Compose stack: HA Core + MQTT + FastAPI Gateway + React Web + Simulator
- [x] Production Dockerfiles (`gateway/Dockerfile.prod`, `web/Dockerfile.prod`)
- [x] Production Docker Compose (`docker-compose.prod.yml`)
- [x] Nginx SPA serving with gzip, cache headers, security headers

### Gateway (FastAPI)
- [x] JWT auth (login + token refresh + WebSocket token validation)
- [x] Device/Room/Scene CRUD endpoints proxying HA
- [x] WebSocket relay with auth guard
- [x] CORS locked to specific origin
- [x] DeviceCommand action enum validation
- [x] Health check endpoint

### Web (React + Vite + TypeScript + Tailwind)
- [x] Material Design 3 token system (light/dark, elevation, shape, typography, motion)
- [x] Full navigation (NavigationRail desktop, NavigationBar mobile)
- [x] Dashboard with Quick Actions, Rooms summary, All Devices
- [x] Room list + Room detail pages
- [x] Device detail with brightness slider and temperature controls
- [x] Scenes page with empty state
- [x] Settings page (dark mode, language toggle)
- [x] Login page with JWT flow
- [x] Centralized TypeScript types (`types/index.ts`)
- [x] Custom hooks (`useDevices`, `useRooms`, `useRoomDevices`)
- [x] ErrorBoundary, Skeleton loaders, EmptyState, Snackbar, Dialog, FAB components
- [x] i18n (English, placeholder for more)

---

## Phase 1: Test & Stabilize (Week 1-2)

### 1.1 Automated Testing
- [ ] **Gateway unit tests** — pytest for each endpoint, auth flows, WebSocket relay
- [ ] **Gateway integration tests** — test against a mock HA instance
- [ ] **Web unit tests** — Vitest + React Testing Library for hooks, stores, utils
- [ ] **Web component tests** — test key flows (login → dashboard → toggle device)
- [ ] **E2E tests** — Playwright: login, toggle a device, navigate rooms, check device detail

### 1.2 Error Handling Polish
- [ ] Integrate `@tanstack/react-query` for data fetching (retry, cache, stale-while-revalidate)
- [ ] Add toast notifications on device command failures (use existing Snackbar)
- [ ] Handle WebSocket reconnect with exponential backoff
- [ ] Gateway: structured error responses with error codes

### 1.3 Performance Baseline
- [ ] Lighthouse audit (target: 90+ performance, 100 accessibility)
- [ ] Bundle analysis (`vite-plugin-visualizer`) — identify and tree-shake unused code
- [ ] Measure device toggle latency end-to-end (target: <200ms on LAN)

---

## Phase 2: Real Device Integration (Week 2-3)

### 2.1 Tula & Wiz Setup
- [ ] Configure Tula integration in HA (user will do this)
- [ ] Configure Wiz integration in HA (user will do this)
- [ ] Verify real devices appear through the gateway API
- [ ] Test toggle/brightness/temperature commands against real hardware
- [ ] Verify physical button press → UI state update within 1s

### 2.2 Device Pairing UX
- [ ] Add device discovery/pairing flow in Settings or a dedicated page
- [ ] Show connection status indicators on device cards
- [ ] Handle offline devices gracefully (gray out, show "Unavailable")

---

## Phase 3: Feature Completion (Week 3-4)

### 3.1 Scenes
- [ ] Scene creation UI (select devices, set states, name the scene)
- [ ] Scene activation from dashboard and scenes page
- [ ] Quick scene buttons on dashboard

### 3.2 Schedules
- [ ] Basic schedule creation (time-based device actions)
- [ ] Schedule list/edit/delete UI
- [ ] Gateway endpoints proxying HA automations for schedules

### 3.3 Dashboard Widgets
- [ ] Weather widget (if HA weather integration available)
- [ ] Energy summary card (defer detail to v2)
- [ ] "At a glance" section — active devices count, motion alerts, door status

### 3.4 PWA / Tablet Kiosk
- [ ] Add `manifest.json` for installable PWA
- [ ] Service worker for offline shell (app loads even if gateway is briefly unreachable)
- [ ] Tablet kiosk mode CSS (hide browser chrome, fullscreen layout)
- [ ] Splash screen and app icon

---

## Phase 4: Harden for Deployment (Week 4-5)

### 4.1 Security Audit
- [ ] Rate limiting on login endpoint
- [ ] Token rotation / refresh token flow
- [ ] Input sanitization on all gateway endpoints
- [ ] CSP headers in nginx
- [ ] HTTPS setup (self-signed cert for local, Let's Encrypt guide for Pi)

### 4.2 Raspberry Pi Deployment
- [ ] Test `docker-compose.prod.yml` on Raspberry Pi 4/5 (ARM64 images)
- [ ] Create setup script (`setup.sh`) — installs Docker, clones repo, generates secrets, brings up stack
- [ ] Write Pi deployment guide (README section)
- [ ] Performance test on Pi (memory, CPU, startup time)
- [ ] Systemd service for auto-start on boot

### 4.3 Observability
- [ ] Structured JSON logging in gateway
- [ ] Health check dashboard or status page
- [ ] Log rotation configuration

---

## Phase 5: Polish & Ship (Week 5-6)

### 5.1 Branding
- [ ] Replace all "Hive" placeholder branding with final brand name
- [ ] Custom app icon and favicon
- [ ] Branded login screen
- [ ] "About" page with version info

### 5.2 Documentation
- [ ] README with setup instructions, architecture diagram, dev workflow
- [ ] User guide (how to add devices, create scenes, use schedules)
- [ ] Contributing guide (for future devs)

### 5.3 CI/CD (Optional for v1)
- [ ] GitHub Actions: lint + type-check + test on PR
- [ ] Docker image build and push to GHCR on tag
- [ ] Automated Lighthouse CI

---

## v2 Roadmap (Post-Ship)

| Feature | Priority | Notes |
|---------|----------|-------|
| Mobile native app (React Native) | High | Share API layer |
| Cloud relay / remote access | High | Cloudflare Tunnel or Tailscale |
| Voice assistant integration | Medium | Alexa/Google via HA |
| Multi-home / multi-tenancy | Medium | Separate HA instances per home |
| Energy monitoring dashboard | Medium | HA energy integration |
| Complex automations UI | Low | Visual automation builder |
| User management (household) | Medium | Roles beyond admin |
| OTA firmware updates | Low | ESPHome OTA for custom devices |

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| HA breaking changes on update | High | Pin HA version, test before upgrading |
| Pi performance issues | Medium | Profile early, optimize Docker resource limits |
| Real device compatibility | Medium | Test each device type before committing to support |
| WebSocket reliability | Medium | Reconnect with backoff, optimistic UI updates |
| Single point of failure (Pi) | Low for v1 | Local-only is acceptable for v1; add redundancy in v2 |
