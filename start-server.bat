@echo off
setlocal
title LinguaHub Server
cd /d "%~dp0"

echo ===================================
echo   LinguaHub - Khoi dong may chu
echo ===================================
echo.

:: Cau hinh phien ban Node.js Portable de tai ve
set NODE_VER=v20.12.2
set NODE_URL=https://nodejs.org/dist/%NODE_VER%/node-%NODE_VER%-win-x64.zip
set LOCAL_NODE_DIR=%~dp0.bin\node

:: 1. Kiem tra xem may da co Node.js chua
set HAS_NODE=0
where node >nul 2>nul
if %errorlevel% equ 0 set HAS_NODE=1

:: Uu tien dung Node.js Portable neu da tai ve tu truoc do
if exist "%LOCAL_NODE_DIR%\node.exe" (
    set HAS_NODE=1
    set "PATH=%LOCAL_NODE_DIR%;%PATH%"
)

:: 2. Neu chua co Node.js -> Tu dong tai ban Portable
if %HAS_NODE% equ 0 (
    echo [INFO] May tinh chua cai dat Node.js.
    echo [INFO] He thong se tu dong tai ban Portable de chay ^(chi phai tai 1 lan duy nhat^)...
    
    if not exist "%~dp0.bin" mkdir "%~dp0.bin"
    
    echo [1/2] Dang tai Node.js %NODE_VER%... ^(Khoang 30MB, vui long doi vai phut^)
    powershell -Command "Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%~dp0.bin\node.zip'"
    
    echo [2/2] Dang giai nen va thiet lap...
    powershell -Command "Expand-Archive -Path '%~dp0.bin\node.zip' -DestinationPath '%~dp0.bin\temp' -Force"
    
    move /y "%~dp0.bin\temp\node-%NODE_VER%-win-x64" "%LOCAL_NODE_DIR%" >nul 2>nul
    rd /s /q "%~dp0.bin\temp"
    del "%~dp0.bin\node.zip"
    
    set "PATH=%LOCAL_NODE_DIR%;%PATH%"
    echo [OK] Cai dat Node.js Portable thanh cong!
    echo.
)

:: 3. Kiem tra va cai dat thu vien (node_modules)
if not exist "node_modules" (
    echo [INFO] Chua co thu vien, dang tu dong tai cac thu vien can thiet...
    call npm install
    echo [OK] Tai thu vien hoan tat!
    echo.
)

:: 4. Bat dau chay may chu
echo [OK] May chu dang san sang tai http://localhost:3000
echo [OK] Ban co the mo trinh duyet va vao: http://localhost:3000/login.html
echo.
echo Nhan Ctrl+C neu ban muon tat may chu.
echo ===================================
echo.

node server.js

pause
