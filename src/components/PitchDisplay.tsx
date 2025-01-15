import { Typography } from '@mui/material';
import { PitchDisplayProps } from '../types/components';

export function PitchDisplay({ note, frequency }: PitchDisplayProps) {
  return (
    <Typography variant="h4" component="div" align="center">
      {note || '-'}
      <Typography variant="body2" color="text.secondary">
        {frequency ? `${frequency.toFixed(1)} Hz` : '입력 없음'}
      </Typography>
    </Typography>
  );
} 