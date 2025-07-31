import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MonitorPage } from './pages/MonitorPage';
import { ToastContainer } from 'react-toastify';
import { APP_CONSTANTS } from './constants/constants';
import Login from './pages/Login';
import Register from './pages/Register';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to={`/monitor/${APP_CONSTANTS.DEFAULT_DEVICE_ID}`} replace />} />
          <Route path="/monitor/:deviceId" element={<MonitorPage />} />
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
