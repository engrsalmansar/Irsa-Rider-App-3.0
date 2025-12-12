import { APP_CONFIG } from './constants';

class AudioService {
  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio(APP_CONFIG.PING_SOUND_URL);
    this.audio.preload = 'auto';
  }

  public playAlert(volume: number = 1.0) {
    this.audio.volume = volume;
    this.audio.currentTime = 0;
    this.audio.play().catch((e) => {
      console.error("Audio playback failed. User interaction required.", e);
    });
  }

  public stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

export const audioService = new AudioService();