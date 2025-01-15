import { AppBar, Toolbar, Typography } from '@mui/material';

export function Header() {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: '#586DC2'
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontFamily: "'Comfortaa', cursive",
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'white',
            textAlign: 'center',
            width: '100%',
            fontSize: '1.5rem',
          }}
        >
          SingSync
        </Typography>
      </Toolbar>
    </AppBar>
  );
} 