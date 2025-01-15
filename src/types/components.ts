export interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export interface PitchDisplayProps {
  note: string | null;
}

export interface ErrorMessageProps {
  error: string | null;
}

export interface StaffDisplayProps {
  note: string | null;
} 