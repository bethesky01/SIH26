#!/usr/bin/env bash
# Saboot Netra - CCTV Evidence Intelligence Platform
# Quick start script for Linux / macOS / WSL

set -e

echo "=============================================================================="
echo "   SABOOT NETRA • CCTV/DVR FORENSIC INTELLIGENCE PLATFORM (ISO 27037)"
echo "=============================================================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed or not in PATH!"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH!"
    exit 1
fi

echo "[1/2] Starting Backend API on http://127.0.0.1:8000..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "[2/2] Starting Frontend Vite Dev Server on http://127.0.0.1:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "=============================================================================="
echo "Platform services launched successfully!"
echo "Backend:  http://127.0.0.1:8000 (Swagger: http://127.0.0.1:8000/docs)"
echo "Frontend: http://127.0.0.1:5173"
echo "Press Ctrl+C to terminate both servers."
echo "=============================================================================="

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
