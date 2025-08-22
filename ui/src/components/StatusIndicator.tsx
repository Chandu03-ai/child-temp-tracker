import React from 'react';
import { Thermometer, CheckCircle, AlertTriangle } from 'lucide-react';
import type { TemperatureStatus } from '../types/temperature';

interface StatusIndicatorProps {
  status: TemperatureStatus | null;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className = '' }) => {
  // Helper: Celsius → Fahrenheit
  const toFahrenheit = (celsius?: number) => {
    if (celsius === undefined || celsius === null) return null;
    return (celsius * 9) / 5 + 32;
  };

  // Show loading/fallback UI only if no status is available
  if (!status) {
    return (
      <div
        className={`flex items-center space-x-3 p-4 rounded-lg border-2 bg-gray-50 border-gray-200 ${className}`}
      >
        <Thermometer className="w-6 h-6 text-gray-600 animate-pulse" />
        <div className="flex-1">
          <div className="font-semibold text-gray-600">Loading...</div>
          <div className="text-2xl font-bold text-gray-400">--°C / --°F</div>
          <div className="text-sm text-gray-400">Fetching data...</div>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    if (status.status === 'normal') {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Normal',
      };
    }
    if (status.status === 'fever') {
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Fever Alert',
      };
    }
    // Do not render anything for unknown status
    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  const IconComponent = config.icon;

  const currentTempC = status.currentTemperature ?? null;
  const currentTempF = toFahrenheit(currentTempC);

  const thresholdC = status.threshold ?? null;
  const thresholdF = toFahrenheit(thresholdC);

  return (
    <div
      className={`flex items-center space-x-3 p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <IconComponent className={`w-6 h-6 ${config.color}`} />
      <div className="flex-1">
        <div className={`font-semibold ${config.color}`}>{config.label}</div>

        {/* Show both Celsius and Fahrenheit */}
        <div className="text-2xl font-bold text-gray-900">
          {currentTempC !== null ? `${currentTempC.toFixed(1)}°C` : '--°C'} /{' '}
          {currentTempF !== null ? `${currentTempF.toFixed(1)}°F` : '--°F'}
        </div>

        <div className="text-sm text-gray-600">
          Threshold:{' '}
          {thresholdC !== null ? `${thresholdC.toFixed(1)}°C` : '--°C'} /{' '}
          {thresholdF !== null ? `${thresholdF.toFixed(1)}°F` : '--°F'}
        </div>
      </div>
    </div>
  );
};
