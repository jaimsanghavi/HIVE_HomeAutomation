# Competitive Survey

## Existing White-Label / Branded HA Approaches

### Home Assistant Itself
- Open source, Apache 2.0
- Has its own UI (Lovelace dashboards) — very powerful but developer-focused
- Not designed as a white-label product
- The "Home Assistant Green" box is HA's consumer hardware play — but it's still branded "Home Assistant"

### HOOBS (Homebridge Out Of Box)
- Commercial product that wraps Homebridge (HomeKit bridge)
- Custom UI on top of Homebridge
- Sells hardware (HOOBS Box) + software subscription
- **Approach**: Custom frontend + open source backend (similar to Hive's approach)
- **Lesson**: They focused on Apple HomeKit ecosystem, limited device support outside that

### Homey (by Athom)
- **Commercial product**, proprietary
- Hub-based, supports Z-Wave, Zigbee, Wi-Fi, IR, 433MHz
- Beautiful consumer UI
- €399 for Homey Pro
- **Lesson**: Premium pricing works if the UX is polished. Their UI is the competitive advantage.

### SmartThings (Samsung)
- Cloud-dependent (recently added Edge drivers for local)
- Free hub with some Samsung products
- Massive device ecosystem
- **Lesson**: Cloud dependency is their biggest weakness — users hate outages
- Hive's local-first is a differentiator

### OpenHAB
- Open source (Eclipse Public License)
- Java-based, runs on any platform
- Has a "Main UI" that's more consumer-friendly than HA's
- **Lesson**: Despite years of development, the UI never reaches consumer polish. UX matters.

### Hubitat
- Local-first (like Hive's approach)
- Sells hardware ($~130 for hub)
- Community-driven app ecosystem
- **Lesson**: Proves local-first is a viable market. Their UI is functional but not beautiful.

## Key Takeaways for Hive

| Insight | Source | Application |
|---------|--------|-------------|
| Local-first is a differentiator | SmartThings failures, Hubitat | Core architecture decision ✓ |
| UX is the moat | Homey vs OpenHAB | Invest in the branded UI |
| Hub hardware matters for consumers | Homey, Hubitat | Pi migration path is right |
| Don't fight device ecosystems | All competitors | Use HA's device support, don't rebuild |
| Subscription model is hard | HOOBS | Consider one-time pricing for hardware |
| White-labeling HA is novel | No one does this well | First-mover advantage |

## No Direct Competitor
Nobody currently offers a **white-labeled, local-first smart home platform built on HA** that:
- Hides HA completely from end users
- Provides a polished consumer UI
- Runs on commodity hardware (Pi)
- Supports the full HA device ecosystem

This is Hive's gap to fill.
