@echo off
setlocal enabledelayedexpansion

rem Resolve the directory of this script.
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

rem Start the backend in a new PowerShell terminal.
start "StudyBuddy Backend" powershell -NoExit -Command "Set-Location -LiteralPath '%SCRIPT_DIR%\backend'; if (Test-Path package.json) { npm run dev } else { Write-Host 'backend package.json not found.' }"

rem Start the frontend in a new PowerShell terminal.
start "StudyBuddy Frontend" powershell -NoExit -Command "Set-Location -LiteralPath '%SCRIPT_DIR%\frontend'; if (Test-Path package.json) { npm run dev } else { Write-Host 'frontend package.json not found.' }"

echo Launched StudyBuddy frontend and backend.
pause
