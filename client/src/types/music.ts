export type NoteType = 'd' | 'r' | 'm' | 'f' | 's' | 'l' | 't' | 'c' | 'b';
export type NoteDuration = 'beat' | 'half' | 'quarter' | 'eighth' | 'sixteenth';
export type VoicePart = 'S' | 'A' | 'T' | 'B';
export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
export type Subdivision = '' | '.' | '..' | '...';
export type Accidental = 'sharp' | 'flat' | 'natural';
export type Dynamic = 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff' | 'sfz' | 'fp';

export interface Note {
  type: NoteType;
  duration: NoteDuration;
  subdivision: Subdivision;
  isHighOctave: boolean;
  isLowOctave: boolean;
  position: number;
  subPosition: number; // Position within the beat (0-3 for subdivisions)
  accidental?: Accidental;
  dynamic?: Dynamic;
}

export interface DynamicMarking {
  id: string;
  position: number;
  dynamic: Dynamic;
  voicePart?: VoicePart; // If undefined, applies to all voices
}

export interface Voice {
  part: VoicePart;
  notes: Note[];
}

export interface Marker {
  id: string;
  position: number;
  text: string;
}

export interface Measure {
  id: string;
  marker?: Marker;
  dynamics?: DynamicMarking[];
  notes: {
    S: Note[];
    A: Note[];
    T: Note[];
    B: Note[];
  };
}

export interface LyricEntry {
  measureIdx: number;
  segIdx: number;
  boxIdx: number;
  text: string;
  syllable?: string; // For multi-syllable words
}

export interface Composition {
  id: string;
  name: string;
  timeSignature: TimeSignature;
  measures: Measure[];
  tempo: number;
  markers: Marker[];
  lyrics?: LyricEntry[];
}

export type Tool = {
  value: string;
  label: string;
  icon?: string;
};