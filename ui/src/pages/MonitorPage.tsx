import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { temperatureService } from '../services/temperatureService';
import { StatusIndicator } from '../components/StatusIndicator';
import { TemperatureHistory } from '../components/TemperatureHistory';
import { ThresholdManager } from '../components/ThresholdManager';
import { AlertHistory } from '../components/AlertHistory';
import { RefreshToggle } from '../components/RefreshToggle';
import { APP_CONSTANTS } from '../constants/constants';
import ChildTempImg from '../assets/ChildTempLogo.png';
import type { 
  TemperatureReading, 
  TemperatureStatus, 
  TemperatureThreshold, 
  FeverAlert 
} from '../types/temperature';
import { MiniGraph } from '../components/MiniGraph';

export const MonitorPage: React.FC = () => {
  const { deviceId: urlDeviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  // State
  const [backendDeviceId, setBackendDeviceId] = useState<string>('');
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

      setBackendDeviceId(statusData.deviceId);
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

  /** Auto refresh */
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
          <img
            src={ChildTempImg}
            alt="Loading"
            className="w-16 h-16 mx-auto mb-4 animate-bounce"
          />
          <p className="text-gray-700 font-semibold">Loading data...</p>
        </div>
      </div>
    );
  }

  /** Error Screen */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100 animate-fadeIn">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xl animate-zoomIn">
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
      <header className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-xl rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={ChildTempImg}
                alt="Child Logo"
                className="w-16 h-16 rounded-full text-white border-4 border-white shadow-lg"
              />
              <span
                className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                  (status && (status.temperature >= (threshold?.threshold ?? APP_CONSTANTS.FEVER_THRESHOLD_DEFAULT)))
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-green-500'
                }`}
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Child Temperature Monitor
              </h1>
              <p className="text-sm opacity-90">
                Device: <span className="font-semibold">{backendDeviceId}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-sm">
              {(status && (status.temperature >= (threshold?.threshold ?? APP_CONSTANTS.FEVER_THRESHOLD_DEFAULT))) ? (
                <span className="text-red-200 font-semibold">
                  🔴 High Temp: {status.temperature}°F at{" "}
                  {new Date(status.timestamp).toLocaleTimeString()}
                </span>
              ) : (
                <span className="text-green-100 font-semibold">🟢 All Normal</span>
              )}
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:scale-[1.02] transition-all animate-fadeIn">
              <StatusIndicator status={status} />
            </div>
            <div className=" transition-all animate-fadeIn delay-200">
              <TemperatureHistory
                readings={history}
                threshold={threshold?.threshold ?? APP_CONSTANTS.FEVER_THRESHOLD_DEFAULT}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-8">
            <div className=" hover:scale-[1.02] transition-all animate-zoomIn">
              {threshold && (
                <ThresholdManager
                  threshold={threshold}
                  onUpdate={handleUpdateThreshold}
                />
              )}
            </div>
            <div className=" hover:scale-[1.02] transition-all animate-zoomIn delay-200">
              <MiniGraph 
                readings={history.slice(0, 10)}
                threshold={threshold?.threshold ?? APP_CONSTANTS.FEVER_THRESHOLD_DEFAULT}
              />
            </div>
            <div className=" hover:scale-[1.02] transition-all animate-zoomIn delay-300">
              <AlertHistory alerts={alerts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
