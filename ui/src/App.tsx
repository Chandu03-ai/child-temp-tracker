import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MonitorPage } from './pages/MonitorPage';
import { APP_CONSTANTS } from './constants';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={`/monitor/${APP_CONSTANTS.DEFAULT_DEVICE_ID}`} replace />} 
        />
        <Route path="/monitor/:deviceId" element={<MonitorPage />} />
        <Route 
          path="*" 
          element={<Navigate to={`/monitor/${APP_CONSTANTS.DEFAULT_DEVICE_ID}`} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;