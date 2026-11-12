@echo off
setlocal enabledelayedexpansion

title GATE CSE - Backend Server
cd /d %~dp0

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║         GATE CSE PYQ App - Backend Startup              ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM ── Step 1: Check Python ──────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found in PATH. Please install Python 3.11+
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do echo [OK] %%v found

REM ── Step 2: Install dependencies ─────────────────────────────
echo.
echo [INFO] Checking backend dependencies...
python -c "import fastapi, uvicorn, pydantic" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing backend requirements...
    pip install fastapi uvicorn[standard] pydantic pydantic-settings python-dotenv python-multipart
)
echo [OK] Backend dependencies ready

REM ── Step 3: Build seed_questions.json if needed ──────────────
if not exist seed_questions.json (
    echo.
    echo [INFO] Extracting questions from frontend seed data...
    python scripts\extract_seed_data.py
    if errorlevel 1 (
        echo [ERROR] Failed to extract seed data
        pause
        exit /b 1
    )
) else (
    echo [OK] seed_questions.json exists
)

REM ── Step 4: Check Google API key ────────────────────────────
echo.
python -c "
import os; from dotenv import load_dotenv; load_dotenv()
key = os.getenv('GOOGLE_API_KEY','')
if key and key != 'your_google_api_key_here':
    print('[OK] Google API key found - AI features enabled')
else:
    print('[WARN] No Google API key - Ask AI tab will show instructions')
    print('       Get a free key at: https://aistudio.google.com/apikey')
    print('       Then add to backend/.env: GOOGLE_API_KEY=your_key')
"

REM ── Step 5: Start the standalone backend ────────────────────
echo.
echo [INFO] Starting GATE CSE backend on http://localhost:8001
echo [INFO] API docs: http://localhost:8001/docs
echo [INFO] Press Ctrl+C to stop
echo.

uvicorn standalone_main:app --host 0.0.0.0 --port 8001 --reload

pause
