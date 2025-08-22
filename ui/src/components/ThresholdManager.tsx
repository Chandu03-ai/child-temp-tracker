import React, { useState, useEffect } from 'react';
import { Settings, Save, X, AlertCircle, Thermometer } from 'lucide-react';
import type { TemperatureThreshold } from '../types/temperature';
import {formatDateTime} from '../utils/dateUtils';
interface ThresholdManagerProps {
  threshold: TemperatureThreshold;
  onUpdate: (threshold: number) => Promise<void>;
  disabled?: boolean;
  
}

export const ThresholdManager: React.FC<ThresholdManagerProps> = ({
  threshold,
  onUpdate,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [error, setError] = useState<string>('');

  // Convert Celsius to Fahrenheit
  const toFahrenheit = (celsius: number) => (celsius * 9) / 5 + 32;

  // Convert Fahrenheit to Celsius
  const toCelsius = (fahrenheit: number) => ((fahrenheit - 32) * 5) / 9;

  useEffect(() => {
    if (!isEditing) {
      const value =
        unit === 'F'
          ? toFahrenheit(threshold.threshold).toFixed(1)
          : threshold.threshold.toFixed(1);
      setEditValue(value);
    }
    setError('');
  }, [threshold, unit, isEditing]);

  const handleEditStart = () => {
    setIsEditing(true);
    setError('');
    // Keep input blank while editing
    setEditValue('');
  };

  const handleSave = async () => {
    setError('');
    const val = parseFloat(editValue);

    if (isNaN(val)) {
      setError('Please enter a valid number');
      return;
    }

    let valueInC = unit === 'F' ? toCelsius(val) : val;

    if (valueInC < 35 || valueInC > 50) {
      setError(
        `Please enter a valid threshold (between ${
          unit === 'F' ? '95°F–122°F' : '35°C–50°C'
        })`
      );
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(valueInC);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update threshold. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    const value =
      unit === 'F'
        ? toFahrenheit(threshold.threshold).toFixed(1)
        : threshold.threshold.toFixed(1);
    setEditValue(value);
  };

  const displayThreshold =
    unit === 'F' ? toFahrenheit(threshold.threshold) : threshold.threshold;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600 animate-spin-slow" />
          <h2 className="text-xl font-semibold text-gray-900">
            Fever Alert Threshold
          </h2>
        </div>

        {!disabled && !isEditing && (
          <button
            onClick={handleEditStart}
            className="px-4 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Edit
          </button>
        )}
      </div>

      {/* Unit Toggle */}
      <div className="mb-4 flex items-center space-x-3">
        <span className="text-sm text-gray-700">Unit:</span>
        <button
          className={`px-3 py-1 rounded-md border ${
            unit === 'C'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => setUnit('C')}
          disabled={isEditing}
        >
          °C
        </button>
        <button
          className={`px-3 py-1 rounded-md border ${
            unit === 'F'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => setUnit('F')}
          disabled={isEditing}
        >
          °F
        </button>
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold Temperature ({unit})
            </label>
            <input
              type="number"
              step="0.1"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={isLoading}
              placeholder={`Current: ${
                unit === 'F'
                  ? toFahrenheit(threshold.threshold).toFixed(1)
                  : threshold.threshold.toFixed(1)
              }°${unit}`}
            />
            <p className="text-sm text-gray-500 mt-1">
              Range: {unit === 'F' ? '95°F – 122°F' : '35°C – 50°C'}
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center animate-zoomIn">
          {/* Current Threshold Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="text-sm text-gray-600 mb-2">Current Threshold</div>
            <div className="text-4xl font-bold text-blue-600 flex items-center justify-center space-x-2">
              <Thermometer className="w-8 h-8" />
              <span>
                {displayThreshold.toFixed(1)}°{unit}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {unit === 'F'
                ? `${threshold.threshold.toFixed(1)}°C`
                : `${toFahrenheit(threshold.threshold).toFixed(1)}°F`}
            </div>
          </div>

          <div className="text-sm text-gray-500">
  Last updated: {threshold.updatedAt ? formatDateTime(threshold.updatedAt) : "Not updated yet"}
</div>

        </div>
      )}
    </div>
  );
};
