#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir

Write-Host "🏠 Hive Platform — Bootstrap" -ForegroundColor Cyan
Write-Host "=============================="

# ── Check Docker ──
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    Write-Host "Ensure WSL2 backend is enabled."
    exit 1
}

try {
    docker info 2>&1 | Out-Null
} catch {
    Write-Host "❌ Docker daemon is not running. Start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is available" -ForegroundColor Green

# ── Setup .env ──
Set-Location $ProjectDir

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env from .env.example" -ForegroundColor Green
} else {
    Write-Host "✅ .env already exists (skipping)" -ForegroundColor Green
}

# ── Build and start services ──
Write-Host ""
Write-Host "Starting Hive platform..."
Write-Host ""

docker compose up --build -d

Write-Host ""
Write-Host "=============================="
Write-Host "✅ Hive platform is running!" -ForegroundColor Green
Write-Host ""
Write-Host "  Web UI:          http://localhost:3000"
Write-Host "  API Gateway:     http://localhost:8000"
Write-Host "  Home Assistant:  http://localhost:8123  (dev only)"
Write-Host "  MQTT Broker:     localhost:1883"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Complete HA onboarding at http://localhost:8123"
Write-Host "  2. Run: python3 scripts/seed-ha.py"
Write-Host "=============================="
