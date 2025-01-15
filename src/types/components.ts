export interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export interface PitchDisplayProps {
  note: string | null;
  frequency: number | null;
}

export interface ErrorMessageProps {
  error: string | null;
} 