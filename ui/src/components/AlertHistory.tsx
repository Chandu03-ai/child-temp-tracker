import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { FeverAlert } from '../types/temperature';
import { formatDateTime } from '../utils/dateUtils';
import { toast } from 'react-toastify';

interface AlertHistoryProps {
  alerts: FeverAlert[];
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts }) => {
  const [selectedAlert, setSelectedAlert] = useState<FeverAlert | null>(null);

  /** Show Toastify message when alert is critical */
  const showToast = (alert: FeverAlert) => {
    toast.error(
      `🔥 Critical Fever Alert! Temp: ${alert.temperature.toFixed(1)}°C (Threshold: ${alert.threshold.toFixed(1)}°C)`,
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h2 className="text-xl font-semibold text-gray-900">Alert History</h2>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
          <p>No fever alerts recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => {
                if (!alert.resolved) {
                  setSelectedAlert(alert);
                  showToast(alert); // Show toast notification
                }
              }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition hover:scale-[1.01] ${
                alert.resolved
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-red-100 border-red-400 shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {alert.resolved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-700" />
                    )}
                    <span
                      className={`font-semibold ${
                        alert.resolved ? 'text-gray-700' : 'text-red-800'
                      }`}
                    >
                      {alert.resolved ? 'Resolved' : 'CRITICAL'} Fever Alert
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      Temperature:{' '}
                      <span className="font-bold">
                        {alert.temperature.toFixed(1)}°C
                      </span>
                    </div>
                    <div>
                      Threshold:{' '}
                      <span className="font-medium">
                        {alert.threshold.toFixed(1)}°C
                      </span>
                    </div>
                    <div>
                      Started:{' '}
                      <span className="font-medium">
                        {formatDateTime(alert.timestamp)}
                      </span>
                    </div>
                    {alert.resolved && alert.resolvedAt && (
                      <div>
                        Resolved:{' '}
                        <span className="font-medium">
                          {formatDateTime(alert.resolvedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Critical Alert */}
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
                {selectedAlert.temperature.toFixed(1)}°C
              </span>{' '}
              (Threshold: {selectedAlert.threshold.toFixed(1)}°C).
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
