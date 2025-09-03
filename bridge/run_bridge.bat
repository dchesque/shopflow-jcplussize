@echo off
title ShopFlow Bridge - Camera 192.168.1.52
cls
echo =====================================
echo   ShopFlow Bridge v1.0
echo   Camera: 192.168.1.52
echo =====================================
echo.

call venv\\Scripts\\activate.bat
python camera_bridge.py

pause