@echo off
title LinguaHub Server
echo ===================================
echo   LinguaHub - Khoi dong may chu
echo ===================================
echo.

cd /d "%~dp0"

:: Kiem tra Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Node.js chua duoc cai dat!
    echo Vui long tai Node.js tu https://nodejs.org
    pause
    exit /b 1
)

:: Kiem tra node_modules
if not exist "node_modules" (
    echo [INFO] Dang cai dat thu vien...
    npm install
    echo.
)

echo [OK] Dang khoi dong may chu tai http://localhost:3000
echo [OK] Mo trinh duyet va truy cap: http://localhost:3000/login.html
echo.
echo Nhan Ctrl+C de dung may chu
echo ===================================
echo.

node server.js

pause
