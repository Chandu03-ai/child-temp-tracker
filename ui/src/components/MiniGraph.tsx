import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TemperatureReading } from '../types/temperature';

interface MiniGraphProps {
  readings: TemperatureReading[];
  threshold: number; // in Celsius
}

export const MiniGraph: React.FC<MiniGraphProps> = ({ readings, threshold }) => {
  const [hoverData, setHoverData] = useState<{ x: number; y: number; temp: number; time: string } | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  if (readings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
          <Minus className="w-6 h-6" />
        </div>
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  // Helper: Celsius -> Fahrenheit
  const toFahrenheit = (c: number) => (c * 9) / 5 + 32;

  // Sort readings (oldest first for graph)
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Convert all readings to °F
  const temperatures = sortedReadings.map((r) => toFahrenheit(r.temperature));
  const minTemp = Math.min(...temperatures, toFahrenheit(threshold) - 2);
  const maxTemp = Math.max(...temperatures, toFahrenheit(threshold) + 2);
  const tempRange = maxTemp - minTemp;

  // Trend detection
  const firstTemp = temperatures[0];
  const lastTemp = temperatures[temperatures.length - 1];
  const trend = lastTemp > firstTemp ? 'up' : lastTemp < firstTemp ? 'down' : 'stable';

  // SVG graph dimensions
  const width = 300;
  const height = 140;
  const padding = 30;

  // Create points for line chart
  const points = temperatures.map((temp, index) => {
    const x = padding + (index / (temperatures.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((temp - minTemp) / tempRange) * (height - 2 * padding);
    return { x, y };
  });

  // Threshold line (in Fahrenheit)
  const thresholdY =
    height -
    padding -
    ((toFahrenheit(threshold) - minTemp) / tempRange) * (height - 2 * padding);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Recent Temperature Graph</h3>
        <div className="flex items-center space-x-1 text-xs">
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
      <div className="relative w-full bg-gradient-to-b from-blue-50 to-white rounded-lg p-2 shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-36">
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
            const time = new Date(sortedReadings[index].timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const isFever = temp >= toFahrenheit(threshold);

            return (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={isFever ? '#ef4444' : '#3b82f6'}
                  className={`cursor-pointer transition-transform ${
                    hoverData && hoverData.x === point.x && hoverData.y === point.y
                      ? 'animate-pulse-smooth'
                      : ''
                  }`}
                  onMouseEnter={() => {
                    setHoverData({ x: point.x, y: point.y, temp, time });
                    setIsHovering(true);
                  }}
                  onMouseLeave={() => {
                    setHoverData(null);
                    setIsHovering(false);
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Min/Max labels */}
        <div className="absolute left-1 top-2 h-[calc(100%-16px)] flex flex-col justify-between text-xs text-gray-500">
          <span>{maxTemp.toFixed(1)}°F</span>
          <span>{minTemp.toFixed(1)}°F</span>
        </div>

        {/* Floating Tooltip (blinking too) */}
        {hoverData && (
          <div
            className={`absolute bg-white text-gray-800 text-xs font-semibold rounded shadow-md px-2 py-1 animate-pulse-smooth`}
            style={{
              left: hoverData.x + 10,
              top: hoverData.y,
              transform: 'translateY(-50%)',
            }}
          >
            {hoverData.time} - {hoverData.temp.toFixed(1)}°F
          </div>
        )}
      </div>

      {/* Smooth pulse animation */}
      <style>
        {`
          @keyframes smoothPulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-pulse-smooth {
            animation: smoothPulse 1s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};
