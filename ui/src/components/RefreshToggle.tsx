import React from 'react';
import { RefreshCw, Pause, Play } from 'lucide-react';

interface RefreshToggleProps {
  isAutoRefresh: boolean;
  onToggle: () => void;
  onManualRefresh: () => void;
  isRefreshing?: boolean;
  lastRefresh?: string;
}

export const RefreshToggle: React.FC<RefreshToggleProps> = ({
  isAutoRefresh,
  onToggle,
  onManualRefresh,
  isRefreshing = false,
  lastRefresh,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onManualRefresh}
        disabled={isRefreshing}
        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
      
      <button
        onClick={onToggle}
        className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
          isAutoRefresh
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isAutoRefresh ? (
          <>
            <Pause className="w-4 h-4" />
            <span className="hidden sm:inline">Auto</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Manual</span>
          </>
        )}
      </button>
      
      {lastRefresh && (
        <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-pink-500 text-white rounded-lg font-mono text-lg shadow-lg animate-pulse">
         {new Date(lastRefresh).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};