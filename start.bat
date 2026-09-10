@echo off
TITLE Forensic-NVR Evidence Intelligence Platform
color 0B

echo ==============================================================================
echo    UNIFIED MULTI-VENDOR DVR/NVR FORENSIC INTELLIGENCE PLATFORM (ISO 27037)
echo ==============================================================================
echo.

echo [1/3] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo [2/3] Checking Node.js environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Full-Stack Services...
echo.
echo   * Backend API:       http://127.0.0.1:8000
echo   * Interactive Docs:  http://127.0.0.1:8000/docs
echo   * React Frontend:    http://127.0.0.1:5173
echo.
echo Launching backend server in background window...
start "Forensic Backend API (Port 8000)" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo Launching frontend dev server in background window...
start "Forensic Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================================================
echo Platform services launched successfully!
echo Open your browser at: http://127.0.0.1:5173 or http://127.0.0.1:8000
echo ==============================================================================
echo.
pause
