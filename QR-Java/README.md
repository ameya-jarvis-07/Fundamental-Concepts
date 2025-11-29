# WiFi QR Code Generator

A simple Java Swing application that generates QR codes for WiFi network credentials. Users can input their WiFi network name (SSID) and password to instantly generate a scannable QR code that others can use to connect to the network.

## Features

- **Real-time QR Code Generation**: Updates QR code as you type WiFi credentials
- **User-Friendly GUI**: Simple and clean Swing-based interface
- **Print Functionality**: Print WiFi cards with QR codes for distribution
- **Secure Password Input**: Uses masked password field for security
- **Error Handling**: Gracefully handles network and image loading errors
- **URL Encoding**: Properly encodes WiFi data for QR code generation

## Architecture

The application follows **SOLID principles** with clear separation of concerns:

### Classes

1. **WiFiCredentials**
   - Responsibility: Data model for WiFi network credentials
   - Stores SSID and password

2. **WiFiQRFormatter**
   - Responsibility: Formats WiFi credentials into QR code compatible string
   - Format: `WIFI:T:WPA;S:<ssid>;P:<password>;;`
   - Centralizes WiFi QR format string constants (DRY principle)

3. **QRCodeGenerator**
   - Responsibility: Generates QR code image URLs from data strings
   - Uses QR Server API for QR code generation
   - Handles URL encoding and formatting

4. **WifiQR** (Main Application)
   - Responsibility: GUI orchestration and user interaction
   - Creates window, input fields, and QR code display
   - Manages print functionality

## Requirements

- Java 11 or higher
- Swing library (included with Java)
- Internet connection (for QR code API calls)

## Building

### Compile
```bash
javac WifiQR.java
```

### Run
```bash
java WifiQR
```

Or on Windows PowerShell:
```powershell
Start-Process java -ArgumentList "WifiQR"
```

## Usage

1. **Launch the Application**
   - Run the executable as shown above
   - A window titled "WiFi Login" will appear

2. **Enter WiFi Credentials**
   - Type your WiFi network name in the "Network name" field
   - Type your password in the "Password" field
   - The QR code updates automatically as you type

3. **Share the QR Code**
   - Let others scan the QR code with their phone camera
   - They can connect to your WiFi network directly

4. **Print WiFi Cards**
   - Click "Print WiFi Card" to print the QR code
   - Use for office, home, or guest network sharing

## Technical Details

### QR Code Format
The WiFi QR code follows the standard WiFi provisioning format:
```
WIFI:T:WPA;S:<NetworkName>;P:<Password>;;
```

- `T:WPA` - Security type (WPA)
- `S:` - SSID (network name)
- `P:` - Password
- `;;` - Terminator

### API
Uses [QR Server API](https://api.qrserver.com/) for QR code generation:
- Endpoint: `https://api.qrserver.com/v1/create-qr-code/`
- Default size: 164x164 pixels
- Data parameter: URL-encoded WiFi string

### Error Handling
- Network errors display placeholder QR code
- Print errors show error dialog
- All exceptions are logged and handled gracefully

## Design Principles Applied

### Single Responsibility Principle (SRP)
- Each class has one reason to change
- WiFiCredentials: only if credential storage changes
- WiFiQRFormatter: only if WiFi format changes
- QRCodeGenerator: only if QR generation method changes
- WifiQR: only if GUI presentation changes

### Don't Repeat Yourself (DRY)
- QR format constants centralized in WiFiQRFormatter
- URL generation logic consolidated in QRCodeGenerator
- Size parameter reused (default and custom)
- No duplication of WiFi credential handling

## Limitations

- Requires internet connection for QR code generation
- Password field visibility can be revealed (by design)
- Supports only WPA security type
- QR code size fixed at 164x164 pixels (can be customized)

## Future Enhancements

- Support for additional security types (WEP, WPA3)
- Custom QR code size options
- Offline QR code generation
- QR code save to file
- Network scanning to auto-populate SSID
- Theme customization
