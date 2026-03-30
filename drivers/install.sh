#!/bin/bash

# OpenBlock Driver Installation Script for macOS
# This script installs necessary drivers for hardware devices

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "OpenBlock Driver Installer for macOS"
echo "=========================================="
echo ""

# Function to check if a kext is installed
check_kext() {
    kextstat | grep -q "$1" 2>/dev/null
}

# Function to install CH340 driver (common for Arduino clones)
install_ch340_driver() {
    echo "Checking CH340 USB-Serial driver..."

    # Check if driver is already loaded
    if check_kext "com.wch.usbserial" || check_kext "usbserial"; then
        echo "✓ CH340 driver is already installed"
        return 0
    fi

    # Look for CH340 driver package in drivers folder
    if [ -f "$SCRIPT_DIR/CH34x_Install_V1.5.pkg" ]; then
        echo "Installing CH340 driver..."
        sudo installer -pkg "$SCRIPT_DIR/CH34x_Install_V1.5.pkg" -target /
        echo "✓ CH340 driver installed successfully"
    elif [ -f "$SCRIPT_DIR/ch34xinstall.pkg" ]; then
        echo "Installing CH340 driver..."
        sudo installer -pkg "$SCRIPT_DIR/ch34xinstall.pkg" -target /
        echo "✓ CH340 driver installed successfully"
    else
        echo "⚠ CH340 driver package not found in: $SCRIPT_DIR"
        echo "  You may need to download it manually from:"
        echo "  https://www.wch.cn/downloads/CH341SER_MAC_ZIP.html"
    fi
}

# Function to install CP2102 driver (common for ESP32)
install_cp2102_driver() {
    echo "Checking CP2102 USB-Serial driver..."

    if check_kext "com.silabs.driver.CP210xVCPDriver"; then
        echo "✓ CP2102 driver is already installed"
        return 0
    fi

    if [ -f "$SCRIPT_DIR/SiLabsUSBDriverDisk.dmg" ]; then
        echo "Installing CP2102 driver..."
        MOUNT_POINT=$(hdiutil attach "$SCRIPT_DIR/SiLabsUSBDriverDisk.dmg" -nobrowse | grep -o '/Volumes/.*')
        if [ -n "$MOUNT_POINT" ]; then
            sudo installer -pkg "$MOUNT_POINT/Silicon Labs VCP Driver.pkg" -target /
            hdiutil detach "$MOUNT_POINT"
            echo "✓ CP2102 driver installed successfully"
        fi
    else
        echo "⚠ CP2102 driver not found"
        echo "  You may need to download it manually from:"
        echo "  https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers"
    fi
}

# Function to install FTDI driver
install_ftdi_driver() {
    echo "Checking FTDI USB-Serial driver..."

    if check_kext "com.FTDI.driver.FTDIUSBSerialDriver"; then
        echo "✓ FTDI driver is already installed"
        return 0
    fi

    echo "⚠ FTDI driver not included"
    echo "  You may need to download it manually from:"
    echo "  https://ftdichip.com/drivers/vcp-drivers/"
}

# Main installation
echo "Starting driver installation..."
echo ""

# Check for sudo
if [ "$EUID" -ne 0 ]; then
    echo "Note: Some drivers may require administrator privileges."
    echo "You may be prompted for your password."
    echo ""
fi

# Install drivers
install_ch340_driver
echo ""
install_cp2102_driver
echo ""
install_ftdi_driver
echo ""

# Check for Arduino USB connection
echo "Checking USB devices..."
system_profiler SPUSBDataType 2>/dev/null | grep -A 5 -i "arduino\|ch340\|cp210\|ftdi\|usb-serial" || true
echo ""

echo "=========================================="
echo "Driver installation completed!"
echo "=========================================="
echo ""
echo "Note: You may need to restart your computer"
echo "      for the drivers to take effect."
echo ""
echo "If your device is still not recognized:"
echo "1. Unplug and replug your device"
echo "2. Check System Preferences > Security & Privacy"
echo "3. Allow any blocked drivers from unidentified developers"
echo ""

# Keep terminal open if run directly
if [ -t 0 ]; then
    echo "Press Enter to close..."
    read -r
fi

exit 0
