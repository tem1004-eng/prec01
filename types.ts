
export interface Recording {
  id: string;
  url: string;
  name: string;
  duration: number;
  timestamp: number;
  blob: Blob;
}

export type RecorderState = 'inactive' | 'recording' | 'paused';
