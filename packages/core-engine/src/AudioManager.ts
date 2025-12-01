import { AudioManager as IAudioManager } from '@ita-rp/shared-types';

export class AudioManager implements IAudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private masterVolume = 1.0;
  private musicVolume = 0.7;
  private soundVolume = 0.8;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create Web Audio API context for better control
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio');
    }

    this.isInitialized = true;
    console.log('Audio manager initialized');
  }

  private audioContext: AudioContext | null = null;

  async loadSound(key: string, path: string): Promise<void> {
    const audio = new Audio(path);
    audio.volume = this.soundVolume * this.masterVolume;
    
    await new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', resolve);
      audio.addEventListener('error', reject);
    });

    this.sounds.set(key, audio);
  }

  playSound(soundKey: string, volume?: number): void {
    const sound = this.sounds.get(soundKey);
    if (!sound) {
      console.warn(`Sound ${soundKey} not found`);
      return;
    }

    const finalVolume = (volume || this.soundVolume) * this.masterVolume;
    sound.volume = finalVolume;
    sound.currentTime = 0;
    sound.play().catch(error => {
      console.warn(`Failed to play sound ${soundKey}:`, error);
    });
  }

  playMusic(musicKey: string, loop = true, volume?: number): void {
    const music = this.sounds.get(musicKey);
    if (!music) {
      console.warn(`Music ${musicKey} not found`);
      return;
    }

    // Stop current music
    this.stopMusic();

    this.currentMusic = music;
    const finalVolume = (volume || this.musicVolume) * this.masterVolume;
    music.volume = finalVolume;
    music.loop = loop;
    music.currentTime = 0;
    
    music.play().catch(error => {
      console.warn(`Failed to play music ${musicKey}:`, error);
    });
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume * this.masterVolume;
    }
  }

  setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  private updateAllVolumes(): void {
    // Update music volume
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume * this.masterVolume;
    }

    // Update all sound volumes
    this.sounds.forEach((sound) => {
      if (sound !== this.currentMusic) {
        sound.volume = this.soundVolume * this.masterVolume;
      }
    });
  }

  destroy(): void {
    this.stopMusic();
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
  }
}