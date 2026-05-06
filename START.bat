@echo off
title NetworkIQ — LinkedIn Network Intelligence

echo.
echo  ██████████████████████████████████████████████
echo  ██   NetworkIQ — LinkedIn Network Tool       ██
echo  ██████████████████████████████████████████████
echo.

:: ── Start Backend (FastAPI) ──────────────────────────────────────
echo [1/2] Starting Backend API (FastAPI)...
start "NetworkIQ Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

:: Wait for backend to initialise
timeout /t 3 /nobreak > nul

:: ── Start Frontend (Vite) ────────────────────────────────────────
echo [2/2] Starting Frontend (React + Vite)...
start "NetworkIQ Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait for Vite to boot
timeout /t 4 /nobreak > nul

:: ── Open browser ─────────────────────────────────────────────────
echo.
echo  ✓ Opening http://localhost:3000 ...
echo.
start http://localhost:3000

echo  Both servers are running in separate windows.
echo  Close those windows to stop the app.
echo.
pause
