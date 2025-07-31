import React, { useState, useEffect } from 'react';
import { Settings, Save, X, AlertCircle } from 'lucide-react';
import type { TemperatureThreshold } from '../types/temperature';

interface ThresholdManagerProps {
  threshold: TemperatureThreshold;
  onUpdate: (threshold: number) => Promise<void>;
  disabled?: boolean;
  currentTempF?: number;
}

export const ThresholdManager: React.FC<ThresholdManagerProps> = ({
  threshold,
  onUpdate,
  disabled = false,
  currentTempF = 98.6,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unit, setUnit] = useState<'F' | 'C'>('F'); // Toggle unit

  useEffect(() => {
    const value =
      unit === 'F'
        ? ((threshold.threshold * 9) / 5 + 32).toFixed(1)
        : threshold.threshold.toFixed(1);
    setEditValue(value);
  }, [threshold, unit]);

  const handleSave = async () => {
    const val = parseFloat(editValue);
    if (isNaN(val)) {
      alert('Please enter a valid number');
      return;
    }

    let valueInC = unit === 'F' ? ((val - 32) * 5) / 9 : val;

    if (valueInC < 35 || valueInC > 50) {
      alert('Please enter a valid threshold (between 95°F–122°F or 35°C–50°C)');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(valueInC);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const value =
      unit === 'F'
        ? ((threshold.threshold * 9) / 5 + 32).toFixed(1)
        : threshold.threshold.toFixed(1);
    setEditValue(value);
    setIsEditing(false);
  };

  const displayTemp = unit === 'F' ? currentTempF : ((currentTempF - 32) * 5) / 9;
  const isFever = currentTempF > (threshold.threshold * 9) / 5 + 32;

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
            onClick={() => setIsEditing(true)}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Range: {unit === 'F' ? '95°F – 122°F' : '35°C – 50°C'}
            </p>
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
        <div className="space-y-3 text-center animate-zoomIn">
          <div
            className={`text-5xl font-extrabold ${
              isFever ? 'text-red-600' : 'text-gray-900'
            } flex items-center justify-center space-x-2`}
          >
            {isFever && <AlertCircle className="w-7 h-7 text-red-600" />}
            <span>{displayTemp.toFixed(1)}°{unit}</span>
          </div>

          {isFever && (
            <div className="text-red-600 font-semibold text-lg">
              ⚠️ Fever Detected
            </div>
          )}

          <div className="text-sm text-gray-600">
            🕒 {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};
