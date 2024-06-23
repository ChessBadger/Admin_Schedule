@echo off
SETLOCAL
SET THISDIR=%~dp0

echo "Starting OfflineAutoSchedule.exe" > "%THISDIR%debug_log.txt"

"%THISDIR%OfflineAutoSchedule.exe" -c "%THISDIR%OfflineAutoSchedule.json" > "%THISDIR%log.txt" 2>> "%THISDIR%debug_log.txt"

IF %ERRORLEVEL% NEQ 0 (
    echo "Error executing OfflineAutoSchedule.exe" >> "%THISDIR%debug_log.txt"
    exit /b %ERRORLEVEL%
)

echo "OfflineAutoSchedule.exe executed successfully" >> "%THISDIR%debug_log.txt"

timeout /t 10

notepad.exe "%THISDIR%log.txt"
ENDLOCAL
