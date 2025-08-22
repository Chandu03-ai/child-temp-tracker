@@ .. @@
 import { APP_CONSTANTS } from '../constants/constants';
 import ChildTempImg from '../assets/ChildTempLogo.png';
 import { useAuthStore } from '../store/authStore';
 import { MiniGraph } from '../components/MiniGraph';
+import { parseBackendTimestamp } from '../utils/dateUtils';
 import type { 
   TemperatureReading, 
   TemperatureStatus, 
   TemperatureThreshold, 
   FeverAlert 
 } from '../types/temperature';
 
 export const MonitorPage: React.FC = () => {
@@ .. @@
           <div className="mt-4 md:mt-0 flex items-center space-x-4">
             <div className="text-sm">
               {(status && (status.temperature >= (threshold?.threshold ?? APP_CONSTANTS.FEVER_THRESHOLD_DEFAULT))) ? (
+                (() => {
+                  const date = parseBackendTimestamp(status.timestamp.toString());
+                  const timeString = date ? date.toLocaleTimeString() : 'Unknown time';
+                  return (
                 <span className="text-red-200 font-semibold">
                   🔴 High Temp: {status.temperature}°F at{" "}
-                  {new Date(status.timestamp).toLocaleTimeString()}
+                  {timeString}
                 </span>
+                  );
+                })()
               ) : (
                 <span className="text-green-100 font-semibold">🟢 All Normal</span>
               )}
             </div>