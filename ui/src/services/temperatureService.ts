import { APP_CONSTANTS } from '../constants/constants';
import type { 
  TemperatureReading, 
  TemperatureStatus, 
  TemperatureThreshold, 
  FeverAlert,
  ApiResponse 
} from '../types/temperature';

const API = APP_CONSTANTS.API_BASE_URL;

export const temperatureService = {
  async getLatestTemperature(deviceId: string): Promise<TemperatureReading> {
    const response = await fetch(`${API}/temperature/latest?deviceId=${deviceId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest temperature: ${response.statusText}`);
    }
    const result: ApiResponse<TemperatureReading> = await response.json();
    if (result.status !== 'success') {
      throw new Error('API returned error status');
    }
    return result.result;
  },

  async getTemperatureHistory(deviceId: string, limit = 10): Promise<TemperatureReading[]> {
    const response = await fetch(`${API}/temperature/history?deviceId=${deviceId}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch temperature history: ${response.statusText}`);
    }
    const result: ApiResponse<TemperatureReading[]> = await response.json();
    if (result.status !== 'success') {
      throw new Error('API returned error status');
    }
    return result.result;
  },

  async getTemperatureStatus(deviceId: string): Promise<TemperatureStatus> {
    const response = await fetch(`${API}/temperature/status?deviceId=${deviceId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch temperature status: ${response.statusText}`);
    }
    const result: ApiResponse<TemperatureStatus> = await response.json();
    if (result.status !== 'success') {
      throw new Error('API returned error status');
    }
    return result.result;
  },

  async getThreshold(deviceId: string): Promise<TemperatureThreshold> {
    const response = await fetch(`${API}/temperature/threshold?deviceId=${deviceId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch threshold: ${response.statusText}`);
    }
    const result: ApiResponse<TemperatureThreshold> = await response.json();
    if (result.status !== 'success') {
      throw new Error('API returned error status');
    }
    return result.result;
  },

  async updateThreshold(deviceId: string, threshold: number): Promise<TemperatureThreshold> {
    const response = await fetch(`${API}/temperature/threshold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, threshold }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update threshold: ${response.statusText}`);
    }
    const result: ApiResponse<TemperatureThreshold> = await response.json();
    if (result.status !== 'success') {
      throw new Error('API returned error status');
    }
    return result.result;
  },

  async getFeverAlerts(deviceId: string): Promise<FeverAlert[]> {
    const response = await fetch(`${API}/temperature/alerts?deviceId=${deviceId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fever alerts: ${response.statusText}`);
    }
    const result: ApiResponse<FeverAlert[]> = await response.json();
    if (result.status !== 'success') {
      throw new Error('API returned error status');
    }
    return result.result;
  },
};