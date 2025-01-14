import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { AudioState, AudioContextState } from '../types/audio';
import { ERROR_MESSAGES, AUDIO_CONFIG } from '../config/constants';
import { detectPitch } from '../utils/pitchDetection';

export function AudioAnalyzer() {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    hasPermission: false,
    error: null,
    currentNote: null,
    currentFrequency: null,
  });

  const [audioCtxState, setAudioCtxState] = useState<AudioContextState>({
    audioContext: null,
    analyser: null,
    mediaStream: null,
  });

  const animationFrameRef = useRef<number>();

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: AUDIO_CONFIG.sampleRate,
          sampleSize: 16,
        } 
      });
      
      const audioContext = new AudioContext({
        sampleRate: AUDIO_CONFIG.sampleRate,
        latencyHint: 'interactive'
      });

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 5.0;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = AUDIO_CONFIG.fftSize;
      analyser.smoothingTimeConstant = 0.4;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(gainNode);
      gainNode.connect(analyser);
      
      const buffer = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buffer);

      setAudioCtxState({
        audioContext,
        analyser,
        mediaStream: stream,
      });

      setAudioState(prev => ({
        ...prev,
        hasPermission: true,
        error: null,
      }));
    } catch (error) {
      console.error('Audio initialization error:', error);
      setAudioState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.INITIALIZATION_FAILED,
      }));
    }
  }, []);

  const analyzePitch = useCallback(() => {
    if (!audioCtxState.analyser || !audioCtxState.audioContext) return;

    try {
      const buffer = new Float32Array(audioCtxState.analyser.fftSize);
      audioCtxState.analyser.getFloatTimeDomainData(buffer);
      const result = detectPitch(audioCtxState.analyser, audioCtxState.audioContext.sampleRate);
      
      if (result) {
        console.log('Pitch Detection Result:', {
          frequency: result.frequency,
          note: result.note
        });
      }

      setAudioState(prev => ({
        ...prev,
        currentNote: result?.note || null,
        currentFrequency: result?.frequency || null,
      }));

      if (audioState.isRecording) {
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(analyzePitch);
        }, 333);
      }
    } catch (error) {
      console.error('Pitch analysis error:', error);
    }
  }, [audioCtxState, audioState.isRecording]);

  const toggleRecording = useCallback(async () => {
    if (!audioState.hasPermission) {
      await initializeAudio();
    }
    
    setAudioState(prev => {
      const newIsRecording = !prev.isRecording;
      
      if (!newIsRecording && audioCtxState.mediaStream) {
        audioCtxState.mediaStream.getTracks().forEach(track => track.stop());
      } else if (newIsRecording && audioCtxState.mediaStream) {
        audioCtxState.mediaStream.getTracks().forEach(track => track.enabled = true);
      }
      
      return {
        ...prev,
        isRecording: newIsRecording,
      };
    });
  }, [audioState.hasPermission, audioCtxState.mediaStream, initializeAudio]);

  useEffect(() => {
    if (audioState.isRecording) {
      animationFrameRef.current = requestAnimationFrame(analyzePitch);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioState(prev => ({
        ...prev,
        currentNote: null,
        currentFrequency: null,
      }));
    }
  }, [audioState.isRecording, analyzePitch]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioCtxState.audioContext?.state !== 'closed') {
        audioCtxState.audioContext?.close();
      }
    };
  }, [audioCtxState]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <IconButton
        onClick={toggleRecording}
        color={audioState.isRecording ? 'primary' : 'default'}
        sx={{ 
          width: 64, 
          height: 64,
          border: '2px solid',
          borderColor: audioState.isRecording ? 'primary.main' : 'grey.300'
        }}
      >
        {audioState.isRecording ? <MicIcon /> : <MicOffIcon />}
      </IconButton>

      {audioState.isRecording && (
        <Typography variant="h4" component="div" align="center">
          {audioState.currentNote || '-'}
          <Typography variant="body2" color="text.secondary">
            {audioState.currentFrequency ? `${audioState.currentFrequency.toFixed(1)} Hz` : '분석 중...'}
          </Typography>
        </Typography>
      )}

      {audioState.error && (
        <Typography color="error" variant="body2">
          {audioState.error}
        </Typography>
      )}
    </Box>
  );
} 