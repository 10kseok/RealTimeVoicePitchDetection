export const AUDIO_CONFIG = {
  sampleRate: 44100,
  fftSize: 2048,
  minPitch: 50,  // Hz
  maxPitch: 2000 // Hz
} as const;

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const; 