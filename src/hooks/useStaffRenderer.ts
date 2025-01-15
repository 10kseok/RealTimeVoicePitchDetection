import { useEffect, useRef } from 'react';
import { Renderer, Stave, Voice, Formatter, StaveNote, Accidental } from 'vexflow';
import { STAFF_RENDER_CONFIG } from '../config/constants';
import type { StaffRendererConfig } from '../types/staff';

export function useStaffRenderer(containerElement: HTMLDivElement | null, config: StaffRendererConfig) {
  const rendererRef = useRef<Renderer | null>(null);
  const staveRef = useRef<Stave | null>(null);
  const contextRef = useRef<any>(null);

  useEffect(() => {
    if (!containerElement) return;

    containerElement.innerHTML = '';

    const renderer = new Renderer(containerElement, Renderer.Backends.SVG);
    renderer.resize(config.width, config.height);
    const context = renderer.getContext();
    context.setFont(STAFF_RENDER_CONFIG.font.name, STAFF_RENDER_CONFIG.font.size);
    
    const xPos = (config.width - config.staveWidth) / 2;
    const stave = new Stave(xPos, config.yPosition, config.staveWidth);
    stave.addClef('treble').setContext(context).draw();

    rendererRef.current = renderer;
    contextRef.current = context;
    staveRef.current = stave;

    return () => {
      containerElement.innerHTML = '';
    };
  }, [containerElement, config]);

  const renderNote = (note: string | null) => {
    if (!contextRef.current || !staveRef.current || !note) return;

    contextRef.current.clear();
    staveRef.current.setContext(contextRef.current).draw();

    try {
      const noteName = note.slice(0, -1).toLowerCase();
      const octave = note.slice(-1);
      const formattedNote = `${noteName}/${octave}`;
      const keys = [formattedNote.replace('#', 's')];
        
      const staveNote = new StaveNote({
        keys,
        duration: 'q'
      });
      
      if (note.includes('#')) {
        staveNote.addModifier(new Accidental('#'));
      }

      const voice = new Voice({ 
        num_beats: STAFF_RENDER_CONFIG.voice.numBeats, 
        beat_value: STAFF_RENDER_CONFIG.voice.beatValue 
      });
      voice.addTickables([staveNote]);

      new Formatter()
        .joinVoices([voice])
        .format([voice], staveRef.current.getWidth() - STAFF_RENDER_CONFIG.noteSpacing);

      voice.draw(contextRef.current, staveRef.current);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return { renderNote };
} 