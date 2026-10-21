@echo off
TITLE AI Crime Analytics System - Local Server Launcher
COLOR 0B
echo ================================================================
echo    AI CRIME ANALYTICS SYSTEM - LOCAL WINDOWS LAUNCHER
echo    Data Analytics, Machine Learning & Predictive Crime Intelligence
echo ================================================================
echo.

:: 1. Check Python installation
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not added to your PATH.
    echo Please install Python 3.10+ from python.org and check "Add Python to PATH".
    pause
    exit /b 1
)

echo [1/4] Found Python installation.
echo [2/4] Setting up Python virtual environment (venv)...
if not exist "venv" (
    python -m venv venv
)

call venv\Scripts\activate.bat

echo [3/4] Installing / verifying dependencies from requirements.txt...
pip install -r requirements.txt --quiet

echo [4/4] Initializing database and starting local server...
echo.
echo ================================================================
echo    APPLICATION IS RUNNING!
echo    Open your browser and navigate to:
echo    http://127.0.0.1:5000
echo ================================================================
echo.
python app.py
pause
