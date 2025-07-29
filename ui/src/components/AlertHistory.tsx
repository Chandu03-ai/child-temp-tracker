import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { FeverAlert } from '../types/temperature';
import { formatDateTime } from '../utils/dateUtils';

interface AlertHistoryProps {
  alerts?: FeverAlert[];
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts }) => {
  // Handle undefined or null alerts array
  const safeAlerts = alerts || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h2 className="text-xl font-semibold text-gray-900">Alert History</h2>
      </div>
      
      {safeAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
          <p>No fever alerts recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 ${
                alert.resolved 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {alert.resolved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-semibold ${
                      alert.resolved ? 'text-gray-700' : 'text-red-700'
                    }`}>
                      {alert.resolved ? 'Resolved' : 'Active'} Fever Alert
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Temperature: <span className="font-medium">{alert.temperature.toFixed(1)}°C</span></div>
                    <div>Threshold: <span className="font-medium">{alert.threshold.toFixed(1)}°C</span></div>
                    <div>Started: <span className="font-medium">{formatDateTime(alert.timestamp)}</span></div>
                    {alert.resolved && alert.resolvedAt && (
                      <div>Resolved: <span className="font-medium">{formatDateTime(alert.resolvedAt)}</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};