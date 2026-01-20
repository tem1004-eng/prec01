
export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [
    hrs > 0 ? hrs.toString().padStart(2, '0') : null,
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].filter(Boolean);
  
  return parts.join(':');
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp));
};

export const generateFileName = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  
  return `필통녹음_${dateStr}_${timeStr}`;
};
