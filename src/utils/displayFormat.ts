import { NOTE_TO_KOR_MAP } from '../config/constants';

export function formatNoteToKorean(note: string): string {
  if (!note) return '';
  
  const noteMatch = note.match(/^([A-G]#?)(\d)$/);
  if (!noteMatch) return note;
  
  const [, noteName, octave] = noteMatch;
  const koreanNote = NOTE_TO_KOR_MAP[noteName as keyof typeof NOTE_TO_KOR_MAP];
  
  return `${octave}옥타브 ${koreanNote}`;
} 