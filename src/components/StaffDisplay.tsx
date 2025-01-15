import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { StaffDisplayProps } from '../types/components';
import { useStaffRenderer } from '../hooks/useStaffRenderer';
import { STAFF_CONFIG } from '../config/constants';

export function StaffDisplay({ note }: StaffDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { renderNote } = useStaffRenderer(containerRef.current, STAFF_CONFIG);

  useEffect(() => {
    renderNote(note);
  }, [note, renderNote]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        maxWidth: STAFF_CONFIG.width,
        height: STAFF_CONFIG.height,
        margin: '0 auto',
      }}
    />
  );
} 