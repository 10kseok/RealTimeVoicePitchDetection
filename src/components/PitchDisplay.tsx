import { Box, Typography } from '@mui/material';
import { PitchDisplayProps } from '../types/components';
import { formatNoteToKorean } from '../utils/displayFormat';

export function PitchDisplay({ note }: PitchDisplayProps) {
  const koreanNote = note ? formatNoteToKorean(note) : '-';
  
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Typography variant="h4" component="div">
        {koreanNote}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {note ? `${note}` : '-'}
      </Typography>
    </Box>
  );
} 