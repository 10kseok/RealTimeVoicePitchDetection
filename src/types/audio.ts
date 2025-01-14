export interface AudioState {
  isRecording: boolean;
  hasPermission: boolean;
  error: string | null;
  currentNote: string | null;
  currentFrequency: number | null;
}

export interface AudioContextState {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  mediaStream: MediaStream | null;
}

export interface PitchDetectionResult {
  frequency: number;
  note: string;
} 