import { Box } from '@mui/material';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { RecordButton } from './RecordButton';
import { PitchDisplay } from './PitchDisplay';
import { StaffDisplay } from './StaffDisplay';
import { ErrorMessage } from './ErrorMessage';

export function AudioAnalyzer() {
  const { audioState, toggleRecording } = useAudioAnalyzer();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
    >
      
      {audioState.isRecording && (
        <>
          <StaffDisplay
              note={audioState.currentNote}
          />
          <PitchDisplay
            note={audioState.currentNote}
          />
        </>
      )}

      <RecordButton 
        isRecording={audioState.isRecording}
        onClick={toggleRecording}
      />

      <ErrorMessage error={audioState.error} />
    </Box>
  );
} 