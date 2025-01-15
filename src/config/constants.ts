export const AUDIO_CONFIG = {
  sampleRate: 44100,
  fftSize: 2048,
  minFrequency: 50,  // Hz
  maxFrequency: 2000 // Hz
} as const;

export const ERROR_MESSAGES = {
  PERMISSION_DENIED: '마이크 권한이 거부되었습니다.',
  NOT_SUPPORTED: '브라우저가 마이크 접근을 지원하지 않습니다.',
  INITIALIZATION_FAILED: '마이크 초기화에 실패했습니다.',
} as const;

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// A4 = 440Hz를 기준으로 한 주파수 계산
export const A4_FREQUENCY = 440;
export const A4_NOTE_INDEX = 69; // MIDI note number for A4 

export const STAFF_CONFIG = {
  width: 300,
  height: 150,
  staveWidth: 120,
  yPosition: 40,
} as const;

export const STAFF_RENDER_CONFIG = {
  font: {
    name: 'Arial',
    size: 10,
  },
  voice: {
    numBeats: 1,
    beatValue: 4,
  },
  noteSpacing: 50, // 음표와 악보 끝 사이의 여백
} as const; 