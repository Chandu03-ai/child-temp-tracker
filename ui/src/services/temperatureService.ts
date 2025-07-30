import axios from 'axios';
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
    const { data } = await axios.get<ApiResponse<TemperatureReading>>(
      `${API}/temperature/latest`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getTemperatureHistory(deviceId: string, limit = 10): Promise<TemperatureReading[]> {
    const { data } = await axios.get<ApiResponse<TemperatureReading[]>>(
      `${API}/temperature/history`,
      { params: { deviceId, limit } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getTemperatureStatus(deviceId: string): Promise<TemperatureStatus> {
    const { data } = await axios.get<ApiResponse<TemperatureStatus>>(
      `${API}/temperature/status`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getThreshold(deviceId: string): Promise<TemperatureThreshold> {
    const { data } = await axios.get<ApiResponse<TemperatureThreshold>>(
      `${API}/temperature/threshold`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async updateThreshold(deviceId: string, threshold: number): Promise<TemperatureThreshold> {
    const { data } = await axios.post<ApiResponse<TemperatureThreshold>>(
      `${API}/temperature/threshold`,
      { deviceId, threshold }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getFeverAlerts(deviceId: string): Promise<FeverAlert[]> {
    const { data } = await axios.get<ApiResponse<FeverAlert[]>>(
      `${API}/temperature/alerts`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },
};
