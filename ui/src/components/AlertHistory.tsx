import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X, Info } from 'lucide-react';
import type { FeverAlert } from '../types/temperature';
import { formatDateTime } from '../utils/dateUtils';
import { toast } from 'react-toastify';

interface AlertHistoryProps {
  alerts: FeverAlert[];
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts }) => {
  const [selectedAlert, setSelectedAlert] = useState<FeverAlert | null>(null);

  const toFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

  const showToast = (alert: FeverAlert) => {
    toast.error(
      `🔥 Critical Fever Alert! Temp: ${toFahrenheit(alert.temperature).toFixed(1)}°F (Threshold: ${toFahrenheit(alert.threshold).toFixed(1)}°F)`,
      {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-orange-600 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-900">Alert History</h2>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle className="w-14 h-14 mx-auto mb-4 text-green-300" />
          <p className="text-lg">No fever alerts recorded</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                if (!alert.resolved) {
                  setSelectedAlert(alert);
                  showToast(alert);
                }
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition duration-200 transform hover:scale-[1.02] relative overflow-hidden ${
                alert.resolved
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-red-50 border-red-400 shadow-md'
              }`}
            >
              <div className="absolute right-2 top-2">
                {!alert.resolved && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {alert.resolved ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-700 animate-bounce" />
                    )}
                    <span
                      className={`font-semibold text-lg ${
                        alert.resolved ? 'text-gray-800' : 'text-red-800'
                      }`}
                    >
                      {alert.resolved ? 'Resolved' : 'CRITICAL'} Fever Alert
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1 pl-1">
                    <div>
                      <Info className="inline w-4 h-4 text-gray-500 mr-1" />
                      Temperature: <span className="font-bold">{alert.temperature.toFixed(1)}°C / {toFahrenheit(alert.temperature).toFixed(1)}°F</span>
                    </div>
                    <div>
                      Threshold: <span className="font-medium">{alert.threshold.toFixed(1)}°C / {toFahrenheit(alert.threshold).toFixed(1)}°F</span>
                    </div>
                    <div>
                      Started: <span className="font-medium">{formatDateTime(alert.timestamp)}</span>
                    </div>
                    {alert.resolved && alert.resolvedAt && (
                      <div>
                        Resolved: <span className="font-medium">{formatDateTime(alert.resolvedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-700">
                Critical Fever Alert
              </h3>
            </div>
            <p className="text-gray-800 mb-4">
              Temperature reached{' '}
              <span className="font-bold">
                {toFahrenheit(selectedAlert.temperature).toFixed(1)}°F
              </span>{' '}
              (Threshold: {toFahrenheit(selectedAlert.threshold).toFixed(1)}°F).
            </p>
            <p className="text-gray-600 text-sm">
              Started: {formatDateTime(selectedAlert.timestamp)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
