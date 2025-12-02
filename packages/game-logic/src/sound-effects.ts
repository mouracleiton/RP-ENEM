/**
 * Sound Effects Module
 * Provides synthesized sound effects for UI interactions
 * Uses Web Audio API to generate sounds without external files
 */

type SoundType =
  | 'click'
  | 'success'
  | 'error'
  | 'levelUp'
  | 'achievement'
  | 'notification'
  | 'xpGain'
  | 'streakBonus'
  | 'complete';

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

const STORAGE_KEY = 'ita-rp-game-sound-settings';

let audioContext: AudioContext | null = null;

// Default settings
const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 0.5,
};

/**
 * Get sound settings from localStorage
 */
export function getSoundSettings(): SoundSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore errors
  }
  return defaultSettings;
}

/**
 * Save sound settings to localStorage
 */
export function saveSoundSettings(settings: Partial<SoundSettings>): void {
  const current = getSoundSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Initialize or get AudioContext
 */
function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
}

/**
 * Create an oscillator-based sound effect
 */
function createTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain: number = 0.3
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  const settings = getSoundSettings();
  const volume = settings.volume * gain;

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

/**
 * Play a sequence of tones
 */
function playSequence(
  ctx: AudioContext,
  notes: Array<{ freq: number; duration: number; delay?: number }>,
  type: OscillatorType = 'sine'
): void {
  let time = ctx.currentTime;

  notes.forEach((note) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = note.freq;
    oscillator.type = type;

    const settings = getSoundSettings();
    const volume = settings.volume * 0.3;

    gainNode.gain.setValueAtTime(volume, time + (note.delay || 0));
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + (note.delay || 0) + note.duration);

    oscillator.start(time + (note.delay || 0));
    oscillator.stop(time + (note.delay || 0) + note.duration);

    time += note.duration + (note.delay || 0);
  });
}

/**
 * Play a sound effect
 */
export function playSound(sound: SoundType): void {
  const settings = getSoundSettings();
  if (!settings.enabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  switch (sound) {
    case 'click':
      // Short click sound
      createTone(ctx, 800, 0.05, 'square', 0.1);
      break;

    case 'success':
      // Ascending happy sound
      playSequence(ctx, [
        { freq: 523.25, duration: 0.1 }, // C5
        { freq: 659.25, duration: 0.1 }, // E5
        { freq: 783.99, duration: 0.2 }, // G5
      ], 'triangle');
      break;

    case 'error':
      // Descending error sound
      playSequence(ctx, [
        { freq: 400, duration: 0.1 },
        { freq: 300, duration: 0.15 },
      ], 'square');
      break;

    case 'levelUp':
      // Epic level up fanfare
      playSequence(ctx, [
        { freq: 523.25, duration: 0.1 }, // C5
        { freq: 659.25, duration: 0.1 }, // E5
        { freq: 783.99, duration: 0.1 }, // G5
        { freq: 1046.50, duration: 0.3 }, // C6
      ], 'triangle');
      break;

    case 'achievement':
      // Achievement unlocked jingle
      playSequence(ctx, [
        { freq: 587.33, duration: 0.1 }, // D5
        { freq: 739.99, duration: 0.1 }, // F#5
        { freq: 880.00, duration: 0.1 }, // A5
        { freq: 1174.66, duration: 0.25 }, // D6
      ], 'sine');
      break;

    case 'notification':
      // Soft notification ping
      playSequence(ctx, [
        { freq: 880, duration: 0.1 },
        { freq: 1108.73, duration: 0.15, delay: 0.05 },
      ], 'sine');
      break;

    case 'xpGain':
      // Quick XP sound
      createTone(ctx, 1200, 0.08, 'sine', 0.2);
      setTimeout(() => {
        const ctx2 = getAudioContext();
        if (ctx2) createTone(ctx2, 1400, 0.08, 'sine', 0.15);
      }, 50);
      break;

    case 'streakBonus':
      // Fire streak sound
      playSequence(ctx, [
        { freq: 400, duration: 0.05 },
        { freq: 500, duration: 0.05 },
        { freq: 600, duration: 0.05 },
        { freq: 700, duration: 0.05 },
        { freq: 800, duration: 0.1 },
      ], 'sawtooth');
      break;

    case 'complete':
      // Task complete sound
      playSequence(ctx, [
        { freq: 440, duration: 0.1 },
        { freq: 554.37, duration: 0.1 },
        { freq: 659.25, duration: 0.15 },
      ], 'triangle');
      break;
  }
}

/**
 * React hook for sound effects
 */
export function useSoundEffects() {
  const settings = getSoundSettings();

  const play = (sound: SoundType) => {
    playSound(sound);
  };

  const toggleEnabled = () => {
    const newEnabled = !settings.enabled;
    saveSoundSettings({ enabled: newEnabled });
    if (newEnabled) {
      playSound('click');
    }
  };

  const setVolume = (volume: number) => {
    saveSoundSettings({ volume: Math.max(0, Math.min(1, volume)) });
  };

  return {
    enabled: settings.enabled,
    volume: settings.volume,
    play,
    toggleEnabled,
    setVolume,
    sounds: {
      click: () => play('click'),
      success: () => play('success'),
      error: () => play('error'),
      levelUp: () => play('levelUp'),
      achievement: () => play('achievement'),
      notification: () => play('notification'),
      xpGain: () => play('xpGain'),
      streakBonus: () => play('streakBonus'),
      complete: () => play('complete'),
    },
  };
}
