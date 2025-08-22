@@ .. @@
 import React, { useState, useRef } from 'react';
 import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
 import type { TemperatureReading } from '../types/temperature';
+import { parseBackendTimestamp } from '../utils/dateUtils';
 
 interface MiniGraphProps {
   readings: TemperatureReading[];
@@ .. @@
   const toUnit = (temp: number) => (unit === 'F' ? toFahrenheit(temp) : temp);
   const unitLabel = unit === 'F' ? '°F' : '°C';
 
-  const filteredReadings = readings.filter((r) =>
-    new Date(r.timestamp).toISOString().startsWith(selectedDate)
-  );
+  const filteredReadings = readings.filter((r) => {
+    const date = parseBackendTimestamp(r.timestamp);
+    if (!date) return false;
+    return date.toISOString().startsWith(selectedDate);
+  });
 
   if (filteredReadings.length === 0) {
     return (
@@ .. @@
   }
 
   const sortedReadings = [...filteredReadings].sort(
-    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
+    (a, b) => {
+      const dateA = parseBackendTimestamp(a.timestamp);
+      const dateB = parseBackendTimestamp(b.timestamp);
+      if (!dateA || !dateB) return 0;
+      return dateA.getTime() - dateB.getTime();
+    }
   );
 
   const temperatures = sortedReadings.map((r) => toUnit(r.temperature));
@@ .. @@
           {points.map((point, index) => {
             const temp = temperatures[index];
-            const time = new Date(sortedReadings[index].timestamp).toLocaleTimeString([], {
-              hour: '2-digit',
-              minute: '2-digit',
-            });
+            const date = parseBackendTimestamp(sortedReadings[index].timestamp);
+            const time = date ? date.toLocaleTimeString([], {
+              hour: '2-digit',
+              minute: '2-digit',
+            }) : 'Invalid';
             const isFever = temp >= toUnit(threshold);
 
             return (