@echo off
echo ====================================
echo   HatonaME - Wedding Planner
echo ====================================
echo.
echo Starting server and client...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing server dependencies...
    call npm install
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting application...
echo Server will run on: http://localhost:5000
echo Client will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

npm run dev

pause

