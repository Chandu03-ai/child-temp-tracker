import React, { useState, useEffect } from 'react';
import { Settings, Save, X, AlertCircle } from 'lucide-react';
import type { TemperatureThreshold } from '../types/temperature';

interface ThresholdManagerProps {
  threshold: TemperatureThreshold;
  onUpdate: (threshold: number) => Promise<void>;
  disabled?: boolean;
  currentTempF?: number; // Pass current temperature in Fahrenheit
}

export const ThresholdManager: React.FC<ThresholdManagerProps> = ({
  threshold,
  onUpdate,
  disabled = false,
  currentTempF = 98.6
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    ((threshold.threshold * 9) / 5 + 32).toString() // initialize in Fahrenheit
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditValue(((threshold.threshold * 9) / 5 + 32).toString()); // update to Fahrenheit
  }, [threshold]);

  const handleSave = async () => {
    const newThresholdF = parseFloat(editValue);

    if (isNaN(newThresholdF) || newThresholdF < 95 || newThresholdF > 122) {
      alert('Please enter a valid threshold between 95°F and 122°F');
      return;
    }

    // Convert back to °C for storage (if backend expects °C)
    const newThresholdC = ((newThresholdF - 32) * 5) / 9;

    setIsLoading(true);
    try {
      await onUpdate(newThresholdC);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update threshold:', error);
      alert('Failed to update threshold. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(((threshold.threshold * 9) / 5 + 32).toString());
    setIsEditing(false);
  };

  const fahrenheitThreshold = (threshold.threshold * 9) / 5 + 32;
  const isFever = currentTempF > fahrenheitThreshold;

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
            className="px-4 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Edit Mode */}
      {isEditing ? (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold Temperature (°F)
            </label>
            <input
              type="number"
              step="0.1"
              min="95"
              max="122"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Range: 95.0°F - 122.0°F
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-3 text-center animate-zoomIn">
          {/* Fahrenheit Only */}
          <div
            className={`text-5xl font-extrabold ${
              isFever ? 'text-red-600' : 'text-gray-900'
            } flex items-center justify-center space-x-2`}
          >
            {isFever && <AlertCircle className="w-7 h-7 text-red-600" />}
            <span>{currentTempF.toFixed(1)}°F</span>
          </div>
          {/* Fever Warning */}
          {isFever && (
            <div className="text-red-600 font-semibold text-lg">
              ⚠️ Fever Detected
            </div>
          )}

          {/* Last updated */}
          <div className="text-sm text-gray-600">
            🕒 {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};
