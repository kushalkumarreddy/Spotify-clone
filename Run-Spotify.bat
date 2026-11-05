@echo off
title Spotify Web Player
cd /d "%~dp0"

echo ===================================================
echo   Starting Spotify Web Player...
echo   Opening http://localhost:3000 in your browser
echo ===================================================

:: Open browser after a brief delay so server has initialized
start "" http://localhost:3000

:: Start the full-stack application
node start.js

pause

