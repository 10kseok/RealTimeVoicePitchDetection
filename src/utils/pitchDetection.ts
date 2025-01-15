import { NOTES, A4_FREQUENCY, A4_NOTE_INDEX, AUDIO_CONFIG } from '../config/constants';
import type { PitchDetectionResult } from '../types/audio';

function yinPitchDetection(buffer: Float32Array, sampleRate: number): number {
  // 임계값 설정 (이 값보다 낮은 차이를 가질 때 주기로 인정)
  const threshold = 0.15;
  // 입력 버퍼의 크기
  const bufferSize = buffer.length;
  // 분석할 버퍼의 절반 크기 (YIN 알고리즘은 절반만 사용)
  const halfBufferSize = Math.floor(bufferSize / 2);
  // YIN 알고리즘의 결과를 저장할 배열
  const yinBuffer = new Float32Array(halfBufferSize);

  // Step 1: 차이 함수 계산
  for (let t = 0; t < halfBufferSize; t++) {
    yinBuffer[t] = 0;
    for (let i = 0; i < halfBufferSize; i++) {
      // 현재 샘플과 t만큼 떨어진 샘플의 차이 계산
      const delta = buffer[i] - buffer[i + t];
      // 차이의 제곱을 누적
      yinBuffer[t] += delta * delta;
    }
  }

  // Step 2: 누적 평균 정규화된 차이 함수 계산
  let runningSum = 0;
  yinBuffer[0] = 1;
  for (let t = 1; t < halfBufferSize; t++) {
    runningSum += yinBuffer[t];
    // 현재까지의 평균으로 나누어 정규화
    yinBuffer[t] = yinBuffer[t] * t / runningSum;
  }

  // Step 3: 절대 임계값 방법으로 주기 찾기
  let tau = -1;
  let minValue = Number.POSITIVE_INFINITY;

  // 임계값보다 작은 첫 번째 dip(골짜기) 찾기
  for (let t = 2; t < halfBufferSize; t++) {
    if (yinBuffer[t] < threshold && yinBuffer[t] < minValue) {
      minValue = yinBuffer[t];
      tau = t;
      // 충분히 작은 값을 찾으면 중단
      if (minValue < threshold) break;
    }
  }

  // 주기를 찾지 못한 경우
  if (tau === -1 || minValue >= threshold) {
    return -1;
  }

  // Step 4: 포물선 보간법으로 정확도 향상
  let betterTau = tau;
  if (tau > 0 && tau < halfBufferSize - 1) {
    // 이웃한 세 점을 사용하여 더 정확한 주기 추정
    const s0 = yinBuffer[tau - 1];
    const s1 = yinBuffer[tau];
    const s2 = yinBuffer[tau + 1];
    // 포물선 피팅을 통한 보정값 계산
    const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    betterTau = tau + adjustment;
  }

  // 주기를 주파수로 변환
  const frequency = sampleRate / betterTau;

  // 주파수 범위 검증
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

  const frequency = yinPitchDetection(buffer, sampleRate);
  if (frequency === -1) return null;

  const note = frequencyToNote(frequency);
  if (note === 'Invalid') return null;

  return {
    frequency: Math.round(frequency * 10) / 10,
    note
  };
} 