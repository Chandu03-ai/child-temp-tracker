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
  const sortedReadings = useMemo(
    () =>
      [...readings].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [readings]
  );

  const [showAll, setShowAll] = useState(false);

  const displayedReadings = showAll
    ? sortedReadings
    : sortedReadings.slice(0, 10);

  const groupedReadings = displayedReadings.reduce((acc, reading) => {
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

  const toFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-5">
        <Clock className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900">
          Recent Temperature Readings (
          {displayedReadings.length}
          {showAll ? '' : ` of ${sortedReadings.length}`})
        </h2>
      </div>

      {readings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Thermometer className="w-14 h-14 mx-auto mb-3 text-gray-300" />
          <p className="text-base">No temperature readings available</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {Object.entries(groupedReadings).map(([key, group]) => (
              <div
                key={key}
                className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                {/* Dropdown Toggle */}
                <button
                  onClick={() => toggleGroup(key)}
                  className="flex items-center justify-between w-full px-4 py-3 text-left font-semibold text-gray-800"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    <span>{group.label}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Last updated: {group.latestUpdate}
                    </span>
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
                    openGroup === key
                      ? 'max-h-[1000px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 pb-4 pt-2 space-y-3">
                    {group.readings.map((reading) => {
                      const isFever =
                        toFahrenheit(reading.temperature) >=
                        toFahrenheit(threshold);
                      return (
                        <div
                          key={reading.id}
                          className="flex items-center justify-between p-2 border-b border-gray-200 font-mono text-sm"
                        >
                          {/* Celsius and Fahrenheit */}
                          <div
                            className={`font-semibold ${
                              isFever ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {reading.temperature.toFixed(1)}°C /{' '}
                            {toFahrenheit(reading.temperature).toFixed(1)}°F
                          </div>

                          {/* Timestamp */}
                          <div className="text-gray-600">
                            {formatTime(reading.timestamp)}
                          </div>

                          {/* Time ago */}
                          <div className="text-gray-400">
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

          {/* Show More / Show Less Button */}
          {sortedReadings.length > 10 && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {showAll ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
