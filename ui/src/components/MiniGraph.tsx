import React, { useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TemperatureReading } from '../types/temperature';
import { parseBackendTimestamp } from '../utils/dateUtils';

interface MiniGraphProps {
  readings: TemperatureReading[];
  threshold: number; // in Celsius
}

export const MiniGraph: React.FC<MiniGraphProps> = ({ readings, threshold }) => {
  const [hoverData, setHoverData] = useState<{ x: number; y: number; temp: number; time: string } | null>(null);
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const toFahrenheit = (c: number) => (c * 9) / 5 + 32;
  const toUnit = (temp: number) => (unit === 'F' ? toFahrenheit(temp) : temp);
  const unitLabel = unit === 'F' ? '°F' : '°C';

  // Filter readings for selected date with safe timestamp parsing
  const filteredReadings = readings.filter((r) => {
    const date = parseBackendTimestamp(r.timestamp);
    if (!date) {
      console.warn('Invalid timestamp:', r.timestamp);
      return false;
    }
    
    try {
      const dateString = date.toISOString().split('T')[0];
      return dateString === selectedDate;
    } catch (error) {
      console.warn('Error processing timestamp:', r.timestamp, error);
      return false;
    }
  });

  if (filteredReadings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
          <Minus className="w-6 h-6" />
        </div>
        <p className="text-sm">No readings for {selectedDate}</p>
      </div>
    );
  }

  // Sort readings by timestamp with safe parsing
  const sortedReadings = [...filteredReadings].sort((a, b) => {
    const dateA = parseBackendTimestamp(a.timestamp);
    const dateB = parseBackendTimestamp(b.timestamp);
    
    if (!dateA || !dateB) return 0;
    
    return dateA.getTime() - dateB.getTime();
  });

  const temperatures = sortedReadings.map((r) => toUnit(r.temperature));
  const minTemp = Math.min(...temperatures, toUnit(threshold) - 2);
  const maxTemp = Math.max(...temperatures, toUnit(threshold) + 2);
  const tempRange = maxTemp - minTemp;

  const firstTemp = temperatures[0];
  const lastTemp = temperatures[temperatures.length - 1];
  const trend = lastTemp > firstTemp ? 'up' : lastTemp < firstTemp ? 'down' : 'stable';

  const width = 300;
  const height = 140;
  const padding = 30;

  const points = temperatures.map((temp, index) => {
    const x = padding + (index / (temperatures.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((temp - minTemp) / tempRange) * (height - 2 * padding);
    return { x, y };
  });

  const thresholdY =
    height -
    padding -
    ((toUnit(threshold) - minTemp) / tempRange) * (height - 2 * padding);

  // Tooltip show/hide handlers with debounce
  const handleMouseEnter = (data: { x: number; y: number; temp: number; time: string }) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoverData(data), 100);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoverData(null), 150);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center space-x-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setUnit('C')}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              unit === 'C' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit('F')}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              unit === 'F' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Temperature Graph</h3>
        <div className="flex items-center space-x-2 text-sm">
          {trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
          {trend === 'down' && <TrendingDown className="w-3 h-3 text-green-500" />}
          {trend === 'stable' && <Minus className="w-3 h-3 text-gray-500" />}
          <span
            className={`font-medium ${
              trend === 'up'
                ? 'text-red-600'
                : trend === 'down'
                ? 'text-green-600'
                : 'text-gray-600'
            }`}
          >
            {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
          </span>
        </div>
      </div>

      {/* Graph */}
      <div className="relative w-full bg-gradient-to-b from-blue-50 to-white rounded-xl p-4 shadow-inner border border-gray-200">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-40">
          {/* Threshold line */}
          <line
            x1={padding}
            y1={thresholdY}
            x2={width - padding}
            y2={thresholdY}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.6"
          />

          {/* Temperature polyline */}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => {
            const temp = temperatures[index];
            const reading = sortedReadings[index];
            const date = parseBackendTimestamp(reading.timestamp);
            const time = date ? date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) : 'Invalid time';
            const isFever = temp >= toUnit(threshold);

            return (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={isFever ? '#ef4444' : '#3b82f6'}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => handleMouseEnter({ x: point.x, y: point.y, temp, time })}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}
        </svg>

        {/* Min/Max labels */}
        <div className="absolute left-2 top-4 h-[calc(100%-32px)] flex flex-col justify-between text-xs text-gray-600 font-medium">
          <span>{maxTemp.toFixed(1)}{unitLabel}</span>
          <span>{minTemp.toFixed(1)}{unitLabel}</span>
        </div>

        {/* Tooltip */}
        {hoverData && (
          <div
            className="absolute bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-lg px-3 py-2 transition-opacity duration-200 z-10"
            style={{
              left: hoverData.x + 10,
              top: hoverData.y,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              opacity: 1,
            }}
          >
            {hoverData.time} - {hoverData.temp.toFixed(1)}{unitLabel}
          </div>
        )}
      </div>

      {/* Average Temperature */}
      <div className="text-sm text-gray-700 text-center font-medium bg-gray-50 rounded-lg py-2">
        Avg Temp: {(temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)}{unitLabel}
      </div>
    </div>
  );
};