const parseBackendTimestamp = (ts: string): Date => {
  const year = parseInt(ts.slice(0, 4));
  const month = parseInt(ts.slice(4, 6)) - 1; 
  const day = parseInt(ts.slice(6, 8));
  const hour = parseInt(ts.slice(8, 10));
  const minute = parseInt(ts.slice(10, 12));
  const second = parseInt(ts.slice(12, 14));
  const millisecond = parseInt(ts.slice(14, 17)) || 0;

  return new Date(year, month, day, hour, minute, second, millisecond);
};

export const formatDateTime = (time?: string): string => {
  if (!time) return new Date().toLocaleString("en-IN", { 
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Kolkata" 
  });

  const date = /^\d{17}$/.test(time) ? parseBackendTimestamp(time) : new Date(time);

  return date.toLocaleString("en-IN", { 
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Kolkata"
  });
};

export const formatTime = (time?: string): string => {
  const date = !time ? new Date() : (/^\d{17}$/.test(time) ? parseBackendTimestamp(time) : new Date(time));

  return date.toLocaleString("en-IN", { 
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Kolkata"
  });
};

export const getTimeAgo = (time: string): string => {
  const date = /^\d{17}$/.test(time) ? parseBackendTimestamp(time) : new Date(time);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const getCurrentIndiaDateTime = (): string => formatDateTime();
export const getCurrentIndiaTime = (): string => formatTime();
