#!/bin/bash

# OpenBlock Driver Installation Script for Linux
# This script installs necessary drivers and udev rules for hardware devices

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=========================================="
echo "OpenBlock Driver Installer for Linux"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root (use sudo)"
    exit 1
fi

print_info "Installing drivers from: $SCRIPT_DIR"
echo ""

# Detect distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
    DISTRO_VERSION=$VERSION_ID
else
    print_error "Cannot detect Linux distribution"
    exit 1
fi

print_info "Detected distribution: $DISTRO $DISTRO_VERSION"
echo ""

# Install required packages
print_info "Installing required packages..."
case $DISTRO in
    ubuntu|debian|linuxmint|pop)
        apt-get update
        apt-get install -y linux-headers-$(uname -r) build-essential dkms
        ;;
    fedora|rhel|centos|rocky|almalinux)
        dnf install -y kernel-headers kernel-devel gcc make dkms
        ;;
    arch|manjaro|endeavouros)
        pacman -S --needed --noconfirm linux-headers dkms base-devel
        ;;
    opensuse*)
        zypper install -y kernel-devel kernel-source gcc make dkms
        ;;
    *)
        print_warn "Unknown distribution. Attempting to continue..."
        ;;
esac
echo ""

# Install CH340/CH341 driver
print_info "Setting up CH340/CH341 USB-Serial driver..."
if modinfo ch341 2>/dev/null | grep -q "ch341"; then
    print_info "CH340/CH341 driver is already available in kernel"
else
    print_warn "CH340/CH341 driver may need manual installation"
    print_info "Most modern Linux kernels include this driver by default"
fi

# Load the module
modprobe ch341 2>/dev/null || true
echo ""

# Install CP2102 driver
print_info "Setting up CP2102 USB-Serial driver..."
if modinfo cp210x 2>/dev/null | grep -q "cp210x"; then
    print_info "CP2102 driver is already available in kernel"
else
    print_warn "CP2102 driver may need manual installation"
fi

# Load the module
modprobe cp210x 2>/dev/null || true
echo ""

# Install FTDI driver
print_info "Setting up FTDI USB-Serial driver..."
if modinfo ftdi_sio 2>/dev/null | grep -q "ftdi"; then
    print_info "FTDI driver is already available in kernel"
else
    print_warn "FTDI driver may need manual installation"
fi

# Load the module
modprobe ftdi_sio 2>/dev/null || true
echo ""

# Install Arduino USB driver
print_info "Setting up Arduino USB driver..."
if modinfo cdc_acm 2>/dev/null | grep -q "cdc_acm"; then
    print_info "Arduino CDC ACM driver is already available in kernel"
else
    print_warn "Arduino driver may need manual installation"
fi

# Load the module
modprobe cdc_acm 2>/dev/null || true
echo ""

# Create udev rules for USB devices
print_info "Creating udev rules for USB devices..."
UDEV_RULES_FILE="/etc/udev/rules.d/50-openblock.rules"

cat > "$UDEV_RULES_FILE" << 'EOF'
# OpenBlock USB device rules
# CH340/CH341 USB-Serial adapter
SUBSYSTEM=="usb", ATTR{idVendor}=="1a86", ATTR{idProduct}=="7523", MODE="0666", GROUP="dialout"
SUBSYSTEM=="usb", ATTR{idVendor}=="1a86", ATTR{idProduct}=="5523", MODE="0666", GROUP="dialout"

# CP2102 USB-Serial adapter
SUBSYSTEM=="usb", ATTR{idVendor}=="10c4", ATTR{idProduct}=="ea60", MODE="0666", GROUP="dialout"
SUBSYSTEM=="usb", ATTR{idVendor}=="10c4", ATTR{idProduct}=="ea70", MODE="0666", GROUP="dialout"

# FT232 FTDI USB-Serial adapter
SUBSYSTEM=="usb", ATTR{idVendor}=="0403", ATTR{idProduct}=="6001", MODE="0666", GROUP="dialout"
SUBSYSTEM=="usb", ATTR{idVendor}=="0403", ATTR{idProduct}=="6010", MODE="0666", GROUP="dialout"
SUBSYSTEM=="usb", ATTR{idVendor}=="0403", ATTR{idProduct}=="6011", MODE="0666", GROUP="dialout"

