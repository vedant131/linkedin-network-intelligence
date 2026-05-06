# ─────────────────────────────────────────────────────────────────
#  LinkedIn Network Intelligence Tool — One-Click Launcher
#  Run from the project root: .\start.ps1
# ─────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "`n🔗 LinkedIn Network Intelligence Tool" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# ── 1. Backend setup ─────────────────────────────────────────────
Write-Host "`n[1/4] Installing Python dependencies..." -ForegroundColor Yellow
Set-Location "$root\backend"
pip install -r requirements.txt -q

Write-Host "[2/4] Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path "$root\.env")) {
    Copy-Item "$root\.env.example" "$root\.env"
    Write-Host "      Created .env from .env.example (AI_MODE=offline)" -ForegroundColor DarkGray
}

# ── 2. Frontend setup ────────────────────────────────────────────
Write-Host "[3/4] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location "$root\frontend"
npm install --silent

# ── 3. Launch both servers ────────────────────────────────────────
Write-Host "[4/4] Starting servers..." -ForegroundColor Yellow
Set-Location $root

# Backend in a new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'FastAPI Backend — http://localhost:8000' -ForegroundColor Cyan; " +
    "Set-Location '$root\backend'; " +
    "python -m uvicorn main:app --reload --port 8000"
)

Start-Sleep -Seconds 2

# Frontend in a new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'React Frontend — http://localhost:3000' -ForegroundColor Cyan; " +
    "Set-Location '$root\frontend'; " +
    "npm run dev"
)

Write-Host "`n✅ Both servers launching..." -ForegroundColor Green
Write-Host "   Frontend → http://localhost:3000" -ForegroundColor White
Write-Host "   Backend  → http://localhost:8000" -ForegroundColor White
Write-Host "`n   Sample CSV is at: backend\data\sample_connections.csv" -ForegroundColor DarkGray
Write-Host "   Add OPENAI_API_KEY to .env for AI-powered classification`n" -ForegroundColor DarkGray

Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"
