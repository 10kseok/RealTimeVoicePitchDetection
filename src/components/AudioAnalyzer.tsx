import { Box } from '@mui/material';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { RecordButton } from './RecordButton';
import { PitchDisplay } from './PitchDisplay';
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
      gap={2}
    >
      <RecordButton 
        isRecording={audioState.isRecording}
        onClick={toggleRecording}
      />

      {audioState.isRecording && (
        <PitchDisplay
          note={audioState.currentNote}
          frequency={audioState.currentFrequency}
        />
      )}

      <ErrorMessage error={audioState.error} />
    </Box>
  );
} 