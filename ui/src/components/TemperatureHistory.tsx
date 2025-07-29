import React from 'react';
import { Clock, Thermometer } from 'lucide-react';
import type { TemperatureReading } from '../types/temperature';
import { formatTime, getTimeAgo } from '../utils/dateUtils';

interface TemperatureHistoryProps {
  readings?: TemperatureReading[];
  threshold: number;
}

export const TemperatureHistory: React.FC<TemperatureHistoryProps> = ({ readings, threshold }) => {
  // Handle undefined or null readings array
  const safeReadings = readings || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Recent Readings</h2>
      </div>
      
      {safeReadings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Thermometer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No temperature readings available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeReadings.map((reading) => {
            const isFever = reading.temperature >= threshold;
            return (
              <div
                key={reading.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isFever ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isFever ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {reading.temperature.toFixed(1)}°C
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(reading.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {getTimeAgo(reading.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};