export const APP_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  REFRESH_INTERVAL: 5000, // 5 seconds
  DEFAULT_DEVICE_ID: 'piZero01',
  FEVER_THRESHOLD_DEFAULT: 38.0, // Celsius
};

export const TEMPERATURE_STATUS = {
  NORMAL: 'normal',
  FEVER: 'fever',
  UNKNOWN: 'unknown',
} as const;

export type TemperatureStatus = typeof TEMPERATURE_STATUS[keyof typeof TEMPERATURE_STATUS];