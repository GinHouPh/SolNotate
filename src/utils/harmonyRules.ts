import { NoteType, Note } from '../types/music';

// Define chord types
export type ChordType = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7';

// Define chord progressions
export type ChordProgression = {
  type: ChordType;
  root: NoteType;
  inversion: number;
  secondaryDominant?: boolean;
  modulation?: {
    from: NoteType;
    to: NoteType;
  };
};

// Voice leading rules
export interface VoiceLeadingRule {
  name: string;
  check: (prevChord: ChordProgression, nextChord: ChordProgression) => boolean;
  message: string;
}

// Define common chord progressions
export const commonProgressions: ChordProgression[][] = [
  // I - IV - V - I
  [
    { type: 'major', root: 'd', inversion: 0 },
    { type: 'major', root: 'f', inversion: 0 },
    { type: 'major', root: 's', inversion: 0 },
    { type: 'major', root: 'd', inversion: 0 }
  ],
  // I - vi - IV - V
  [
    { type: 'major', root: 'd', inversion: 0 },
    { type: 'minor', root: 'l', inversion: 0 },
    { type: 'major', root: 'f', inversion: 0 },
    { type: 'major', root: 's', inversion: 0 }
  ],
  // ii - V - I
  [
    { type: 'minor', root: 'r', inversion: 0 },
    { type: 'major', root: 's', inversion: 0 },
    { type: 'major', root: 'd', inversion: 0 }
  ]
];

// Voice leading rules
export const voiceLeadingRules: VoiceLeadingRule[] = [
  {
    name: 'Parallel Fifths',
    check: (prev, next) => {
      // Check for parallel fifths between any two voices
      return false; // TODO: Implement actual check
    },
    message: 'Avoid parallel fifths between voices'
  },
  {
    name: 'Parallel Octaves',
    check: (prev, next) => {
      // Check for parallel octaves between any two voices
      return false; // TODO: Implement actual check
    },
    message: 'Avoid parallel octaves between voices'
  },
  {
    name: 'Voice Spacing',
    check: (prev, next) => {
      // Check for proper voice spacing
      return false; // TODO: Implement actual check
    },
    message: 'Maintain proper voice spacing'
  }
];

// Get chord notes for a given chord progression
export const getChordNotes = (chord: ChordProgression): Record<string, NoteType> => {
  const chordMap: Record<ChordType, number[]> = {
    'major': [0, 2, 4],
    'minor': [0, 1, 4],
    'diminished': [0, 1, 3],
    'augmented': [0, 2, 5],
    'dominant7': [0, 2, 4, 6],
    'major7': [0, 2, 4, 5],
    'minor7': [0, 1, 4, 6]
  };

  const noteOrder: NoteType[] = ['d', 'r', 'm', 'f', 's', 'l', 't'];
  const rootIndex = noteOrder.indexOf(chord.root);
  
  const intervals = chordMap[chord.type];
  const notes = intervals.map(interval => 
    noteOrder[(rootIndex + interval) % 7]
  );

  return {
    S: notes[0],
    A: notes[1],
    T: notes[2],
    B: notes[3] || notes[0] // For triads, double the root in the bass
  };
};

// Check voice leading between two chords
export const checkVoiceLeading = (
  prevChord: ChordProgression,
  nextChord: ChordProgression
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  voiceLeadingRules.forEach(rule => {
    if (!rule.check(prevChord, nextChord)) {
      issues.push(rule.message);
    }
  });

  return {
    valid: issues.length === 0,
    issues
  };
};

// Suggest next chord based on current chord and context
export const suggestNextChord = (
  currentChord: ChordProgression,
  context: {
    key: NoteType;
    previousChords: ChordProgression[];
    desiredTension?: 'high' | 'medium' | 'low';
  }
): ChordProgression[] => {
  // TODO: Implement chord suggestion logic
  return [];
};

// Apply modulation to a chord progression
export const applyModulation = (
  progression: ChordProgression[],
  modulation: {
    from: NoteType;
    to: NoteType;
    pivotChord?: ChordProgression;
  }
): ChordProgression[] => {
  // TODO: Implement modulation logic
  return progression;
}; 