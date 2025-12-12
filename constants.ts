export const APP_CONFIG = {
  TARGET_URL: 'https://irsakitchen.com/activeorders',
  // Polling interval (Worker will handle this)
  POLL_INTERVAL_MS: 15000, 
  PING_SOUND_URL: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // A pleasant bell/chime
};

export enum MonitorStatus {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
  ALERT = 'ALERT',
}

export const STORAGE_KEYS = {
  MONITORING_ENABLED: 'irsa_monitor_enabled',
  LAST_CONTENT_LENGTH: 'irsa_last_content_length',
};