@echo off
cd /d %~dp0
echo Starting GATE CSE API Backend (MongoDB)...
echo.
echo Starting server on http://localhost:8001
echo API docs available at http://localhost:8001/docs
echo.
uvicorn standalone_main:app --host 0.0.0.0 --port 8001 --reload
pause
