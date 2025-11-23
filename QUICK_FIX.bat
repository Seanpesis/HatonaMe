@echo off
echo Closing processes on port 5000...
echo.

REM Find and kill processes on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo Done! Now you can run: npm run dev
echo.
pause

