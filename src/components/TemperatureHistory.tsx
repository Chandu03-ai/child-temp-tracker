@@ .. @@
 } from 'lucide-react';
 import type { TemperatureReading } from '../types/temperature';
 import { formatTime, getTimeAgo } from '../utils/dateUtils';
+import { parseBackendTimestamp } from '../utils/dateUtils';
 
 interface TemperatureHistoryProps {
   readings: TemperatureReading[];
@@ .. @@
   const sortedReadings = useMemo(
     () =>
       [...readings].sort(
-        (a, b) =>
-          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
+        (a, b) => {
+          const dateA = parseBackendTimestamp(a.timestamp);
+          const dateB = parseBackendTimestamp(b.timestamp);
+          if (!dateA || !dateB) return 0;
+          return dateB.getTime() - dateA.getTime();
+        }
       ),
     [readings]
   );
@@ .. @@
   const displayedReadings = showAll
     ? sortedReadings
     : sortedReadings.slice(0, 10);
 
   const groupedReadings = displayedReadings.reduce((acc, reading) => {
-    const date = new Date(reading.timestamp);
+    const date = parseBackendTimestamp(reading.timestamp);
+    if (!date) return acc;
+    
     const year = date.getFullYear();
     const month = date.toLocaleString('default', { month: 'long' });
     const day = date.getDate();
     const hour = date.getHours();
 
     const key = `${year}-${month}-${day}-${hour}`;
     if (!acc[key]) {
       acc[key] = {
         label: `${day} ${month} ${year} • ${hour}:00`,
         latestUpdate: formatTime(reading.timestamp),
         readings: []
       };
     }
     acc[key].readings.push(reading);
     return acc;
   }, {} as Record<string, { label: string; latestUpdate: string; readings: TemperatureReading[] }>);