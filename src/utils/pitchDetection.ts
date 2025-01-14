import { NOTES, A4_FREQUENCY, A4_NOTE_INDEX, AUDIO_CONFIG } from '../config/constants';
import type { PitchDetectionResult } from '../types/audio';

function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE/2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;
  let foundGoodCorrelation = false;

  // DC offset 제거 및 RMS 계산
  let sum = 0;
  for (let i = 0; i < SIZE; i++) {
    sum += buffer[i];
  }
  const average = sum / SIZE;

  const bufferCopy = new Float32Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i] - average;
    bufferCopy[i] = val;
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // 더 낮은 임계값 설정
  if (rms < 0.003) return -1;

  // 정규화
  const THRESHOLD = 0.08;
  for (let i = 0; i < SIZE; i++) {
    bufferCopy[i] /= rms;
  }

  // 최소/최대 주파수에 해당하는 오프셋 범위 계산
  const minOffset = Math.floor(sampleRate / AUDIO_CONFIG.maxFrequency);
  const maxOffset = Math.floor(sampleRate / AUDIO_CONFIG.minFrequency);
  const searchLength = Math.min(MAX_SAMPLES, maxOffset);

  // 상관관계 계산
  for (let offset = minOffset; offset < searchLength; offset++) {
    let correlation = 0;
    let count = 0;

    for (let i = 0; i < searchLength - offset; i++) {
      correlation += Math.abs(bufferCopy[i] - bufferCopy[i + offset]);
      count++;
    }

    correlation = 1 - (correlation / count);

    if (correlation > THRESHOLD && correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
      foundGoodCorrelation = true;
    }
  }

  if (!foundGoodCorrelation || bestOffset === -1) return -1;

  // 주파수 계산 및 보정
  const frequency = sampleRate / bestOffset;
  
  // 주파수 범위 검증 - 더 넓은 범위 허용
  if (frequency < AUDIO_CONFIG.minFrequency * 0.8 || 
      frequency > AUDIO_CONFIG.maxFrequency * 1.2) {
    return -1;
  }

  return frequency;
}

function frequencyToNote(frequency: number): string {
  // 주파수 범위 검증
  if (frequency < AUDIO_CONFIG.minFrequency * 0.8 || 
      frequency > AUDIO_CONFIG.maxFrequency * 1.2) {
    return 'Invalid';
  }
  
  // MIDI 노트 번호 계산
  const noteNum = 12 * Math.log2(frequency / A4_FREQUENCY) + A4_NOTE_INDEX;
  const roundedNoteNum = Math.round(noteNum);
  
  // 옥타브와 노트 인덱스 계산
  const octave = Math.floor(roundedNoteNum / 12) - 1;
  const noteIndex = ((roundedNoteNum % 12) + 12) % 12;
  
  if (octave < -1 || octave > 9) {
    return 'Invalid';
  }
  
  return `${NOTES[noteIndex]}${octave}`;
}

export function detectPitch(analyser: AnalyserNode, sampleRate: number): PitchDetectionResult | null {
  const buffer = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buffer);

  const frequency = autoCorrelate(buffer, sampleRate);
  if (frequency === -1) return null;

  const note = frequencyToNote(frequency);
  if (note === 'Invalid') return null;

  return {
    frequency: Math.round(frequency * 10) / 10,
    note
  };
} 