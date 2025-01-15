import { useCallback, useEffect, useRef } from 'react';
import { Renderer, Stave, Voice, Formatter, StaveNote, Accidental, RenderContext } from 'vexflow';
import { STAFF_RENDER_CONFIG } from '../config/constants';
import type { StaffRendererConfig } from '../types/staff';

export function useStaffRenderer(containerElement: HTMLDivElement | null, config: StaffRendererConfig) {
  const staveRef = useRef<Stave | null>(null);
  const contextRef = useRef<RenderContext | null>(null);
  const currentNoteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerElement) return;
    
    const renderer = new Renderer(containerElement, Renderer.Backends.SVG);

    renderer.resize(config.width, config.height);
    contextRef.current = renderer.getContext();
    contextRef.current.setFont(STAFF_RENDER_CONFIG.font.name, STAFF_RENDER_CONFIG.font.size);
    
    const xPos = (config.width - config.staveWidth) / 2;
    const stave = new Stave(xPos, config.yPosition, config.staveWidth);
    stave.addClef('treble').setContext(contextRef.current).draw();
    staveRef.current = stave;

    return () => {
      containerElement.innerHTML = '';
      currentNoteRef.current = null;
      staveRef.current = null;
      contextRef.current = null;
    };
  }, [containerElement, config]);

  const renderNote = useCallback((note: string | null) => {
    if (!containerElement || !note || !staveRef.current || !contextRef.current || note === currentNoteRef.current) return;

    const prevNote = containerElement.querySelector('svg');
    const existingNoteGroup = prevNote?.querySelector('.vf-note-group');
    
    if (existingNoteGroup) {
      existingNoteGroup.remove();
    }

    const noteName = note.slice(0, -1).toLowerCase();
    const octave = note.slice(-1);
    const formattedNote = `${noteName}/${octave}`;

    const staveNote = new StaveNote({
      keys: [formattedNote],
      duration: 'q',
      align_center: true,
    });
    
    if (note.includes('#')) {
      staveNote.addModifier(new Accidental('#'));
    }

    const voice = new Voice({ 
      num_beats: STAFF_RENDER_CONFIG.voice.numBeats, 
      beat_value: STAFF_RENDER_CONFIG.voice.beatValue 
    });
    voice.addTickable(staveNote);

    new Formatter()
      .joinVoices([voice])
      .format([voice], staveRef.current.getWidth() - STAFF_RENDER_CONFIG.noteSpacing, {
        align_rests: true,
        stave: staveRef.current,
        auto_beam: false,
      });

    voice.draw(contextRef.current, staveRef.current);

    const newNoteGroup = prevNote?.querySelector('g:last-of-type');
    if (newNoteGroup) {
      newNoteGroup.classList.add('vf-note-group');
    }

    currentNoteRef.current = note;
  }, [contextRef, staveRef, currentNoteRef, containerElement]);

  return { renderNote };
} 
