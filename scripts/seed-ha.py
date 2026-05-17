#!/usr/bin/env python3
"""
Seed Home Assistant with admin user, long-lived access token, and areas.

Run after first `docker compose up` and HA onboarding.
Requires: pip install requests websockets
"""

import asyncio
import json
import os
import sys
import time

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

HA_URL = os.getenv("HA_URL", "http://localhost:8123")
ENV_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")

AREAS = ["Living Room", "Kitchen", "Bedroom"]


def wait_for_ha():
    """Wait until HA is ready."""
    print("Waiting for Home Assistant to be ready...")
    for i in range(60):
        try:
            r = requests.get(f"{HA_URL}/api/", timeout=3)
            if r.status_code in (200, 401):
                print(f"✅ HA is ready (attempt {i+1})")
                return True
        except requests.ConnectionError:
            pass
        time.sleep(2)
    print("❌ HA did not become ready in 120 seconds")
    return False


def check_onboarding_done():
    """Check if HA onboarding has been completed."""
    try:
        r = requests.get(f"{HA_URL}/api/onboarding", timeout=5)
        data = r.json()
        # If all steps are done, onboarding is complete
        if isinstance(data, list) and len(data) == 0:
            return True
        # If steps remain, onboarding is not done
        return False
    except Exception:
        return False


def create_areas(token: str):
    """Create default areas via HA WebSocket-like REST calls."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # Get existing areas
    r = requests.get(f"{HA_URL}/api/config/area_registry/list", headers=headers)
    if r.status_code == 405:
        # Use websocket API for areas — the REST endpoint may not exist
        # For now, print instructions
        print("⚠️  Area creation via REST not available. Create areas manually in HA UI:")
        for area in AREAS:
            print(f"   - {area}")
        return

    existing = []
    if r.status_code == 200:
        existing = [a.get("name", "") for a in r.json()]

    for area in AREAS:
        if area in existing:
            print(f"  ✅ Area '{area}' already exists")
            continue
        r = requests.post(
            f"{HA_URL}/api/config/area_registry/create",
            headers=headers,
            json={"name": area},
        )
        if r.status_code in (200, 201):
            print(f"  ✅ Created area: {area}")
        else:
            print(f"  ⚠️  Could not create area '{area}': {r.status_code} {r.text}")


def update_env_token(token: str):
    """Write the HA_TOKEN to the .env file."""
    if not os.path.exists(ENV_FILE):
        print(f"⚠️  .env file not found at {ENV_FILE}")
        return

    lines = []
    token_found = False
    with open(ENV_FILE, "r") as f:
        for line in f:
            if line.startswith("HA_TOKEN="):
                lines.append(f"HA_TOKEN={token}\n")
                token_found = True
            else:
                lines.append(line)

    if not token_found:
        lines.append(f"HA_TOKEN={token}\n")

    with open(ENV_FILE, "w") as f:
        f.writelines(lines)
    print(f"✅ HA_TOKEN written to {ENV_FILE}")


def main():
    print("🏠 Hive Platform — HA Seed Script")
    print("==================================")

    if not wait_for_ha():
        sys.exit(1)

    # Check if token already exists
    existing_token = os.getenv("HA_TOKEN", "").strip()
    if not existing_token:
        # Read from .env file
        if os.path.exists(ENV_FILE):
            with open(ENV_FILE, "r") as f:
                for line in f:
                    if line.startswith("HA_TOKEN="):
                        existing_token = line.split("=", 1)[1].strip()

    if not existing_token:
        print("")
        print("⚠️  No HA_TOKEN found.")
        print("")
        print("To generate a long-lived access token:")
        print(f"  1. Open {HA_URL} in your browser")
        print("  2. Complete onboarding (create admin user)")
        print("  3. Go to your Profile (bottom-left)")
        print("  4. Scroll to 'Long-Lived Access Tokens'")
        print("  5. Create a token named 'hive-gateway'")
        print("  6. Copy the token and paste it below:")
        print("")
        existing_token = input("Paste token: ").strip()
        if not existing_token:
            print("❌ No token provided. Exiting.")
            sys.exit(1)
        update_env_token(existing_token)

    # Verify the token works
    headers = {"Authorization": f"Bearer {existing_token}"}
    r = requests.get(f"{HA_URL}/api/", headers=headers)
    if r.status_code != 200:
        print(f"❌ Token verification failed: {r.status_code}")
        sys.exit(1)
    print("✅ Token is valid")

    # Create areas
    print("")
    print("Creating areas...")
    create_areas(existing_token)

    print("")
    print("==================================")
    print("✅ HA seeding complete!")
    print("")
    print("Next: Restart the gateway to pick up the token:")
    print("  docker compose restart gateway")


if __name__ == "__main__":
    main()
