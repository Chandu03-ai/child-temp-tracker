import React, { useState } from 'react';
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

  const handleSave = async () => {
    const newThreshold = parseFloat(editValue);
    if (isNaN(newThreshold) || newThreshold < 35 || newThreshold > 50) {
      alert('Please enter a valid threshold between 35°C and 50°C');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(newThreshold);
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Fever Threshold</h2>
        </div>

        {!disabled && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
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
            <p className="text-sm text-gray-500 mt-1">
              Range: 35.0°C - 50.0°C
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {threshold.threshold.toFixed(1)}°C
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date(threshold.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};