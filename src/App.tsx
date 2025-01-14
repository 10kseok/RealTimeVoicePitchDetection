import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box
} from '@mui/material';

// 테마 타입 정의
import { Theme } from '@mui/material/styles';

// 다크 모드 지원을 위한 테마 설정
const theme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
  },
});

export function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              실시간 음성 피치 감지
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            {/* 향후 구현될 컴포넌트들이 위치할 곳 */}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 