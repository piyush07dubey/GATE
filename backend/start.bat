@echo off
cd /d %~dp0
echo Starting GATE CSE API Backend (MongoDB)...
echo.
echo Starting server on http://localhost:8001
echo API docs available at http://localhost:8001/docs
echo.
if exist .venv\Scripts\python.exe (
    .\.venv\Scripts\python.exe -m uvicorn standalone_main:app --host 127.0.0.1 --port 8001 --reload
) else (
    python -m uvicorn standalone_main:app --host 127.0.0.1 --port 8001 --reload
)
pause
