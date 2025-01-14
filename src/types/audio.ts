export interface AudioState {
  isRecording: boolean;
  pitch: number | null;
  note: string | null;
}

export interface PitchDetectionResult {
  pitch: number;
  note: string;
  confidence: number;
} 