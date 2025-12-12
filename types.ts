export interface MonitorState {
  isActive: boolean;
  lastCheck: Date | null;
  error: string | null;
  orderCount: number; // For demo/tracking purposes
}

export interface SoundControls {
  muted: boolean;
  volume: number;
}