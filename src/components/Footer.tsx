import { Box } from '@mui/material';

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        padding: 2,
        textAlign: 'center',
      }}
    >
      <a href="https://hits.seeyoufarm.com">
        <img 
          src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2F10kseok.github.io%2FRealTimeVoicePitchDetection%2F&count_bg=%23586DC2&title_bg=%23C7C7C7&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false"
          alt="방문자 수"
        />
      </a>
    </Box>
  );
} 