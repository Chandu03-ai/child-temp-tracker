export interface TemperatureReading {
  id: string;
  deviceId: string;
  temperature: number;
  timestamp: string;
  unit:'celsius'|'fahrenheit';
}

export interface TemperatureStatus {
  temperature: any;
  timestamp: string | number | Date;
  deviceId: string;
  status: 'normal' | 'fever' | 'unknown';
  currentTemperature: number;
  threshold: number;
  lastUpdated: string;
}

export interface TemperatureThreshold {
  deviceId: string;
  threshold: number;
  unit:  'celsius'|'fahrenheit';
  updatedAt: string;
}

export interface FeverAlert {
  id: string;
  deviceId: string;
  temperature: number;
  threshold: number;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface ApiResponse<T> {
  status: string;
  result: T;
  message?: string;
  error?: string;
}