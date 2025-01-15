import { IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { RecordButtonProps } from '../types/components';

export function RecordButton({ isRecording, onClick }: RecordButtonProps) {
  return (
    <IconButton
      onClick={onClick}
      color={isRecording ? 'primary' : 'default'}
      sx={{ 
        width: 64, 
        height: 64,
        border: '2px solid',
        borderColor: isRecording ? 'primary.main' : 'grey.300'
      }}
    >
      {isRecording ? <MicIcon /> : <MicOffIcon />}
    </IconButton>
  );
} 