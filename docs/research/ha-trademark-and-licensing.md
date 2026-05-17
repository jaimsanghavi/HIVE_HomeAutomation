# Home Assistant Trademark & Licensing

## License: Apache 2.0
- Home Assistant Core is licensed under **Apache License 2.0**
- You CAN: use, modify, distribute, sublicense, use commercially
- You MUST: include the original copyright notice and license in any distribution
- You MUST: state changes made to the original code
- You CANNOT: use HA trademarks (name, logo) to imply endorsement

## Trademark Policy
- **"Home Assistant"** is a trademark of the Open Home Foundation
- You **cannot** use the HA name or logo in your product's branding
- You **can** say "powered by Home Assistant" or "compatible with Home Assistant" in technical docs (not user-facing)
- Our approach: HA is completely hidden from end users — no trademark concerns

## What This Means for Hive
1. **User-facing UI**: Zero HA branding — we're already compliant
2. **API responses**: Must not leak HA terminology — gateway strips all HA references
3. **Documentation**: Internal/developer docs can reference HA freely
4. **Docker image**: Using the official image is fine — it's Apache 2.0
5. **Source code**: If we distribute modified HA code, include Apache 2.0 notice
6. **Config files**: HA YAML config files are our own work, not HA's copyrighted code

## Dependencies on HA
- We depend on HA as a **runtime dependency** (Docker container), not as embedded code
- We don't modify HA source code — we use it as-is via its APIs
- This is analogous to using PostgreSQL or Redis — no license complications

## Action Items
- [x] Ensure zero HA branding in user-facing surfaces
- [x] Gateway API strips all HA-specific terminology
- [ ] Add Apache 2.0 attribution in project LICENSE if distributing any HA-derived config
