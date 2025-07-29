import React, { useState, useMemo } from 'react';
import {
  Clock,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import type { TemperatureReading } from '../types/temperature';
import { formatTime, getTimeAgo } from '../utils/dateUtils';

interface TemperatureHistoryProps {
  readings: TemperatureReading[];
  threshold: number;
}

export const TemperatureHistory: React.FC<TemperatureHistoryProps> = ({
  readings,
  threshold
}) => {
  // Sort readings (latest first)
  const sortedReadings = useMemo(
    () => [...readings].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [readings]
  );

  // Group readings by Year -> Month -> Day -> Hour
  const groupedReadings = sortedReadings.reduce((acc, reading) => {
    const date = new Date(reading.timestamp);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const hour = date.getHours();

    const key = `${year}-${month}-${day}-${hour}`;
    if (!acc[key]) {
      acc[key] = {
        label: `${day} ${month} ${year} • ${hour}:00`,
        latestUpdate: formatTime(reading.timestamp),
        readings: []
      };
    }
    acc[key].readings.push(reading);
    return acc;
  }, {} as Record<string, { label: string; latestUpdate: string; readings: TemperatureReading[] }>);

  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = (key: string) => {
    setOpenGroup(openGroup === key ? null : key);
  };

  // Celsius to Fahrenheit conversion
  const toFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-5">
        <Clock className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900">Recent Temperature Readings</h2>
      </div>

      {readings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Thermometer className="w-14 h-14 mx-auto mb-3 text-gray-300" />
          <p className="text-base">No temperature readings available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedReadings).map(([key, group]) => (
            <div
              key={key}
              className="rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 shadow-sm hover:shadow-md transition-all"
            >
              {/* Dropdown Toggle Button */}
              <button
                onClick={() => toggleGroup(key)}
                className="flex items-center justify-between w-full px-4 py-3 text-left font-semibold text-gray-800"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <span>{group.label}</span>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Latest update time */}
                  <span className="text-sm text-gray-500">Last updated: {group.latestUpdate}</span>
                  {openGroup === key ? (
                    <ChevronUp className="w-6 h-6 text-gray-600 transition-transform" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-600 transition-transform" />
                  )}
                </div>
              </button>

              {/* Dropdown Content */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openGroup === key ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-4 pt-2 space-y-3">
                  {group.readings.map((reading) => {
                    const isFever = reading.temperature >= threshold;
                    return (
                      <div
                        key={reading.id}
                        className={`flex items-center justify-between p-3 rounded-lg border shadow-sm ${
                          isFever
                            ? 'bg-red-50 border-red-200 hover:bg-red-100'
                            : 'bg-green-50 border-green-200 hover:bg-green-100'
                        } transition-all`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isFever ? 'bg-red-500' : 'bg-green-500'
                            }`}
                          />
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              {/* Celsius & Fahrenheit */}
                              {reading.temperature.toFixed(1)}°C /{' '}
                              {toFahrenheit(reading.temperature).toFixed(1)}°F
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatTime(reading.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {getTimeAgo(reading.timestamp)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
