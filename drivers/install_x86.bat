@echo off
chcp 65001 >nul
title OpenBlock Driver Installer for Windows (x86)
echo ==========================================
echo OpenBlock Driver Installer for Windows (x86)
echo ==========================================
echo.

set "DRIVER_PATH=%~dp0"
cd /d "%DRIVER_PATH%"

echo Installing USB-Serial drivers...
echo Driver path: %DRIVER_PATH%
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Warning: This installer may require administrator privileges.
    echo Please right-click and select "Run as administrator" if installation fails.
    echo.
    pause
)

:: Install CH340 driver (common for Arduino clones)
echo Checking CH340 USB-Serial driver...
if exist "%DRIVER_PATH%\CH341SER\SETUP.EXE" (
    echo Installing CH340 driver...
    start /wait "" "%DRIVER_PATH%\CH341SER\SETUP.EXE"
    echo CH340 driver installation completed.
) else if exist "%DRIVER_PATH%\CH341SER32\SETUP.EXE" (
    echo Installing CH340 driver (x86)...
    start /wait "" "%DRIVER_PATH%\CH341SER32\SETUP.EXE"
    echo CH340 driver installation completed.
) else (
    echo CH340 driver package not found.
    echo You may need to download it manually from:
    echo https://www.wch.cn/downloads/CH341SER_ZIP.html
)
echo.

:: Install CP2102 driver (common for ESP32)
echo Checking CP2102 USB-Serial driver...
if exist "%DRIVER_PATH%\CP210x_Windows_Drivers\x86\silabser.sys" (
    echo Installing CP2102 driver...
    pnputil /add-driver "%DRIVER_PATH%\CP210x_Windows_Drivers\x86\silabser.inf" /install
    if %errorLevel% equ 0 (
        echo CP2102 driver installation completed.
    ) else (
        echo Failed to install CP2102 driver. Please install manually.
    )
) else (
    echo CP2102 driver package not found.
    echo You may need to download it manually from:
    echo https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
)
echo.

:: Install FTDI driver
echo Checking FTDI USB-Serial driver...
if exist "%DRIVER_PATH%\CDM21228_Setup.exe" (
    echo Installing FTDI driver...
    start /wait "" "%DRIVER_PATH%\CDM21228_Setup.exe"
    echo FTDI driver installation completed.
) else (
    echo FTDI driver package not found.
    echo You may need to download it manually from:
    echo https://ftdichip.com/drivers/vcp-drivers/
)
echo.

:: Install Arduino driver (if available)
echo Checking Arduino USB driver...
if exist "%DRIVER_PATH%\ArduinoDrivers\dpinst-x86.exe" (
    echo Installing Arduino drivers...
    start /wait "" "%DRIVER_PATH%\ArduinoDrivers\dpinst-x86.exe" /sw /f
    echo Arduino driver installation completed.
)
echo.

echo ==========================================
echo Driver installation process completed!
echo ==========================================
echo.
echo Note: You may need to restart your computer
echo       for the drivers to take effect.
echo.
echo If your device is still not recognized:
echo 1. Unplug and replug your device
echo 2. Check Device Manager for any issues
echo 3. Manually update drivers if needed
echo.

pause
exit /b 0
