import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#586DC2',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: '#586DC2',
        },
      },
    },
  },
}); 