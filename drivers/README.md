# OpenBlock USB-Serial Drivers

This directory contains driver installation scripts for OpenBlock Desktop to support various USB-Serial devices used with Arduino, ESP32, ESP8266, and other microcontrollers.

## Supported Devices

- **CH340/CH341** - Common USB-Serial chip used in Arduino clones and ESP8266
- **CP2102** - Silicon Labs USB-Serial chip used in ESP32 development boards
- **FTDI FT232** - FTDI USB-Serial chip used in various development boards
- **Arduino CDC ACM** - Native USB Arduino boards (Leonardo, Micro, etc.)

## Platform Support

### macOS
- Script: `install.sh`
- Usage: Automatically called when clicking "Install Driver" in OpenBlock Desktop
- Requirements: macOS 10.12 or later

### Windows
- Scripts: `install_x64.bat` (64-bit), `install_x86.bat` (32-bit)
- Usage: Automatically called when clicking "Install Driver" in OpenBlock Desktop
- Requirements: Windows 7 or later

### Linux
- Script: `linux_setup.sh`
- Usage: Automatically called when clicking "Install Driver" in OpenBlock Desktop
- Requirements: Linux with systemd, supported distributions:
  - Ubuntu/Debian/Mint
  - Fedora/RHEL/CentOS/Rocky/AlmaLinux
  - Arch/Manjaro/EndeavourOS
  - openSUSE

## Manual Driver Installation

If automatic installation doesn't work, you can download drivers manually:

### CH340/CH341 Drivers
- **Windows/macOS**: https://www.wch.cn/downloads/CH341SER_ZIP.html
- **Linux**: Usually included in kernel (ch341 module)

### CP2102 Drivers
- **Windows/macOS/Linux**: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

### FTDI Drivers
- **Windows/macOS/Linux**: https://ftdichip.com/drivers/vcp-drivers/

## Troubleshooting

### macOS
1. If you see "System Extension Blocked":
   - Go to System Preferences > Security & Privacy
   - Click "Allow" next to the driver message
   - Restart your computer

2. For macOS 10.15 (Catalina) and later:
   - You may need to disable SIP (System Integrity Protection) for some drivers
   - Or use the CH340 driver from: https://github.com/adrianmihalko/ch340g-ch34g-ch34x-mac-os-x-driver

### Windows
1. If driver installation fails:
   - Right-click the .bat file and select "Run as administrator"
   - Check Windows Defender or antivirus isn't blocking the installer

2. For Windows 10/11:
   - Drivers should install automatically via Windows Update
   - If not, use Device Manager to manually update drivers

### Linux
1. If your device isn't recognized:
   ```bash
   # Check if device is detected
   lsusb

   # Check kernel messages
   dmesg | grep -i usb

   # List serial ports
   ls -la /dev/ttyUSB* /dev/ttyACM*
   ```

2. Permission issues:
   ```bash
   # Add user to dialout group
   sudo usermod -a -G dialout $USER

   # Log out and log back in for changes to take effect
   ```

3. ModemManager interference:
   ```bash
   # Stop ModemManager from interfering
   sudo systemctl stop ModemManager
   sudo systemctl disable ModemManager
   ```

4. brltty interference (Ubuntu):
   ```bash
   # Stop brltty from claiming USB-Serial devices
   sudo systemctl stop brltty
   sudo systemctl disable brltty
   ```

## Adding Driver Files

To include actual driver files in the distribution:

1. **Windows**: Place driver packages in this directory:
   - `CH341SER/` - CH340 driver installer
   - `CP210x_Windows_Drivers/` - CP2102 driver files
   - `CDM21228_Setup.exe` - FTDI driver installer
   - `ArduinoDrivers/` - Arduino drivers

2. **macOS**: Place driver packages in this directory:
   - `CH34x_Install_V1.5.pkg` - CH340 driver
   - `SiLabsUSBDriverDisk.dmg` - CP2102 driver

3. **Linux**: Drivers are usually included in the kernel, no additional files needed

## License

These installation scripts are part of OpenBlock Desktop and follow the same license terms.

## Contributing

If you encounter issues with driver installation, please:
1. Check the troubleshooting section above
2. Report issues at: https://github.com/openblockcc/openblock-desktop/issues