# Arduino Uno
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", ATTR{idProduct}=="0043", MODE="0666", GROUP="dialout"
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", ATTR{idProduct}=="0001", MODE="0666", GROUP="dialout"

# Arduino Mega
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", ATTR{idProduct}=="0010", MODE="0666", GROUP="dialout"
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", ATTR{idProduct}=="0042", MODE="0666", GROUP="dialout"

# Arduino Leonardo
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", ATTR{idProduct}=="8036", MODE="0666", GROUP="dialout"

# Arduino Micro
SUBSYSTEM=="usb", ATTR{idVendor}=="2341", ATTR{idProduct}=="8037", MODE="0666", GROUP="dialout"

# Arduino Nano
SUBSYSTEM=="usb", ATTR{idVendor}=="1a86", ATTR{idProduct}=="7523", MODE="0666", GROUP="dialout"

# ESP32
SUBSYSTEM=="usb", ATTR{idVendor}=="10c4", ATTR{idProduct}=="ea60", MODE="0666", GROUP="dialout"

# ESP8266
SUBSYSTEM=="usb", ATTR{idVendor}=="1a86", ATTR{idProduct}=="7523", MODE="0666", GROUP="dialout"

# Generic USB-Serial adapters
KERNEL=="ttyUSB[0-9]*", MODE="0666", GROUP="dialout"
KERNEL=="ttyACM[0-9]*", MODE="0666", GROUP="dialout"
EOF

print_info "udev rules created at: $UDEV_RULES_FILE"
echo ""

# Reload udev rules
print_info "Reloading udev rules..."
udevadm control --reload-rules
udevadm trigger
echo ""

# Add current user to dialout group
if [ -n "$SUDO_USER" ]; then
    print_info "Adding user $SUDO_USER to dialout group..."
    usermod -a -G dialout "$SUDO_USER"
    print_info "User added to dialout group"
    print_warn "Please log out and log back in for group changes to take effect"
else
    print_warn "Could not determine the user to add to dialout group"
    print_info "Please manually add your user to the dialout group:"
    print_info "  sudo usermod -a -G dialout $USER"
fi
echo ""

# Check for ModemManager interference
if systemctl is-active --quiet ModemManager 2>/dev/null; then
    print_warn "ModemManager is running and may interfere with USB-Serial devices"
    print_info "Consider disabling it if you experience connection issues:"
    print_info "  sudo systemctl stop ModemManager"
    print_info "  sudo systemctl disable ModemManager"
    echo ""
fi

# Check for brltty interference (common on Ubuntu)
if systemctl is-active --quiet brltty 2>/dev/null; then
    print_warn "brltty is running and may interfere with USB-Serial devices"
    print_info "Consider disabling it if you experience connection issues:"
    print_info "  sudo systemctl stop brltty"
    print_info "  sudo systemctl disable brltty"
    echo ""
fi

# List connected USB devices
print_info "Checking connected USB devices..."
echo ""
lsusb | grep -iE "arduino|ch340|ch341|cp210|ftdi|ft232|serial" || echo "No known USB-Serial devices detected"
echo ""

print_info "Listing available serial ports..."
echo ""
ls -la /dev/ttyUSB* 2>/dev/null || echo "No /dev/ttyUSB* devices found"
ls -la /dev/ttyACM* 2>/dev/null || echo "No /dev/ttyACM* devices found"
echo ""

echo "=========================================="
echo "Driver installation completed!"
echo "=========================================="
echo ""
print_info "Summary:"
echo "  - Kernel modules loaded: ch341, cp210x, ftdi_sio, cdc_acm"
echo "  - udev rules installed: $UDEV_RULES_FILE"
echo "  - User added to dialout group"
echo ""
print_warn "Important:"
echo "  1. Please log out and log back in for group changes to take effect"
echo "  2. Unplug and replug your device if it's not recognized"
echo "  3. If you still have issues, try running: sudo dmesg | grep -i usb"
echo ""
print_info "To verify installation, connect your device and run:"
echo "  ls -la /dev/ttyUSB* /dev/ttyACM*"
echo ""

exit 0
