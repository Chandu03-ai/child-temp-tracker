@@ .. @@
+/**
+ * Parse timestamp from backend format to Date object
+ * Backend format: "20250822T040135293" (YYYYMMDDTHHMMSSMMM)
+ * @param timestamp - The timestamp string from backend
+ * @returns Date object or null if invalid
+ */
+export const parseBackendTimestamp = (timestamp: string): Date | null => {
+  if (!timestamp || typeof timestamp !== 'string') {
+    return null;
+  }
+
+  // Handle ISO format (already valid)
+  if (timestamp.includes('-') || timestamp.includes(':')) {
+    const date = new Date(timestamp);
+    return isNaN(date.getTime()) ? null : date;
+  }
+
+  // Handle backend compact format: "20250822T040135293"
+  if (timestamp.length === 17 && timestamp.includes('T')) {
+    const [datePart, timePart] = timestamp.split('T');
+    
+    if (datePart.length === 8 && timePart.length === 9) {
+      const year = datePart.substring(0, 4);
+      const month = datePart.substring(4, 6);
+      const day = datePart.substring(6, 8);
+      
+      const hour = timePart.substring(0, 2);
+      const minute = timePart.substring(2, 4);
+      const second = timePart.substring(4, 6);
+      const millisecond = timePart.substring(6, 9);
+      
+      // Create ISO format string
+      const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`;
+      const date = new Date(isoString);
+      return isNaN(date.getTime()) ? null : date;
+    }
+  }
+
+  // Fallback: try to parse as-is
+  const date = new Date(timestamp);
+  return isNaN(date.getTime()) ? null : date;
+};
+
+/**
+ * Safe date formatting that handles invalid dates
+ */
+const safeFormatDate = (date: Date | null, formatter: (date: Date) => string, fallback = 'Invalid Date'): string => {
+  if (!date || isNaN(date.getTime())) {
+    return fallback;
+  }
+  return formatter(date);
+};
+
 export const formatDateTime = (isoString: string): string => {
-  const date = new Date(isoString);
-  return date.toLocaleString('en-US', {
+  const date = parseBackendTimestamp(isoString);
+  return safeFormatDate(date, (d) => d.toLocaleString('en-US', {
     year: 'numeric',
     month: 'short',
     day: 'numeric',
     hour: '2-digit',
     minute: '2-digit',
     second: '2-digit',
-  });
+  }));
 };
 
 export const formatTime = (isoString: string): string => {
-  const date = new Date(isoString);
-  return date.toLocaleString('en-US', {
+  const date = parseBackendTimestamp(isoString);
+  return safeFormatDate(date, (d) => d.toLocaleString('en-US', {
     hour: '2-digit',
     minute: '2-digit',
     second: '2-digit',
-  });
+  }));
 };
 
 export const getTimeAgo = (isoString: string): string => {
+  const date = parseBackendTimestamp(isoString);
+  if (!date) {
+    return 'Unknown';
+  }
+  
   const now = new Date();
-  const date = new Date(isoString);
   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
 
   if (diffInSeconds < 60) {
     return `${diffInSeconds}s ago`;
   } else if (diffInSeconds < 3600) {
     const minutes = Math.floor(diffInSeconds / 60);
     return `${minutes}m ago`;
   } else if (diffInSeconds < 86400) {
     const hours = Math.floor(diffInSeconds / 3600);
     return `${hours}h ago`;
   } else {
     const days = Math.floor(diffInSeconds / 86400);
     return `${days}d ago`;
   }
 };