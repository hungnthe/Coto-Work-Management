@echo off
chcp 65001 >nul
cd /d "%~dp0"
title CotoWork - Tat he thong
color 0E

echo ============================================
echo    COTOWORK - TAT HE THONG
echo ============================================
echo.

set /p confirm="Ban co chac muon tat toan bo he thong? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Huy bo.
    pause
    exit /b 0
)

echo.
echo Dang tat tat ca dich vu...
docker compose down
echo.
echo [OK] Da tat hoan toan.
echo.
pause