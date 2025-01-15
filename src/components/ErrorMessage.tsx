import { Typography } from '@mui/material';
import { ErrorMessageProps } from '../types/components';

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  
  return (
    <Typography color="error" variant="body2">
      {error}
    </Typography>
  );
} 