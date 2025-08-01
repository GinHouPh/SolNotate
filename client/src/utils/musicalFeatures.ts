import { Note, NoteType } from '../types/music';

// Key signature types
export type KeySignature = {
  tonic: NoteType;
  mode: 'major' | 'minor';
  accidentals: {
    [key in NoteType]?: 'sharp' | 'flat' | 'natural';
  };
};

// Common key signatures
export const keySignatures: { [key: string]: KeySignature } = {
  'C major': {
    tonic: 'd',
    mode: 'major',
    accidentals: {}
  },
  'G major': {
    tonic: 's',
    mode: 'major',
    accidentals: { f: 'sharp' }
  },
  'D major': {
    tonic: 'r',
    mode: 'major',
    accidentals: { f: 'sharp', c: 'sharp' }
  },
  'A major': {
    tonic: 'l',
    mode: 'major',
    accidentals: { f: 'sharp', c: 'sharp', g: 'sharp' }
  },
  'E major': {
    tonic: 'm',
    mode: 'major',
    accidentals: { f: 'sharp', c: 'sharp', g: 'sharp', d: 'sharp' }
  },
  'B major': {
    tonic: 't',
    mode: 'major',
    accidentals: { f: 'sharp', c: 'sharp', g: 'sharp', d: 'sharp', a: 'sharp' }
  },
  'F# major': {
    tonic: 'f',
    mode: 'major',
    accidentals: { f: 'sharp', c: 'sharp', g: 'sharp', d: 'sharp', a: 'sharp', e: 'sharp' }
  },
  'F major': {
    tonic: 'f',
    mode: 'major',
    accidentals: { b: 'flat' }
  },
  'Bb major': {
    tonic: 't',
    mode: 'major',
    accidentals: { b: 'flat', e: 'flat' }
  },
  'Eb major': {
    tonic: 'm',
    mode: 'major',
    accidentals: { b: 'flat', e: 'flat', a: 'flat' }
  },
  'Ab major': {
    tonic: 'l',
    mode: 'major',
    accidentals: { b: 'flat', e: 'flat', a: 'flat', d: 'flat' }
  },
  'Db major': {
    tonic: 'r',
    mode: 'major',
    accidentals: { b: 'flat', e: 'flat', a: 'flat', d: 'flat', g: 'flat' }
  },
  'Gb major': {
    tonic: 's',
    mode: 'major',
    accidentals: { b: 'flat', e: 'flat', a: 'flat', d: 'flat', g: 'flat', c: 'flat' }
  }
};

// Apply accidentals to a note based on key signature
export const applyAccidentals = (note: Note, keySignature: KeySignature): Note => {
  const accidental = keySignature.accidentals[note.type];
  if (!accidental) return note;

  return {
    ...note,
    accidental
  };
};

// Get the relative minor/major key
export const getRelativeKey = (keySignature: KeySignature): KeySignature => {
  const noteOrder: NoteType[] = ['d', 'r', 'm', 'f', 's', 'l', 't'];
  const currentIndex = noteOrder.indexOf(keySignature.tonic);
  
  if (keySignature.mode === 'major') {
    // Get relative minor (6th scale degree)
    const minorTonic = noteOrder[(currentIndex + 5) % 7];
    return {
      tonic: minorTonic,
      mode: 'minor',
      accidentals: keySignature.accidentals
    };
  } else {
    // Get relative major (3rd scale degree)
    const majorTonic = noteOrder[(currentIndex + 2) % 7];
    return {
      tonic: majorTonic,
      mode: 'major',
      accidentals: keySignature.accidentals
    };
  }
};

// Check if a note is in the current key
export const isNoteInKey = (note: Note, keySignature: KeySignature): boolean => {
  const noteOrder: NoteType[] = ['d', 'r', 'm', 'f', 's', 'l', 't'];
  const tonicIndex = noteOrder.indexOf(keySignature.tonic);
  const noteIndex = noteOrder.indexOf(note.type);
  
  // Calculate the interval from the tonic
  const interval = (noteIndex - tonicIndex + 7) % 7;
  
  // Define the intervals for major and minor scales
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
  
  const intervals = keySignature.mode === 'major' ? majorIntervals : minorIntervals;
  return intervals.includes(interval);
};

// Get the scale degrees for a key
export const getScaleDegrees = (keySignature: KeySignature): NoteType[] => {
  const noteOrder: NoteType[] = ['d', 'r', 'm', 'f', 's', 'l', 't'];
  const tonicIndex = noteOrder.indexOf(keySignature.tonic);
  
  return noteOrder.map((_, index) => 
    noteOrder[(tonicIndex + index) % 7]
  );
}; 