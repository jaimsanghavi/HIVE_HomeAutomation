#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🏠 Hive Platform — Bootstrap"
echo "=============================="

# ── Check Docker ──
if ! command -v docker &>/dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "Install one of:"
    echo "  • OrbStack (Mac, recommended): https://orbstack.dev/"
    echo "  • Docker Desktop: https://www.docker.com/products/docker-desktop/"
    echo ""
    exit 1
fi

if ! docker info &>/dev/null; then
    echo "❌ Docker daemon is not running. Start Docker Desktop or OrbStack first."
    exit 1
fi

echo "✅ Docker is available"

# ── Check Docker Compose ──
if docker compose version &>/dev/null; then
    COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
    COMPOSE="docker-compose"
else
    echo "❌ Docker Compose is not available."
    exit 1
fi

echo "✅ Docker Compose is available"

# ── Setup .env ──
cd "$PROJECT_DIR"

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
else
    echo "✅ .env already exists (skipping)"
fi

# ── Build and start services ──
echo ""
echo "Starting Hive platform..."
echo ""

$COMPOSE up --build -d

echo ""
echo "=============================="
echo "✅ Hive platform is running!"
echo ""
echo "  Web UI:          http://localhost:${WEB_PORT:-3000}"
echo "  API Gateway:     http://localhost:${GATEWAY_PORT:-8000}"
echo "  Home Assistant:  http://localhost:${HA_PORT:-8123}  (dev only)"
echo "  MQTT Broker:     localhost:${MQTT_PORT:-1883}"
echo ""
echo "Next steps:"
echo "  1. Complete HA onboarding at http://localhost:${HA_PORT:-8123}"
echo "  2. Run: python3 scripts/seed-ha.py"
echo "=============================="
