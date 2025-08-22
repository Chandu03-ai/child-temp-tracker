import axios from 'axios';
import { serviceBaseUrl } from '../constants/appConstant';
import type { 
  TemperatureReading, 
  TemperatureStatus, 
  TemperatureThreshold, 
  FeverAlert,
  ApiResponse 
} from '../types/temperature';


export const temperatureService = {
  async getLatestTemperature(deviceId: string): Promise<TemperatureReading> {
    const { data } = await axios.get<ApiResponse<TemperatureReading>>(
      `${serviceBaseUrl}/temperature/latest`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getTemperatureHistory(deviceId: string, limit = 10): Promise<TemperatureReading[]> {
    const { data } = await axios.get<ApiResponse<TemperatureReading[]>>(
      `${serviceBaseUrl}/temperature/history`,
      { params: { deviceId, limit } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getTemperatureStatus(deviceId: string): Promise<TemperatureStatus> {
    const { data } = await axios.get<ApiResponse<TemperatureStatus>>(
      `${serviceBaseUrl}/temperature/status`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getThreshold(deviceId: string): Promise<TemperatureThreshold> {
    const { data } = await axios.get<ApiResponse<TemperatureThreshold>>(
      `${serviceBaseUrl}/temperature/threshold`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async updateThreshold(deviceId: string, threshold: number): Promise<TemperatureThreshold> {
    const { data } = await axios.post<ApiResponse<TemperatureThreshold>>(
      `${serviceBaseUrl}/temperature/threshold`,
      { deviceId, threshold }
    );
  console.log(`Updating threshold for device ${deviceId} to ${threshold}`);
    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },

  async getFeverAlerts(deviceId: string): Promise<FeverAlert[]> {
    const { data } = await axios.get<ApiResponse<FeverAlert[]>>(
      `${serviceBaseUrl}/temperature/alerts`,
      { params: { deviceId } }
    );

    if (data.status !== 'success') {
      throw new Error('API returned error status');
    }
    return data.result;
  },
};
