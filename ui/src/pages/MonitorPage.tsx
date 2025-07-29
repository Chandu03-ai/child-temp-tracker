import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Thermometer, AlertCircle } from 'lucide-react';
import { temperatureService } from '../services/temperatureService';
import { StatusIndicator } from '../components/StatusIndicator';
import { TemperatureHistory } from '../components/TemperatureHistory';
import { ThresholdManager } from '../components/ThresholdManager';
import { AlertHistory } from '../components/AlertHistory';
import { RefreshToggle } from '../components/RefreshToggle';
import { APP_CONSTANTS } from '../constants';
import type { 
  TemperatureReading, 
  TemperatureStatus, 
  TemperatureThreshold, 
  FeverAlert 
} from '../types/temperature';

export const MonitorPage: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  
  // State
  const [status, setStatus] = useState<TemperatureStatus | null>(null);
  const [history, setHistory] = useState<TemperatureReading[]>([]);
  const [threshold, setThreshold] = useState<TemperatureThreshold | null>(null);
  const [alerts, setAlerts] = useState<FeverAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  // Validate device ID
  if (!deviceId) {
    navigate(`/monitor/${APP_CONSTANTS.DEFAULT_DEVICE_ID}`);
    return null;
  }

  // Fetch all data
  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const [statusData, historyData, thresholdData, alertsData] = await Promise.all([
        temperatureService.getTemperatureStatus(deviceId),
        temperatureService.getTemperatureHistory(deviceId, 10),
        temperatureService.getThreshold(deviceId),
        temperatureService.getFeverAlerts(deviceId),
      ]);
      

      setStatus(statusData);
      setHistory(historyData);
      setThreshold(thresholdData);
      setAlerts(alertsData);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [deviceId]);

  // Update threshold
  const handleUpdateThreshold = useCallback(async (newThreshold: number) => {
    await temperatureService.updateThreshold(deviceId, newThreshold);
    await fetchData();
  }, [deviceId, fetchData]);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoRefresh) {
      interval = setInterval(() => {
        fetchData();
      }, APP_CONSTANTS.REFRESH_INTERVAL);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh, fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Thermometer className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600">Loading temperature data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Thermometer className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Child Temperature Monitor
                </h1>
                <p className="text-sm text-gray-600">Device: {deviceId}</p>
              </div>
            </div>
            
            <RefreshToggle
              isAutoRefresh={isAutoRefresh}
              onToggle={() => setIsAutoRefresh(!isAutoRefresh)}
              onManualRefresh={() => fetchData()}
              isRefreshing={isRefreshing}
              lastRefresh={lastRefresh}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status - Full width on mobile, span 2 columns on desktop */}
          <div className="lg:col-span-2">
            <StatusIndicator status={status ?? undefined} />
          </div>

          {/* Threshold Manager */}
          <div>
            {threshold && (
              <ThresholdManager
                threshold={threshold}
                onUpdate={handleUpdateThreshold}
              />
            )}
          </div>

          {/* Temperature History - Full width on mobile, span 2 columns on desktop */}
          <div className="lg:col-span-2">
            <TemperatureHistory 
              readings={history} 
              threshold={threshold?.threshold ?? APP_CONSTANTS.FEVER_THRESHOLD_DEFAULT} 
            />
          </div>

          {/* Alert History */}
          <div>
            <AlertHistory alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  );
};