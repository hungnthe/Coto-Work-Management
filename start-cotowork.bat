@echo off
chcp 65001 >nul
cd /d "%~dp0"
title CotoWork - Khoi dong he thong
color 0A

echo ============================================
echo    COTOWORK MANAGER - KHOI DONG HE THONG
echo ============================================
echo    Thu muc: %cd%
echo.

:: === 1. Kiem tra Docker Desktop ===
echo [1/4] Kiem tra Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo       [LOI] Docker Desktop chua chay!
    echo       Hay mo Docker Desktop, doi icon xanh roi chay lai.
    echo.
    pause
    exit /b 1
)
echo       [OK] Docker Desktop dang chay.
echo.

:: === 2. Kiem tra ngrok ===
echo [2/4] Kiem tra ngrok...
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo       [LOI] Chua cai ngrok!
    echo       Tai ngrok tai: https://ngrok.com/download
    echo.
    pause
    exit /b 1
)
echo       [OK] ngrok da san sang.
echo.

:: === 3. Khoi dong Docker containers ===
echo [3/4] Khoi dong he thong (mat 1-2 phut)...
echo       Chi khoi dong cac dich vu chinh (bo monitoring/logging)...
docker compose up -d consul redis rabbitmq user_service_db task_service_db user-service task-service api-gateway frontend nginx
if %errorlevel% neq 0 (
    color 0C
    echo       [LOI] Khong the khoi dong containers!
    echo.
    pause
    exit /b 1
)
echo       [OK] Tat ca dich vu da khoi dong.
echo.

:: === 4. Doi TUNG service san sang ===
echo [4/4] Doi cac service san sang (mat 1-3 phut)...
echo.

echo       Doi Consul...
set retries=0
:check_consul
if %retries% geq 40 ( echo       [!] Consul chua san sang, tiep tuc... & goto check_gw )
curl -s -f http://localhost:8500/v1/status/leader >nul 2>&1
if %errorlevel% neq 0 ( set /a retries+=1 & timeout /t 5 /nobreak >nul & goto check_consul )
echo       [OK] Consul

echo       Doi API Gateway...
set retries=0
:check_gw
if %retries% geq 40 ( echo       [!] API Gateway chua san sang, tiep tuc... & goto check_user )
curl -s -f http://localhost:8080/actuator/health >nul 2>&1
if %errorlevel% neq 0 ( set /a retries+=1 & timeout /t 5 /nobreak >nul & goto check_gw )
echo       [OK] API Gateway

echo       Doi User Service...
set retries=0
:check_user
if %retries% geq 40 ( echo       [!] User Service chua san sang, tiep tuc... & goto check_task )
curl -s -f http://localhost:8083/actuator/health >nul 2>&1
if %errorlevel% neq 0 ( set /a retries+=1 & timeout /t 5 /nobreak >nul & goto check_user )
echo       [OK] User Service

echo       Doi Task Service...
set retries=0
:check_task
if %retries% geq 40 ( echo       [!] Task Service chua san sang, tiep tuc... & goto check_nginx )
curl -s -f http://localhost:8084/api/tasks/health >nul 2>&1
if %errorlevel% neq 0 ( set /a retries+=1 & timeout /t 5 /nobreak >nul & goto check_task )
echo       [OK] Task Service

echo       Doi Nginx...
set retries=0
:check_nginx
if %retries% geq 10 ( echo       [!] Nginx chua san sang, tiep tuc... & goto all_ready )
curl -s -o nul http://localhost:80 >nul 2>&1
if %errorlevel% neq 0 ( set /a retries+=1 & timeout /t 3 /nobreak >nul & goto check_nginx )
echo       [OK] Nginx
:all_ready
echo.
echo       === Tat ca service da san sang! ===
echo.

:: === 5. Chay ngrok ===
:start_ngrok
echo ============================================
echo    HE THONG DA SAN SANG!
echo ============================================
echo.
echo    Tim dong "Forwarding" ben duoi de lay link.
echo    Vi du: https://xxxx-xxxx.ngrok-free.app
echo.
echo    Gui link do cho nguoi can truy cap.
echo.
echo    Nhan Ctrl+C de tat ngrok.
echo ============================================
echo.

ngrok http 80

:: === Sau khi ngrok tat ===
echo.
echo ============================================
echo    Ngrok da tat. He thong van chay tai localhost.
echo ============================================
echo.
set /p shutdown="Tat luon he thong Docker? (Y/N): "
if /i "%shutdown%"=="Y" (
    echo Dang tat...
    docker compose down
    echo [OK] Da tat hoan toan.
) else (
    echo He thong van chay. Truy cap: http://localhost
    echo De tat sau: double-click stop-cotowork.bat
)
echo.
pause