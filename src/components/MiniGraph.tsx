import React, { useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TemperatureReading } from '../types/temperature';
import { parseBackendTimestamp } from '../utils/dateUtils';

interface MiniGraphProps {
  readings: TemperatureReading[];
  selectedDate: string;
  unit: 'C' | 'F';
  threshold: number;
}

const toFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

export default function MiniGraph({ readings, selectedDate, unit, threshold }: MiniGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const toUnit = (temp: number) => (unit === 'F' ? toFahrenheit(temp) : temp);
  const unitLabel = unit === 'F' ? '°F' : '°C';

  const filteredReadings = readings.filter((r) => {
    const date = parseBackendTimestamp(r.timestamp);
    if (!date) return false;
    return date.toISOString().startsWith(selectedDate);
  });

  if (filteredReadings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-center text-gray-500">
          <Minus className="w-8 h-8 mx-auto mb-2" />
          <p>No readings for selected date</p>
        </div>
      </div>
    );
  }

  const sortedReadings = [...filteredReadings].sort(
    (a, b) => {
      const dateA = parseBackendTimestamp(a.timestamp);
      const dateB = parseBackendTimestamp(b.timestamp);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    }
  );

  const temperatures = sortedReadings.map((r) => toUnit(r.temperature));
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const tempRange = maxTemp - minTemp || 1;

  const svgWidth = 300;
  const svgHeight = 120;
  const padding = 20;
  const graphWidth = svgWidth - 2 * padding;
  const graphHeight = svgHeight - 2 * padding;

  const points = temperatures.map((temp, index) => {
    const x = padding + (index / (temperatures.length - 1)) * graphWidth;
    const y = padding + ((maxTemp - temp) / tempRange) * graphHeight;
    return { x, y };
  });

  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  const trend = temperatures.length > 1 ? 
    temperatures[temperatures.length - 1] - temperatures[0] : 0;

  const TrendIcon = trend > 0.5 ? TrendingUp : trend < -0.5 ? TrendingDown : Minus;
  const trendColor = trend > 0.5 ? 'text-red-500' : trend < -0.5 ? 'text-blue-500' : 'text-gray-500';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Temperature Trend</h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {Math.abs(trend).toFixed(1)}{unitLabel}
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="w-full h-auto"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Temperature line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => {
            const temp = temperatures[index];
            const date = parseBackendTimestamp(sortedReadings[index].timestamp);
            const time = date ? date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }) : 'Invalid';
            const isFever = temp >= toUnit(threshold);

            return (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? 6 : 4}
                fill={isFever ? '#ef4444' : '#3b82f6'}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <title>{`${time}: ${temp.toFixed(1)}${unitLabel}`}</title>
              </circle>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <div className="absolute bg-gray-900 text-white px-2 py-1 rounded text-sm pointer-events-none z-10"
               style={{
                 left: points[hoveredPoint].x,
                 top: points[hoveredPoint].y - 40,
                 transform: 'translateX(-50%)'
               }}>
            {temperatures[hoveredPoint].toFixed(1)}{unitLabel}
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Min: {minTemp.toFixed(1)}{unitLabel}</span>
        <span>Max: {maxTemp.toFixed(1)}{unitLabel}</span>
      </div>
    </div>
  );
}