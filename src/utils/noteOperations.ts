import { Note, NoteType, TimeSignature } from '../types/music';

// History state interface
export interface HistoryState {
  tracks: {
    S: Note[];
    A: Note[];
    T: Note[];
    B: Note[];
  };
  markers: { id: string; position: number; text: string; }[];
}

// Clipboard state interface
export interface ClipboardState {
  notes: {
    S: Note[];
    A: Note[];
    T: Note[];
    B: Note[];
  };
  startPosition: number;
}

// Selection state interface
export interface SelectionState {
  startMeasure: number;
  endMeasure: number;
  startBeat: number;
  endBeat: number;
  selectedParts: ('S' | 'A' | 'T' | 'B')[];
}

// Get notes within a measure range
export const getNotesInRange = (
  tracks: HistoryState['tracks'],
  startMeasure: number,
  endMeasure: number,
  timeSignature: TimeSignature
): HistoryState['tracks'] => {
  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
  const startPosition = startMeasure * beatsPerMeasure;
  const endPosition = (endMeasure + 1) * beatsPerMeasure;

  return {
    S: tracks.S.filter(note => note.position >= startPosition && note.position < endPosition),
    A: tracks.A.filter(note => note.position >= startPosition && note.position < endPosition),
    T: tracks.T.filter(note => note.position >= startPosition && note.position < endPosition),
    B: tracks.B.filter(note => note.position >= startPosition && note.position < endPosition)
  };
};

// Copy notes to clipboard
export const copyToClipboard = (
  tracks: HistoryState['tracks'],
  selection: SelectionState,
  timeSignature: TimeSignature
): ClipboardState => {
  const notes = getNotesInRange(tracks, selection.startMeasure, selection.endMeasure, timeSignature);
  return {
    notes,
    startPosition: selection.startMeasure * parseInt(timeSignature.split('/')[0])
  };
};

// Paste notes from clipboard
export const pasteFromClipboard = (
  tracks: HistoryState['tracks'],
  clipboard: ClipboardState,
  targetMeasure: number,
  timeSignature: TimeSignature
): HistoryState['tracks'] => {
  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
  const offset = (targetMeasure * beatsPerMeasure) - clipboard.startPosition;

  const pasteNote = (note: Note): Note => ({
    ...note,
    position: note.position + offset
  });

  return {
    S: [...tracks.S, ...clipboard.notes.S.map(pasteNote)],
    A: [...tracks.A, ...clipboard.notes.A.map(pasteNote)],
    T: [...tracks.T, ...clipboard.notes.T.map(pasteNote)],
    B: [...tracks.B, ...clipboard.notes.B.map(pasteNote)]
  };
};

// Batch operations
export const batchOperations = {
  // Transpose selected notes
  transpose: (
    tracks: HistoryState['tracks'],
    selection: SelectionState,
    semitones: number,
    timeSignature: TimeSignature
  ): HistoryState['tracks'] => {
    const noteOrder: NoteType[] = ['d', 'r', 'm', 'f', 's', 'l', 't'];
    const selectedNotes = getNotesInRange(tracks, selection.startMeasure, selection.endMeasure, timeSignature);

    const transposeNote = (note: Note): Note => {
      const currentIndex = noteOrder.indexOf(note.type);
      const newIndex = (currentIndex + semitones + 7) % 7;
      return {
        ...note,
        type: noteOrder[newIndex]
      };
    };

    return {
      S: tracks.S.map(note => selectedNotes.S.includes(note) ? transposeNote(note) : note),
      A: tracks.A.map(note => selectedNotes.A.includes(note) ? transposeNote(note) : note),
      T: tracks.T.map(note => selectedNotes.T.includes(note) ? transposeNote(note) : note),
      B: tracks.B.map(note => selectedNotes.B.includes(note) ? transposeNote(note) : note)
    };
  },

  // Change duration of selected notes
  changeDuration: (
    tracks: HistoryState['tracks'],
    selection: SelectionState,
    newDuration: Note['duration'],
    timeSignature: TimeSignature
  ): HistoryState['tracks'] => {
    const selectedNotes = getNotesInRange(tracks, selection.startMeasure, selection.endMeasure, timeSignature);

    return {
      S: tracks.S.map(note => selectedNotes.S.includes(note) ? { ...note, duration: newDuration } : note),
      A: tracks.A.map(note => selectedNotes.A.includes(note) ? { ...note, duration: newDuration } : note),
      T: tracks.T.map(note => selectedNotes.T.includes(note) ? { ...note, duration: newDuration } : note),
      B: tracks.B.map(note => selectedNotes.B.includes(note) ? { ...note, duration: newDuration } : note)
    };
  }
};

// Keyboard shortcuts
export const keyboardShortcuts = {
  'Ctrl+C': 'copy',
  'Ctrl+V': 'paste',
  'Ctrl+Z': 'undo',
  'Ctrl+Y': 'redo',
  'Delete': 'delete',
  'Ctrl+A': 'selectAll',
  'ArrowUp': 'moveUp',
  'ArrowDown': 'moveDown',
  'ArrowLeft': 'moveLeft',
  'ArrowRight': 'moveRight'
} as const;

export type ShortcutAction = typeof keyboardShortcuts[keyof typeof keyboardShortcuts];

// Handle keyboard shortcut
export const handleKeyboardShortcut = (
  action: ShortcutAction,
  state: {
    tracks: HistoryState['tracks'];
    selection: SelectionState;
    clipboard: ClipboardState | null;
    history: HistoryState[];
    historyIndex: number;
  },
  timeSignature: TimeSignature
): Partial<typeof state> => {
  switch (action) {
    case 'copy':
      return {
        clipboard: copyToClipboard(state.tracks, state.selection, timeSignature)
      };
    case 'paste':
      if (state.clipboard) {
        return {
          tracks: pasteFromClipboard(state.tracks, state.clipboard, state.selection.startMeasure, timeSignature)
        };
      }
      return {};
    case 'undo':
      if (state.historyIndex > 0) {
        return {
          tracks: state.history[state.historyIndex - 1].tracks,
          historyIndex: state.historyIndex - 1
        };
      }
      return {};
    case 'redo':
      if (state.historyIndex < state.history.length - 1) {
        return {
          tracks: state.history[state.historyIndex + 1].tracks,
          historyIndex: state.historyIndex + 1
        };
      }
      return {};
    case 'delete':
      return {
        tracks: {
          S: state.tracks.S.filter(note => !isNoteInSelection(note, state.selection, timeSignature)),
          A: state.tracks.A.filter(note => !isNoteInSelection(note, state.selection, timeSignature)),
          T: state.tracks.T.filter(note => !isNoteInSelection(note, state.selection, timeSignature)),
          B: state.tracks.B.filter(note => !isNoteInSelection(note, state.selection, timeSignature))
        }
      };
    default:
      return {};
  }
};

// Helper function to check if a note is in selection
const isNoteInSelection = (
  note: Note,
  selection: SelectionState,
  timeSignature: TimeSignature
): boolean => {
  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
  const noteMeasure = Math.floor(note.position / beatsPerMeasure);
  const noteBeat = note.position % beatsPerMeasure;

  return (
    noteMeasure >= selection.startMeasure &&
    noteMeasure <= selection.endMeasure &&
    noteBeat >= selection.startBeat &&
    noteBeat <= selection.endBeat
  );
}; 