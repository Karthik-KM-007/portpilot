@echo off
title PortPilot AI Launcher
echo.
echo  ====================================
echo   PortPilot AI - Starting Application
echo  ====================================
echo.

:: Start Backend
echo [1/2] Starting Backend on http://127.0.0.1:8000 ...
start "PortPilot Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe run_server.py"

:: Wait a moment for backend to boot
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Frontend on http://localhost:5173 ...
start "PortPilot Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Wait then open browser
timeout /t 4 /nobreak >nul
echo.
echo  Opening browser...
start http://localhost:5173

echo.
echo  Both servers are running!
echo  Backend:  http://127.0.0.1:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://127.0.0.1:8000/docs
echo.
pause
