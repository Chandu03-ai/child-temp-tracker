import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Thermometer, AlertCircle } from 'lucide-react';
import { temperatureService } from '../services/temperatureService';
import { StatusIndicator } from '../components/StatusIndicator';
import { TemperatureHistory } from '../components/TemperatureHistory';
import { ThresholdManager } from '../components/ThresholdManager';
import { AlertHistory } from '../components/AlertHistory';
import { RefreshToggle } from '../components/RefreshToggle';
import { APP_CONSTANTS } from '../constants/constants';
import type { 
  TemperatureReading, 
  TemperatureStatus, 
  TemperatureThreshold, 
  FeverAlert 
} from '../types/temperature';

export const MonitorPage: React.FC = () => {
  const { deviceId: urlDeviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  // State
  const [backendDeviceId, setBackendDeviceId] = useState<string>(''); // backend deviceId
  const [status, setStatus] = useState<TemperatureStatus | null>(null);
  const [history, setHistory] = useState<TemperatureReading[]>([]);
  const [threshold, setThreshold] = useState<TemperatureThreshold | null>(null);
  const [alerts, setAlerts] = useState<FeverAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  // Redirect if deviceId missing
  if (!urlDeviceId) {
    navigate(`/monitor/${APP_CONSTANTS.DEFAULT_DEVICE_ID}`);
    return null;
  }

  /** Fetch all data from backend */
  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const [statusData, historyData, thresholdData, alertsData] = await Promise.all([
        temperatureService.getTemperatureStatus(urlDeviceId),
        temperatureService.getTemperatureHistory(urlDeviceId, 10),
        temperatureService.getThreshold(urlDeviceId),
        temperatureService.getFeverAlerts(urlDeviceId),
      ]);

      // Update states with backend data
      setBackendDeviceId(statusData.deviceId); // take backend deviceId
      setStatus(statusData);
      setHistory(historyData);
      setThreshold(thresholdData);
      setAlerts(alertsData);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [urlDeviceId]);

  /** Update threshold */
  const handleUpdateThreshold = useCallback(async (newThreshold: number) => {
    await temperatureService.updateThreshold(backendDeviceId, newThreshold);
    await fetchData();
  }, [backendDeviceId, fetchData]);

  /** Auto refresh feature */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(() => fetchData(), APP_CONSTANTS.REFRESH_INTERVAL);
    }
    return () => interval && clearInterval(interval);
  }, [isAutoRefresh, fetchData]);

  /** Initial fetch */
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  /** Loading Screen */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 animate-fadeIn">
        <div className="text-center">
          <Thermometer className="w-14 h-14 mx-auto mb-4 text-pink-500 animate-bounce" />
          <p className="text-lg font-semibold text-gray-700">
            Fetching child’s temperature data...
          </p>
        </div>
      </div>
    );
  }

  /** Error Screen */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100 animate-fadeIn">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg animate-zoomIn">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="px-6 py-2 bg-pink-500 text-white rounded-full shadow-md hover:bg-pink-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /** Main Screen */
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white bg-opacity-90 backdrop-blur-md shadow-md border-b rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 space-y-3 md:space-y-0">
            <div className="flex items-center space-x-3 text-center md:text-left">
              <Thermometer className="w-10 h-10 text-pink-500 animate-pulse flex-shrink-0" />
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  Child Temperature Monitor
                </h1>
                <p className="text-sm text-gray-600">
                  Device: <span className="font-semibold">{backendDeviceId}</span>
                </p>   
              </div>
            </div>

            <div className="flex items-center justify-between md:space-x-6 w-full md:w-auto">
              <RefreshToggle
                isAutoRefresh={isAutoRefresh}
                onToggle={() => setIsAutoRefresh(!isAutoRefresh)}
                onManualRefresh={() => fetchData()}
                isRefreshing={isRefreshing}
                lastRefresh={lastRefresh}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Indicator */}
          <div className="lg:col-span-2 animate-zoomIn">
            <StatusIndicator status={status} />
          </div>

          {/* Threshold Manager */}
          <div className="animate-zoomIn delay-200">
            {threshold && (
              <ThresholdManager
                threshold={threshold}
                onUpdate={handleUpdateThreshold}
              />
            )}
          </div>

          {/* Temperature History */}
          <div className="lg:col-span-2 animate-zoomIn delay-300">
            <TemperatureHistory 
              readings={history}
              threshold={threshold?.threshold ?? APP_CONSTANTS.FEVER_THRESHOLD_DEFAULT}
            />
          </div>

          {/* Alert History */}
          <div className="animate-zoomIn delay-500">
            <AlertHistory alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  );
};
