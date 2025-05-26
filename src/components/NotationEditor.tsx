import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MusicStaff from './MusicStaff';
import NoteControls from './NoteControls';
import PlaybackControls from './PlaybackControls';
import TimeSignatureSelector from './TimeSignatureSelector';
import KeySignatureSelector from './KeySignatureSelector';
import DynamicControls from './DynamicControls';
import Timeline from './Timeline';
import { Note, NoteType, NoteDuration, TimeSignature, Subdivision, Marker, DynamicMarking, Dynamic } from '../types/music';
import { 
  getChordNotes, 
  checkVoiceLeading, 
  suggestNextChord,
  type ChordProgression 
} from '../utils/harmonyRules';
import {
  type HistoryState,
  type ClipboardState,
  type SelectionState,
  copyToClipboard,
  pasteFromClipboard,
  batchOperations,
  handleKeyboardShortcut,
  type ShortcutAction,
  keyboardShortcuts
} from '../utils/noteOperations';
import { type KeySignature, keySignatures, applyAccidentals } from '../utils/musicalFeatures';

const NotationEditor = () => {
  const [currentNote, setCurrentNote] = useState<NoteType>('d');
  const [currentDuration, setCurrentDuration] = useState<NoteDuration>('beat');
  const [currentSubdivision, setCurrentSubdivision] = useState<Subdivision>('');
  const [isHighOctave, setIsHighOctave] = useState(false);
  const [isLowOctave, setIsLowOctave] = useState(false);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [keySignature, setKeySignature] = useState<KeySignature>(keySignatures['C major']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [dynamics, setDynamics] = useState<DynamicMarking[]>([]);
  const [currentChordProgression, setCurrentChordProgression] = useState<ChordProgression[]>([]);
  const [tracks, setTracks] = useState({
    S: [] as Note[],
    A: [] as Note[],
    T: [] as Note[],
    B: [] as Note[]
  });

  // New state for note editing features
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);
  const [selection, setSelection] = useState<SelectionState>({
    startMeasure: 0,
    endMeasure: 0,
    startBeat: 0,
    endBeat: 0,
    selectedParts: ['S', 'A', 'T', 'B']
  });

  // Add current state to history
  const addToHistory = useCallback((newTracks: typeof tracks) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      tracks: newTracks,
      markers
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, markers]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.ctrlKey ? `Ctrl+${e.key}` : e.key;
      const action = keyboardShortcuts[key as keyof typeof keyboardShortcuts] as ShortcutAction | undefined;

      if (action) {
        e.preventDefault();
        const result = handleKeyboardShortcut(
          action,
          { tracks, selection, clipboard, history, historyIndex },
          timeSignature
        );

        if (result.tracks) {
          setTracks(result.tracks);
          addToHistory(result.tracks);
        }
        if (result.clipboard) setClipboard(result.clipboard);
        if (result.historyIndex !== undefined) setHistoryIndex(result.historyIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tracks, selection, clipboard, history, historyIndex, timeSignature, addToHistory]);

  const addNote = (position: number, subPosition: number, voicePart: 'S' | 'A' | 'T' | 'B') => {
    const newNote: Note = {
      type: currentNote,
      duration: currentDuration,
      subdivision: currentSubdivision,
      isHighOctave,
      isLowOctave,
      position,
      subPosition
    };

    // Apply key signature accidentals
    const noteWithAccidentals = applyAccidentals(newNote, keySignature);

    const newTracks = {
      ...tracks,
      [voicePart]: [...tracks[voicePart], noteWithAccidentals].sort((a, b) => 
        a.position === b.position ? a.subPosition - b.subPosition : a.position - b.position
      )
    };

    setTracks(newTracks);
    addToHistory(newTracks);

    if (voicePart === 'S') {
      harmonizeVoices(position, subPosition, noteWithAccidentals);
    }
  };

  const removeNote = (position: number, subPosition: number, voicePart: 'S' | 'A' | 'T' | 'B') => {
    const newTracks = {
      ...tracks,
      [voicePart]: tracks[voicePart].filter(note => 
        note.position !== position || note.subPosition !== subPosition
      )
    };

    setTracks(newTracks);
    addToHistory(newTracks);
  };

  const harmonizeVoices = (position: number, subPosition: number, sopranoNote: Note) => {
    // Create a new chord progression based on the soprano note
    const newChord: ChordProgression = {
      type: 'major', // Default to major, could be determined by context
      root: sopranoNote.type,
      inversion: 0
    };

    // Check voice leading with previous chord if it exists
    if (currentChordProgression.length > 0) {
      const prevChord = currentChordProgression[currentChordProgression.length - 1];
      const voiceLeadingCheck = checkVoiceLeading(prevChord, newChord);
      
      if (!voiceLeadingCheck.valid) {
        // If voice leading is invalid, try to find a better chord
        const suggestions = suggestNextChord(prevChord, {
          key: sopranoNote.type,
          previousChords: currentChordProgression
        });
        
        if (suggestions.length > 0) {
          // Use the first suggestion
          newChord.type = suggestions[0].type;
          newChord.root = suggestions[0].root;
          newChord.inversion = suggestions[0].inversion;
        }
      }
    }

    // Get the chord notes
    const chordNotes = getChordNotes(newChord);
    
    // Add the new chord to the progression
    setCurrentChordProgression(prev => [...prev, newChord]);

    // Add notes to each voice
    (['A', 'T', 'B'] as const).forEach(part => {
      const newNote: Note = {
        ...sopranoNote,
        type: chordNotes[part],
        isHighOctave: false,
        isLowOctave: part === 'B',
        position,
        subPosition
      };

      setTracks(prev => ({
        ...prev,
        [part]: [...prev[part], newNote].sort((a, b) => 
          a.position === b.position ? a.subPosition - b.subPosition : a.position - b.position
        )
      }));
    });
  };

  const addMarker = (position: number) => {
    const newMarker: Marker = {
      id: uuidv4(),
      position,
      text: ''
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const updateMarker = (id: string, text: string) => {
    setMarkers(prev => prev.map(marker => 
      marker.id === id ? { ...marker, text } : marker
    ));
  };

  const removeMarker = (id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  const clearAllNotes = () => {
    setTracks({
      S: [],
      A: [],
      T: [],
      B: []
    });
    setMarkers([]);
    setCurrentChordProgression([]);
  };

  const addDynamic = (position: number, dynamic: Dynamic, voicePart?: 'S' | 'A' | 'T' | 'B') => {
    const newDynamic: DynamicMarking = {
      id: uuidv4(),
      position,
      dynamic,
      voicePart
    };

    setDynamics(prev => [...prev, newDynamic]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tonic Sol-fa Editor</h2>
          <div className="flex items-center space-x-4">
            <KeySignatureSelector value={keySignature} onChange={setKeySignature} />
            <TimeSignatureSelector value={timeSignature} onChange={setTimeSignature} />
            <DynamicControls 
              onAddDynamic={addDynamic}
              selectedVoicePart={selection.selectedParts.length === 1 ? selection.selectedParts[0] : undefined}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const newTracks = batchOperations.transpose(tracks, selection, 1, timeSignature);
                  setTracks(newTracks);
                  addToHistory(newTracks);
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                title="Transpose Up (Ctrl+Up)"
              >
                ↑
              </button>
              <button
                onClick={() => {
                  const newTracks = batchOperations.transpose(tracks, selection, -1, timeSignature);
                  setTracks(newTracks);
                  addToHistory(newTracks);
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                title="Transpose Down (Ctrl+Down)"
              >
                ↓
              </button>
              <button
                onClick={clearAllNotes}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        <NoteControls
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          currentDuration={currentDuration}
          setCurrentDuration={setCurrentDuration}
          currentSubdivision={currentSubdivision}
          setCurrentSubdivision={setCurrentSubdivision}
          isHighOctave={isHighOctave}
          setIsHighOctave={setIsHighOctave}
          isLowOctave={isLowOctave}
          setIsLowOctave={setIsLowOctave}
        />

        <div className="mt-6 space-y-4 overflow-x-auto">
          <div className="min-w-[800px]">
            <Timeline
              markers={markers}
              onAddMarker={addMarker}
              onUpdateMarker={updateMarker}
              onRemoveMarker={removeMarker}
              measureCount={8}
            />
            {(['S', 'A', 'T', 'B'] as const).map((part) => (
              <MusicStaff
                key={part}
                voicePart={part}
                notes={tracks[part]}
                timeSignature={timeSignature}
                addNote={addNote}
                removeNote={removeNote}
                currentNote={currentNote}
                currentSubdivision={currentSubdivision}
                measureCount={8}
                isSelected={selection.selectedParts.includes(part)}
                onSelect={() => {
                  setSelection(prev => ({
                    ...prev,
                    selectedParts: prev.selectedParts.includes(part)
                      ? prev.selectedParts.filter(p => p !== part)
                      : [...prev.selectedParts, part]
                  }));
                }}
                dynamics={dynamics}
              />
            ))}
          </div>
        </div>
      </div>

      <PlaybackControls
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onStop={() => setIsPlaying(false)}
        onReset={clearAllNotes}
      />
    </div>
  );
};

export default NotationEditor;