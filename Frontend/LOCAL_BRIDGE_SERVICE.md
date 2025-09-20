
# Fingerprint Scanner Local Bridge Service

This document explains how to set up a local bridge service to connect your fingerprint scanner hardware with the web application.

## Overview

Since web browsers cannot directly access fingerprint scanners due to security restrictions, we use a local HTTP service that:
- Runs on the client machine (localhost:5003)
- Communicates with the fingerprint scanner hardware
- Exposes HTTP endpoints for the web app to use

## Required Endpoints

### 1. Status Check
```
GET http://localhost:5000/status
Response: { "status": "ready", "scanner": "connected" }
```

### 2. Scan Fingerprint
```
POST http://localhost:5000/scan
Response: {
  "success": true,
  "template": "base64_encoded_template_data",
  "quality": 85
}
```

### 3. Verify Fingerprint
```
POST http://localhost:5000/verify
Body: {
  "template": "live_scan_template",
  "referenceTemplate": "stored_template"
}
Response: {
  "success": true,
  "matched": true,
  "confidence": 0.95
}
```

## Implementation Options

### Option 1: Node.js Service
Create a simple Express.js server that uses your scanner's SDK

### Option 2: Python Service
Use Flask/FastAPI with your scanner's Python bindings

### Option 3: .NET/C# Service
Use ASP.NET Core with manufacturer SDKs

## Popular Scanner SDKs
- **DigitalPersona**: U.are.U SDK
- **Suprema**: BioStar SDK
- **ZKTeco**: ZK SDK
- **Futronic**: Futronic SDK
- **Secugen**: SecuGen SDK

## Security Considerations
- Service should only accept connections from localhost
- Implement basic authentication if needed
- Never store raw fingerprint images
- Only work with processed templates
- Use HTTPS if possible (self-signed cert is fine for localhost)

## Testing
The web app will automatically fall back to simulation mode if the local service is not available, making development and testing easier.
