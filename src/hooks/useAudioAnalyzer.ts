import { useState, useCallback, useEffect, useRef } from 'react';
import { AudioState, AudioContextState } from '../types/audio';
import { ERROR_MESSAGES, AUDIO_CONFIG } from '../config/constants';
import { detectPitch } from '../utils/pitchDetection';

export function useAudioAnalyzer() {
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

  const intervalRef = useRef<number>();

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

      const { analyser } = await setupAudioNodes(audioContext, stream);
      
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

    const buffer = new Float32Array(audioCtxState.analyser.fftSize);
    audioCtxState.analyser.getFloatTimeDomainData(buffer);
    const result = detectPitch(audioCtxState.analyser, audioCtxState.audioContext.sampleRate);
    
    setAudioState(prev => ({
      ...prev,
      currentNote: result?.note || null,
      currentFrequency: result?.frequency || null,
    }));
  }, [audioCtxState]);

  const toggleRecording = useCallback(async () => {
    let newIsRecording = audioState.isRecording;
    setAudioState(prev => {
      newIsRecording = !prev.isRecording;
      if (audioCtxState.mediaStream) {
        audioCtxState.mediaStream.getTracks().forEach(track => {
          if (newIsRecording) {
            track.enabled = true;
          } else {
            track.stop();
          }
        });
      }
      
      return {
        ...prev,
        isRecording: newIsRecording,
        currentNote: newIsRecording ? prev.currentNote : null,
        currentFrequency: newIsRecording ? prev.currentFrequency : null,
      };
    });
    // 상태 변화 후 마이크 동작
    if (newIsRecording) {
      await initializeAudio();
    }
  }, [audioCtxState.mediaStream, audioState.isRecording, initializeAudio]);

  // 녹음 상태 변경 시 피치 분석 시작/중지
  useEffect(() => {
    if (audioState.isRecording) {
      // 200ms 간격으로 analyzePitch 호출 (초당 5회)
      intervalRef.current = window.setInterval(analyzePitch, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audioState.isRecording, analyzePitch]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioCtxState.audioContext?.state !== 'closed') {
        audioCtxState.audioContext?.close();
      }
      if (audioCtxState.mediaStream) {
        audioCtxState.mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioCtxState]);

  return {
    audioState,
    toggleRecording,
  };
}

async function setupAudioNodes(audioContext: AudioContext, stream: MediaStream) {
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

  return { analyser };
} 