import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './config/theme';
import { AudioAnalyzer } from './components/AudioAnalyzer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <AudioAnalyzer />
      <Footer />
    </ThemeProvider>
  );
}

export default App; 