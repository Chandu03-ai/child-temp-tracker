# Backend Service Requirements (FastAPI + MongoDB)

This document outlines the expected API endpoints and data models for the Child Temperature Monitoring backend service.

## 🚀 Tech Stack
- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: Optional (for threshold updates)

## 📡 Required API Endpoints

### 1. Get Latest Temperature Reading
```http
GET /temperature/latest?deviceId={deviceId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "677d8f9e123456789abcdef0",
    "deviceId": "piZero01",
    "temperature": 37.2,
    "timestamp": "2025-01-07T10:30:00.000Z",
    "unit": "celsius"
  }
}
```

### 2. Get Temperature History
```http
GET /temperature/history?deviceId={deviceId}&limit={limit}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "677d8f9e123456789abcdef0",
      "deviceId": "piZero01",
      "temperature": 37.2,
      "timestamp": "2025-01-07T10:30:00.000Z",
      "unit": "celsius"
    }
  ]
}
```

### 3. Get Temperature Status
```http
GET /temperature/status?deviceId={deviceId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deviceId": "piZero01",
    "status": "normal", // "normal" | "fever" | "unknown"
    "currentTemperature": 37.2,
    "threshold": 38.0,
    "lastUpdated": "2025-01-07T10:30:00.000Z"
  }
}
```

### 4. Get Fever Threshold
```http
GET /temperature/threshold?deviceId={deviceId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deviceId": "piZero01",
    "threshold": 38.0,
    "unit": "celsius",
    "updatedAt": "2025-01-07T10:00:00.000Z"
  }
}
```

### 5. Update Fever Threshold
```http
POST /temperature/threshold
Content-Type: application/json

{
  "deviceId": "piZero01",
  "threshold": 38.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deviceId": "piZero01",
    "threshold": 38.5,
    "unit": "celsius",
    "updatedAt": "2025-01-07T10:45:00.000Z"
  }
}
```

### 6. Get Fever Alerts
```http
GET /temperature/alerts?deviceId={deviceId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "677d8f9e123456789abcdef1",
      "deviceId": "piZero01",
      "temperature": 38.7,
      "threshold": 38.0,
      "timestamp": "2025-01-07T09:15:00.000Z",
      "resolved": true,
      "resolvedAt": "2025-01-07T09:45:00.000Z"
    }
  ]
}
```

### 7. Record Temperature (Sensor Endpoint)
```http
POST /temperature
Content-Type: application/json

{
  "deviceId": "piZero01",
  "temperature": 37.4,
  "unit": "celsius"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "677d8f9e123456789abcdef2",
    "deviceId": "piZero01",
    "temperature": 37.4,
    "timestamp": "2025-01-07T10:50:00.000Z",
    "unit": "celsius"
  }
}
```

## 🗃️ MongoDB Collections

### Temperature Readings Collection (`temperature_readings`)
```javascript
{
  _id: ObjectId,
  deviceId: "piZero01",
  temperature: 37.2,
  timestamp: ISODate("2025-01-07T10:30:00.000Z"),
  unit: "celsius" // "celsius" | "fahrenheit"
}
```

### Device Thresholds Collection (`device_thresholds`)
```javascript
{
  _id: ObjectId,
  deviceId: "piZero01",
  threshold: 38.0,
  unit: "celsius",
  updatedAt: ISODate("2025-01-07T10:00:00.000Z")
}
```

### Fever Alerts Collection (`fever_alerts`)
```javascript
{
  _id: ObjectId,
  deviceId: "piZero01",
  temperature: 38.7,
  threshold: 38.0,
  timestamp: ISODate("2025-01-07T09:15:00.000Z"),
  resolved: true,
  resolvedAt: ISODate("2025-01-07T09:45:00.000Z")
}
```

## 📝 Business Logic Requirements

### Temperature Status Calculation
- **Normal**: `temperature < threshold`
- **Fever**: `temperature >= threshold`
- **Unknown**: No recent readings (>5 minutes old)

### Alert Management
- Create alert when temperature crosses threshold (upward)
- Mark alert as resolved when temperature drops below threshold
- Only one active alert per device at a time

### Data Retention
- Keep temperature readings for 30 days
- Keep resolved alerts for 7 days
- Keep active alerts indefinitely

## 🔧 Technical Requirements

### Error Handling
All endpoints should return consistent error responses:
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### CORS Configuration
Enable CORS for frontend domain in development and production.

### Database Indexes
- `deviceId` on all collections
- `timestamp` on temperature readings (descending)
- Compound index on (`deviceId`, `timestamp`) for history queries

### Environment Variables
```env
MONGODB_URL=mongodb://localhost:27017/temperature_monitor
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

## 🚨 Important Notes

1. **Timestamps**: Always use ISO 8601 format with UTC timezone
2. **Temperature Unit**: Default to Celsius, support Fahrenheit conversion
3. **Device Validation**: Ensure deviceId exists before processing requests
4. **Rate Limiting**: Consider rate limiting for sensor POST endpoint
5. **Logging**: Log all temperature readings and threshold changes
6. **Health Check**: Implement `/health` endpoint for monitoring

This backend service should handle all the data management and business logic while the React frontend focuses on presentation and user interaction.