import React, { useState, useEffect } from 'react';
import { Settings, Save, X } from 'lucide-react';
import type { TemperatureThreshold } from '../types/temperature';

interface ThresholdManagerProps {
  threshold: TemperatureThreshold;
  onUpdate: (threshold: number) => Promise<void>;
  disabled?: boolean;
}

export const ThresholdManager: React.FC<ThresholdManagerProps> = ({
  threshold,
  onUpdate,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(threshold.threshold.toString());
  const [isLoading, setIsLoading] = useState(false);

  // Update edit value if threshold changes externally
  useEffect(() => {
    setEditValue(threshold.threshold.toString());
  }, [threshold]);

  // Temperature conversions
  const celsius = threshold.threshold;
  const fahrenheit = (celsius * 9) / 5 + 32;
  const kelvin = celsius + 273.15;

  const handleSave = async () => {
    const newThreshold = parseFloat(editValue);

    if (isNaN(newThreshold) || newThreshold < 35 || newThreshold > 50) {
      alert('Please enter a valid threshold between 35°C and 50°C');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(newThreshold); // Call API/update method
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update threshold:', error);
      alert('Failed to update threshold. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(threshold.threshold.toString());
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-blue-600 animate-spin-slow" />
          <h2 className="text-xl font-semibold text-gray-900">Fever Threshold</h2>
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
              Threshold Temperature (°C)
            </label>
            <input
              type="number"
              step="0.1"
              min="35"
              max="50"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">Range: 35.0°C - 50.0°C</p>
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
        <div className="space-y-2 text-center animate-zoomIn">
          <div className="text-5xl font-extrabold text-gray-900">
            {celsius.toFixed(1)}°C
          </div>
          <div className="text-lg font-semibold text-blue-600">
            {fahrenheit.toFixed(1)}°F | {kelvin.toFixed(2)}K
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {new Date(threshold.updatedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};
