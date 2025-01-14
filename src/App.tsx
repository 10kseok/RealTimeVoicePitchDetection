import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './config/theme';
import { AudioAnalyzer } from './components/AudioAnalyzer';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AudioAnalyzer />
    </ThemeProvider>
  );
}

export default App; 