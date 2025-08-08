import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Minus, Music, ChevronUp, Hash, Volume2, Zap, Clock, Repeat } from 'lucide-react';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { FaDrumSteelpan } from 'react-icons/fa6';
import MusicStaff from './MusicStaff';
import PlaybackControls from './PlaybackControls';
import TimeSignatureSelector from './TimeSignatureSelector';
import type { Note, VoicePart, TimeSignature, NoteType, Subdivision, Tool, LyricEntry } from '../types/music';

type TrackKey = VoicePart | 'Chord';

const SATB_LABELS: Record<VoicePart, string> = {
  S: 'Soprano',
  A: 'Alto',
  T: 'Tenor',
  B: 'Bass',
};

const SATB_HEADER_COLORS: Record<VoicePart, string> = {
  S: 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  A: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  T: 'bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
  B: 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
};

const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5, 2];

const TRACK_HEADER_WIDTH = 140; // px, wider for buttons
const GRID_CELL_WIDTH = 18; // px, half of original 36

const TrackPanel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [measureCount, setMeasureCount] = useState(16);
  const [zoom, setZoom] = useState(1);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [tracks, setTracks] = useState({
    S: [] as Note[],
    A: [] as Note[],
    T: [] as Note[],
    B: [] as Note[],
    Chord: [] as Note[]
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [panelHeight, setPanelHeight] = useState(320);
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(320);
  const [symbolRows, setSymbolRows] = useState(2);
  const [selectedCell, setSelectedCell] = useState<{ measureIdx: number, rowIdx: number, segIdx: number, boxIdx: number } | null>(null);
  const [debugGrid, setDebugGrid] = useState(false);
  const selectedCellRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [focusedButton, setFocusedButton] = useState<{ group: string; index: number } | null>(null);
  const [currentNote, setCurrentNote] = useState<NoteType | null>(null);
  const [currentSubdivision, setCurrentSubdivision] = useState<Subdivision | null>(null);
  const [isHighOctave, setIsHighOctave] = useState(false);
  const [isLowOctave, setIsLowOctave] = useState(false);
  const [currentArticulation, setCurrentArticulation] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [chordPopup, setChordPopup] = useState<{ measureIdx: number; segIdx: number; x: number; y: number } | null>(null);
  const [chords, setChords] = useState<Record<string, { root: string; type: string; symbol: string }>>({});
  const [pendingChord, setPendingChord] = useState<{ root: string; type: string }>({ root: 'C', type: 'maj' });
  const [lyrics, setLyrics] = useState<Record<string, string>>({});
  const [lyricPopup, setLyricPopup] = useState<{ measureIdx: number; segIdx: number; boxIdx: number; x: number; y: number } | null>(null);
  const [pendingLyric, setPendingLyric] = useState<string>('');
  const [clearWarning, setClearWarning] = useState<{type: 'SATB' | 'Chord' | 'Lyrics' | 'Marker'; trackName?: string} | null>(null);
  const [markers, setMarkers] = useState<Record<string, string>>({});
  const [markerPopup, setMarkerPopup] = useState<{ measureIdx: number; segIdx: number; x: number; y: number } | null>(null);
  const [pendingMarker, setPendingMarker] = useState<string>('');
  const [notes, setNotes] = useState<Record<string, { note: NoteType; octave: number; subdivision: string; articulation?: string }>>({});
  const [notePopup, setNotePopup] = useState<{ measureIdx: number; segIdx: number; boxIdx: number; voicePart: VoicePart; x: number; y: number } | null>(null);
  const [pendingNote, setPendingNote] = useState<{ note: NoteType; octave: number; subdivision: string; articulation?: string }>({ note: 'd', octave: 0, subdivision: '', articulation: undefined });

  const clearAll = () => {
    setTracks({
      S: [],
      A: [],
      T: [],
      B: [],
      Chord: []
    });
    setChords({});
    setLyrics({});
    setMarkers({});
    setNotes({});
  };

  // Clear track functions with warnings
  const handleClearSATBTrack = (part: VoicePart) => {
    setClearWarning({ type: 'SATB', trackName: SATB_LABELS[part] });
  };

  const handleClearChordTrack = () => {
    setClearWarning({ type: 'Chord' });
  };

  const handleClearLyricsTrack = () => {
    setClearWarning({ type: 'Lyrics' });
  };

  const handleClearMarkerTrack = () => {
    setClearWarning({ type: 'Marker' });
  };

  const confirmClear = () => {
    if (!clearWarning) return;

    if (clearWarning.type === 'SATB' && clearWarning.trackName) {
      const part = Object.keys(SATB_LABELS).find(key => 
        SATB_LABELS[key as VoicePart] === clearWarning.trackName
      ) as VoicePart;
      
      if (part) {
        setTracks(prev => ({
          ...prev,
          [part]: []
        }));
      }
    } else if (clearWarning.type === 'Chord') {
      setChords({});
    } else if (clearWarning.type === 'Lyrics') {
      setLyrics({});
    } else if (clearWarning.type === 'Marker') {
      setMarkers({});
    }

    // Clear notes for specific SATB track
    if (clearWarning.type === 'SATB' && clearWarning.trackName) {
      const part = Object.keys(SATB_LABELS).find(key => 
        SATB_LABELS[key as VoicePart] === clearWarning.trackName
      ) as VoicePart;
      
      if (part) {
        setNotes(prev => {
          const newNotes = { ...prev };
          Object.keys(newNotes).forEach(key => {
            if (key.endsWith(`-${part}`)) {
              delete newNotes[key];
            }
          });
          return newNotes;
        });
      }
    }

    setClearWarning(null);
  };

  const cancelClear = () => {
    setClearWarning(null);
  };

  // Marker templates and functionality
  const MARKER_TEMPLATES = [
    { label: 'Verse', value: 'Verse', color: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' },
    { label: 'Chorus', value: 'Chorus', color: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300' },
    { label: 'Bridge', value: 'Bridge', color: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' },
    { label: 'Intro', value: 'Intro', color: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' },
    { label: 'Outro', value: 'Outro', color: 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300' },
    { label: 'Solo', value: 'Solo', color: 'bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300' },
    { label: 'Break', value: 'Break', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
    { label: 'Pre-Chorus', value: 'Pre-Chorus', color: 'bg-pink-100 dark:bg-pink-800 text-pink-700 dark:text-pink-300' }
  ];

  const handleMarkerAdd = () => {
    if (!markerPopup || !pendingMarker.trim()) return;
    
    const { measureIdx, segIdx } = markerPopup;
    const markerKey = `${measureIdx}-${segIdx}`;
    
    setMarkers(prev => ({
      ...prev,
      [markerKey]: pendingMarker.trim()
    }));
    
    setMarkerPopup(null);
    setPendingMarker('');
  };

  const handleMarkerDelete = (measureIdx: number, segIdx: number) => {
    const markerKey = `${measureIdx}-${segIdx}`;
    setMarkers(prev => {
      const newMarkers = { ...prev };
      delete newMarkers[markerKey];
      return newMarkers;
    });
  };

  const handleMarkerCancel = () => {
    setMarkerPopup(null);
    setPendingMarker('');
  };

  const getMarkerColor = (markerText: string) => {
    const template = MARKER_TEMPLATES.find(t => t.value === markerText);
    return template ? template.color : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

  // Note entry constants and functions
  const SOLFA_NOTES: { note: NoteType; label: string }[] = [
    { note: 'd', label: 'Do (d)' },
    { note: 'r', label: 'Re (r)' },
    { note: 'm', label: 'Mi (m)' },
    { note: 'f', label: 'Fa (f)' },
    { note: 's', label: 'Sol (s)' },
    { note: 'l', label: 'La (l)' },
    { note: 't', label: 'Ti (t)' }
  ];

  const OCTAVE_OPTIONS = [
    { value: 2, label: '2 (High)', display: '²' },
    { value: 1, label: '1 (High)', display: '¹' },
    { value: 0, label: 'Normal', display: '' },
    { value: -1, label: '1 (Low)', display: '₁' },
    { value: -2, label: '2 (Low)', display: '₂' }
  ];

  const SUBDIVISION_OPTIONS = [
    { value: '', label: 'None', display: '' },
    { value: '.', label: 'Dot (.)', display: '.' },
    { value: '.,', label: 'Dot Comma (.,)', display: '.,' },
    { value: ',', label: 'Comma (,)', display: ',' }
  ];

  const ARTICULATION_OPTIONS = [
    { value: undefined, label: 'None' },
    { value: 'staccato', label: 'Staccato (•)' },
    { value: 'accent', label: 'Accent (>)' },
    { value: 'tenuto', label: 'Tenuto (-)' },
    { value: 'legato', label: 'Legato (~)' }
  ];

  // Note entry handlers
  const handleNoteAdd = () => {
    if (!notePopup) return;
    
    const { measureIdx, segIdx, boxIdx, voicePart } = notePopup;
    const noteKey = `${measureIdx}-${segIdx}-${boxIdx}-${voicePart}`;
    
    setNotes(prev => ({
      ...prev,
      [noteKey]: { ...pendingNote }
    }));

    // Auto-harmonization for Soprano voice
    if (voicePart === 'S') {
      generateHarmony(measureIdx, segIdx, pendingNote);
    }
    
    setNotePopup(null);
    setPendingNote({ note: 'd', octave: 0, subdivision: '', articulation: undefined });
  };

  const handleNoteDelete = (measureIdx: number, segIdx: number, boxIdx: number, voicePart: VoicePart) => {
    const noteKey = `${measureIdx}-${segIdx}-${boxIdx}-${voicePart}`;
    setNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[noteKey];
      return newNotes;
    });
  };

  const handleNoteCancel = () => {
    setNotePopup(null);
    setPendingNote({ note: 'd', octave: 0, subdivision: '', articulation: undefined });
  };

  // Auto-harmonization function
  const generateHarmony = (measureIdx: number, segIdx: number, sopranoNote: { note: NoteType; octave: number; subdivision: string; articulation?: string }) => {
    const chordKey = `${measureIdx}-${segIdx}`;
    const chord = chords[chordKey];
    
    if (!chord) return; // No chord reference, skip harmonization

    // Basic harmony mapping based on chord type
    const harmonyMap: Record<string, Partial<Record<NoteType, { A: NoteType; T: NoteType; B: NoteType }>>> = {
      'maj': {
        'd': { A: 'm', T: 's', B: 'd' },
        'r': { A: 'f', T: 'l', B: 'd' },
        'm': { A: 's', T: 'd', B: 'm' },
        'f': { A: 'l', T: 'd', B: 'f' },
        's': { A: 'd', T: 'm', B: 's' },
        'l': { A: 'm', T: 'f', B: 'l' },
        't': { A: 'f', T: 's', B: 'd' },
        'c': { A: 's', T: 'd', B: 'c' },
        'b': { A: 'd', T: 'f', B: 'b' }
      },
      'min': {
        'd': { A: 'm', T: 's', B: 'd' },
        'r': { A: 'f', T: 'l', B: 'd' },
        'm': { A: 's', T: 'd', B: 'm' },
        'f': { A: 'l', T: 'd', B: 'f' },
        's': { A: 'd', T: 'm', B: 's' },
        'l': { A: 'm', T: 'f', B: 'l' },
        't': { A: 'f', T: 's', B: 'd' },
        'c': { A: 's', T: 'd', B: 'c' },
        'b': { A: 'd', T: 'f', B: 'b' }
      }
    };

    const harmony = harmonyMap[chord.type]?.[sopranoNote.note];
    if (!harmony) return;

    // Generate harmony notes for A, T, B voices
    const voices: { voice: VoicePart; key: keyof typeof harmony }[] = [
      { voice: 'A', key: 'A' },
      { voice: 'T', key: 'T' },
      { voice: 'B', key: 'B' }
    ];
    
    voices.forEach(({ voice, key }) => {
      const harmonyNote = harmony[key];
      if (harmonyNote) {
        // Adjust octaves for voice ranges
        let octaveAdjustment = 0;
        if (voice === 'A') octaveAdjustment = sopranoNote.octave - 1;
        else if (voice === 'T') octaveAdjustment = sopranoNote.octave - 1;
        else if (voice === 'B') octaveAdjustment = sopranoNote.octave - 2;

        const noteKey = `${measureIdx}-${segIdx}-0-${voice}`; // Using boxIdx 0 for harmony
        setNotes(prev => ({
          ...prev,
          [noteKey]: {
            note: harmonyNote,
            octave: Math.max(-2, Math.min(2, octaveAdjustment)),
            subdivision: sopranoNote.subdivision,
            articulation: sopranoNote.articulation
          }
        }));
      }
    });
  };

  // Format note display
  const formatNoteDisplay = (noteData: { note: NoteType; octave: number; subdivision: string; articulation?: string }) => {
    const octaveDisplay = OCTAVE_OPTIONS.find(o => o.value === noteData.octave)?.display || '';
    const subdivisionDisplay = noteData.subdivision;
    return `${subdivisionDisplay}${noteData.note}${octaveDisplay}`;
  };

  const addMeasure = () => {
    setMeasureCount(prev => prev + 1);
  };

  const removeMeasure = () => {
    if (measureCount > 1) {
      setMeasureCount(prev => prev - 1);
    }
  };

  const handleZoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1]);
  };
  const handleZoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1]);
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = panelHeight;
    document.body.style.cursor = 'ns-resize';
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  };
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = startY.current - e.clientY;
    setPanelHeight(Math.max(120, Math.min(600, startHeight.current + delta)));
  };
  const handleDragEnd = () => {
    isDragging.current = false;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
  };

  // Timeline/time marker row
  const renderTimelineRow = () => (
    <div className="flex items-center mb-0 min-h-[24px]">
      <span className="sticky left-0 z-10 flex items-center justify-between bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-xs text-left select-none px-2" style={{ minWidth: TRACK_HEADER_WIDTH, width: TRACK_HEADER_WIDTH, borderRadius: 0 }}>Bar</span>
      <div className="flex-1 min-w-0 flex items-center h-6 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs text-slate-500 dark:text-slate-400">
        {Array.from({ length: measureCount }).map((_, measure) => (
          <div
            key={measure}
            className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center"
            style={{ width: `${GRID_CELL_WIDTH * 4 * zoom}px` }}
          >
            <span className="block text-[10px]">{measure + 1}</span>
            <div className="flex w-full h-1">
              {Array.from({ length: 4 }).map((_, beat) => (
                <div key={beat} className="flex-1 border-l border-slate-100 dark:border-slate-700"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render marker popup
  const renderMarkerPopup = () => {
    if (!markerPopup) return null;

    const existingMarker = markers[`${markerPopup.measureIdx}-${markerPopup.segIdx}`];

    return (
      <div 
        className="fixed bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-4 z-50"
        style={{ 
          left: markerPopup.x, 
          top: markerPopup.y - 280,
          minWidth: '320px'
        }}
      >
        <h3 className="text-sm font-semibold mb-3">Add Marker</h3>
        
        {/* Template buttons */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Quick Templates</label>
          <div className="grid grid-cols-2 gap-2">
            {MARKER_TEMPLATES.map(template => (
              <button
                key={template.value}
                className={`px-3 py-2 text-xs rounded transition-colors border hover:opacity-80 ${template.color}`}
                onClick={() => setPendingMarker(template.value)}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom text input */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Custom Marker Text</label>
          <input
            type="text"
            value={pendingMarker}
            onChange={(e) => setPendingMarker(e.target.value)}
            placeholder="Enter custom marker text..."
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleMarkerAdd();
              } else if (e.key === 'Escape') {
                handleMarkerCancel();
              }
            }}
          />
          <div className="text-xs text-slate-400 mt-1">Press Enter to add, Escape to cancel</div>
        </div>

        {/* Preview */}
        {pendingMarker && (
          <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-700 rounded border">
            <span className="text-xs text-slate-500 dark:text-slate-400">Preview: </span>
            <span className={`px-2 py-1 text-xs rounded ${getMarkerColor(pendingMarker)}`}>
              {pendingMarker}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-between">
          <div>
            {existingMarker && (
              <button
                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                onClick={() => {
                  handleMarkerDelete(markerPopup.measureIdx, markerPopup.segIdx);
                  handleMarkerCancel();
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500"
              onClick={handleMarkerCancel}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              onClick={handleMarkerAdd}
              disabled={!pendingMarker.trim()}
            >
              Add Marker
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update Marker track with clickable marker cells and clear button
  const renderMarkerTrack = () => {
    const pattern = getSolfaBarBoxPattern(timeSignature);
    return (
      <div className="flex items-center mb-0 min-h-[32px]">
        <span className="sticky left-0 z-10 flex items-center justify-between bg-green-50 dark:bg-green-900 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left select-none px-2 font-semibold text-green-700 dark:text-green-300" style={{ minWidth: TRACK_HEADER_WIDTH, width: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
          <span>Marker</span>
          <button
            className="w-5 h-5 rounded bg-red-200 dark:bg-red-700 text-red-900 dark:text-white flex items-center justify-center hover:bg-red-300 dark:hover:bg-red-600 text-xs"
            onClick={handleClearMarkerTrack}
            title="Clear Marker track"
            type="button"
          >×
          </button>
        </span>
        <div className="flex-1 min-w-0 flex items-center h-8 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
          {Array.from({ length: measureCount }).map((_, measureIdx) => (
            <div key={measureIdx} className="flex items-center h-full">
              {pattern.map((seg, segIdx) => {
                const markerKey = `${measureIdx}-${segIdx}`;
                const marker = markers[markerKey];
                
                return (
                  <React.Fragment key={`marker-fragment-${measureIdx}-${segIdx}`}>
                    <span
                      key={`bar-${segIdx}`}
                      style={{
                        width: `${GRID_CELL_WIDTH * zoom}px`,
                        minWidth: `${GRID_CELL_WIDTH * zoom}px`,
                        display: 'inline-block',
                        textAlign: 'center'
                      }}
                      className="select-none font-solfa"
                    >
                      {'\u00A0'}
                    </span>
                    <div
                      key={`marker-${segIdx}`}
                      className={`flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors text-xs font-medium ${
                        marker 
                          ? `${getMarkerColor(marker)} hover:opacity-80` 
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      style={{ width: `${GRID_CELL_WIDTH * 4 * zoom}px`, height: 28 }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const existingMarker = markers[markerKey];
                        
                        // Initialize pending marker with existing marker or empty
                        setPendingMarker(existingMarker || '');
                        
                        setMarkerPopup({
                          measureIdx,
                          segIdx,
                          x: rect.left,
                          y: rect.top
                        });
                      }}
                      title={marker || 'Click to add marker'}
                    >
                      <span className="truncate px-1">
                        {marker || '+'}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper: get solfa bar/box pattern for a measure
  const getSolfaBarBoxPattern = (timeSignature: string) => {
    switch (timeSignature) {
      case '2/4':
        return [
          { bar: '|', boxes: 4 },
          { bar: ':', boxes: 4 },
        ];
      case '3/4':
        return [
          { bar: '|', boxes: 4 },
          { bar: ':', boxes: 4 },
          { bar: ':', boxes: 4 },
        ];
      case '4/4':
        return [
          { bar: '|', boxes: 4 },
          { bar: ':', boxes: 4 },
          { bar: '\\', boxes: 4 },
          { bar: ':', boxes: 4 },
        ];
      case '6/8':
        return [
          { bar: '|', boxes: 4 },
          { bar: ':', boxes: 4 },
          { bar: ':', boxes: 4 },
          { bar: '\\', boxes: 4 },
          { bar: ':', boxes: 4 },
          { bar: ':', boxes: 4 },
        ];
      default:
        return [
          { bar: '|', boxes: 4 },
          { bar: ':', boxes: 4 },
          { bar: ':', boxes: 4 },
        ];
    }
  };

  // Helper: render blank bar/colon spacers for alignment
  const renderSolfaBlankRow = (pattern: { bar: string, boxes: number }[], measureCount: number, zoom: number) => (
    Array.from({ length: measureCount }).map((_, measureIdx) => (
      <div key={measureIdx} className="flex items-center h-full">
        {pattern.map((seg, segIdx) => (
          <>
            <span
              key={`bar-${segIdx}`}
              style={{
                width: `${GRID_CELL_WIDTH * zoom}px`,
                minWidth: `${GRID_CELL_WIDTH * zoom}px`,
                display: 'inline-block',
                textAlign: 'center'
              }}
              className="select-none"
            >
              {'\u00A0'}
            </span>
            {Array.from({ length: seg.boxes }).map((_, boxIdx) => (
              <div
                key={`box-${segIdx}-${boxIdx}`}
                className="flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center"
                style={{ width: `${GRID_CELL_WIDTH * zoom}px`, height: 28 }}
              >
                {/* Note cell placeholder */}
              </div>
            ))}
          </>
        ))}
      </div>
    ))
  );

  // Render a track row with solfa bars/boxes, always use GRID_CELL_WIDTH * zoom for cell size
  const renderSolfaTrackRow = (pattern: { bar: string, boxes: number }[], measureCount: number, zoom: number, rowIdx: number) => (
    Array.from({ length: measureCount }).map((_, measureIdx) => (
      <div key={measureIdx} className="flex items-center h-full">
        {pattern.map((seg, segIdx) => (
          <>
            <span
              key={`bar-${segIdx}`}
              style={{
                width: `${GRID_CELL_WIDTH * zoom}px`,
                minWidth: `${GRID_CELL_WIDTH * zoom}px`,
                display: 'inline-block',
                textAlign: 'center',
                outline: debugGrid ? '1px dashed #f59e42' : undefined,
                outlineOffset: debugGrid ? '-2px' : undefined
              }}
              className="select-none font-solfa"
            >
              {seg.bar}
            </span>
            {Array.from({ length: seg.boxes }).map((_, boxIdx) => {
              const isSelected = selectedCell && selectedCell.measureIdx === measureIdx && selectedCell.rowIdx === rowIdx && selectedCell.segIdx === segIdx && selectedCell.boxIdx === boxIdx;
              return (
                <div
                  key={`box-${segIdx}-${boxIdx}`}
                  className={`flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer ${isSelected ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} ${debugGrid ? 'outline outline-2 outline-pink-400' : ''}`}
                  style={{ width: `${GRID_CELL_WIDTH * zoom}px`, height: 28 }}
                  onClick={() => setSelectedCell({ measureIdx, rowIdx, segIdx, boxIdx })}
                  tabIndex={isSelected ? 0 : -1}
                  ref={isSelected ? selectedCellRef : undefined}
                  onKeyDown={e => handleGridKeyDown(e, measureIdx, rowIdx, segIdx, boxIdx)}
                  aria-label={`Cell ${measureIdx + 1}, Row ${rowIdx + 1}, Segment ${segIdx + 1}, Box ${boxIdx + 1}`}
                >
                  {/* Note cell placeholder */}
                </div>
              );
            })}
          </>
        ))}
      </div>
    ))
  );

  // Render note popup
  const renderNotePopup = () => {
    if (!notePopup) return null;

    const existingNoteKey = `${notePopup.measureIdx}-${notePopup.segIdx}-${notePopup.boxIdx}-${notePopup.voicePart}`;
    const existingNote = notes[existingNoteKey];

    return (
      <div 
        className="fixed bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-4 z-50"
        style={{ 
          left: notePopup.x, 
          top: notePopup.y - 320,
          minWidth: '280px'
        }}
      >
        <h3 className="text-sm font-semibold mb-3">Add Note - {SATB_LABELS[notePopup.voicePart]}</h3>
        
        {/* Note Selection */}
        <div className="mb-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Solfa Note</label>
          <div className="grid grid-cols-4 gap-1">
            {SOLFA_NOTES.map(({ note, label }) => (
              <button
                key={note}
                className={`px-2 py-2 text-xs rounded transition-colors border ${
                  pendingNote.note === note 
                    ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600' 
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                onClick={() => setPendingNote(prev => ({ ...prev, note }))}
              >
                {note}
              </button>
            ))}
          </div>
        </div>

        {/* Octave Selection */}
        <div className="mb-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Octave</label>
          <div className="grid grid-cols-3 gap-1">
            {OCTAVE_OPTIONS.map(({ value, label, display }) => (
              <button
                key={value}
                className={`px-2 py-2 text-xs rounded transition-colors border ${
                  pendingNote.octave === value 
                    ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600' 
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                onClick={() => setPendingNote(prev => ({ ...prev, octave: value }))}
              >
                {label.split(' ')[0]}{display}
              </button>
            ))}
          </div>
        </div>

        {/* Subdivision Selection */}
        <div className="mb-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Subdivision (Beat)</label>
          <div className="grid grid-cols-2 gap-1">
            {SUBDIVISION_OPTIONS.map(({ value, label, display }) => (
              <button
                key={value}
                className={`px-2 py-2 text-xs rounded transition-colors border ${
                  pendingNote.subdivision === value 
                    ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600' 
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                onClick={() => setPendingNote(prev => ({ ...prev, subdivision: value }))}
              >
                {display || 'None'}
              </button>
            ))}
          </div>
        </div>

        {/* Articulation Selection */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Articulation</label>
          <div className="grid grid-cols-2 gap-1">
            {ARTICULATION_OPTIONS.map(({ value, label }) => (
              <button
                key={value || 'none'}
                className={`px-2 py-2 text-xs rounded transition-colors border ${
                  pendingNote.articulation === value 
                    ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600' 
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
                onClick={() => setPendingNote(prev => ({ ...prev, articulation: value }))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-700 rounded border">
          <span className="text-xs text-slate-500 dark:text-slate-400">Preview: </span>
          <span className="font-mono text-sm font-semibold">
            {formatNoteDisplay(pendingNote)}
          </span>
        </div>

        {/* Harmonization Notice */}
        {notePopup.voicePart === 'S' && (
          <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700">
            <span className="text-xs text-blue-600 dark:text-blue-300">
              ⓘ Soprano notes will auto-generate harmony for A, T, B voices based on chord track
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 justify-between">
          <div>
            {existingNote && (
              <button
                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                onClick={() => {
                  handleNoteDelete(notePopup.measureIdx, notePopup.segIdx, notePopup.boxIdx, notePopup.voicePart);
                  handleNoteCancel();
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500"
              onClick={handleNoteCancel}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleNoteAdd}
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update SATB tracks with note entry and display
  const renderSATBTracks = () => (
    (["S", "A", "T", "B"] as VoicePart[]).map((part, rowIdx) => {
      const pattern = getSolfaBarBoxPattern(timeSignature);
      return (
        <div key={part} className="flex items-center mb-0 min-h-[28px]">
          <span className={`sticky left-0 top-0 z-10 w-32 px-2 py-1 font-semibold border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left ${SATB_HEADER_COLORS[part]} flex items-center justify-between`} style={{ minWidth: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
            <span>{SATB_LABELS[part]}</span>
            <button
              className="w-5 h-5 rounded bg-red-200 dark:bg-red-700 text-red-900 dark:text-white flex items-center justify-center hover:bg-red-300 dark:hover:bg-red-600 text-xs"
              onClick={() => handleClearSATBTrack(part)}
              title={`Clear ${SATB_LABELS[part]} track`}
              type="button"
            >×
            </button>
          </span>
          <div className="flex-1 min-w-0 flex">
            {Array.from({ length: measureCount }).map((_, measureIdx) => (
              <div key={measureIdx} className="flex items-center h-full">
                {pattern.map((seg, segIdx) => (
                  <>
                    <span
                      key={`bar-${segIdx}`}
                      style={{
                        width: `${GRID_CELL_WIDTH * zoom}px`,
                        minWidth: `${GRID_CELL_WIDTH * zoom}px`,
                        display: 'inline-block',
                        textAlign: 'center'
                      }}
                      className="select-none font-solfa"
                    >
                      {seg.bar}
                    </span>
                    {Array.from({ length: seg.boxes }).map((_, boxIdx) => {
                      const noteKey = `${measureIdx}-${segIdx}-${boxIdx}-${part}`;
                      const noteData = notes[noteKey];
                      const isSelected = selectedCell && selectedCell.measureIdx === measureIdx && selectedCell.rowIdx === rowIdx && selectedCell.segIdx === segIdx && selectedCell.boxIdx === boxIdx;
                      
                      return (
                        <div
                          key={`box-${segIdx}-${boxIdx}`}
                          className={`flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-blue-200 dark:bg-blue-800' 
                              : noteData
                                ? 'bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                          } ${debugGrid ? 'outline outline-2 outline-pink-400' : ''}`}
                          style={{ width: `${GRID_CELL_WIDTH * zoom}px`, height: 28 }}
                          onClick={(e) => {
                            setSelectedCell({ measureIdx, rowIdx, segIdx, boxIdx });
                            
                            const rect = e.currentTarget.getBoundingClientRect();
                            const existingNote = notes[noteKey];
                            
                            // Initialize pending note with existing note or defaults
                            if (existingNote) {
                              setPendingNote({ ...existingNote });
                            } else {
                              setPendingNote({ note: 'd', octave: 0, subdivision: '', articulation: undefined });
                            }
                            
                            setNotePopup({
                              measureIdx,
                              segIdx,
                              boxIdx,
                              voicePart: part,
                              x: rect.left,
                              y: rect.top
                            });
                          }}
                          tabIndex={isSelected ? 0 : -1}
                          ref={isSelected ? selectedCellRef : undefined}
                          onKeyDown={e => handleGridKeyDown(e, measureIdx, rowIdx, segIdx, boxIdx)}
                          aria-label={`Cell ${measureIdx + 1}, Row ${rowIdx + 1}, Segment ${segIdx + 1}, Box ${boxIdx + 1}`}
                          title={noteData ? formatNoteDisplay(noteData) : 'Click to add note'}
                        >
                          <span className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-300">
                            {noteData ? formatNoteDisplay(noteData) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    })
  );

  // Update Symbols track to allow symbol placement
  const renderSymbolsTrack = () => {
    const pattern = getSolfaBarBoxPattern(timeSignature);
    return (
      <div className="flex items-stretch mb-0 min-h-[28px]">
        <span className="sticky left-0 z-10 flex items-center justify-between bg-pink-50 dark:bg-pink-900 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left select-none px-2 font-semibold text-pink-700 dark:text-pink-300" style={{ minWidth: TRACK_HEADER_WIDTH, width: TRACK_HEADER_WIDTH, borderRadius: 0, height: symbolRows * 28 }}>
          <span>Symbols</span>
          <span className="flex items-center gap-1 ml-2">
            <button
              className="w-6 h-6 rounded bg-pink-200 dark:bg-pink-700 text-pink-900 dark:text-white flex items-center justify-center hover:bg-pink-300 dark:hover:bg-pink-600"
              onClick={() => setSymbolRows(r => Math.min(r + 1, 8))}
              title="Add symbol row"
              type="button"
            >+
            </button>
            <button
              className="w-6 h-6 rounded bg-pink-200 dark:bg-pink-700 text-pink-900 dark:text-white flex items-center justify-center hover:bg-pink-300 dark:hover:bg-pink-600"
              onClick={() => setSymbolRows(r => Math.max(r - 1, 1))}
              title="Remove symbol row"
              type="button"
              disabled={symbolRows <= 1}
            >–
            </button>
          </span>
        </span>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {Array.from({ length: symbolRows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex-1 flex">
              {Array.from({ length: measureCount }).map((_, measureIdx) => (
                <div key={measureIdx} className="flex items-center h-full">
                  {pattern.map((seg, segIdx) => (
                    <>
                      <span
                        key={`bar-${segIdx}`}
                        style={{
                          width: `${GRID_CELL_WIDTH * zoom}px`,
                          minWidth: `${GRID_CELL_WIDTH * zoom}px`,
                          display: 'inline-block',
                          textAlign: 'center'
                        }}
                        className="select-none font-solfa"
                      >
                        {'\u00A0'}
                      </span>
                      {Array.from({ length: seg.boxes }).map((_, boxIdx) => (
                        <div
                          key={`box-${segIdx}-${boxIdx}`}
                          className="flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center cursor-pointer"
                          style={{ width: `${GRID_CELL_WIDTH * zoom}px`, height: 28 }}
                          onClick={() => {
                            if (selectedSymbol) {
                              // Place symbol logic here
                              console.log(`Placing symbol ${selectedSymbol} at measure ${measureIdx + 1}, segment ${segIdx + 1}, box ${boxIdx + 1}, row ${rowIdx + 1}`);
                              setSelectedSymbol(null); // Reset after placement
                            }
                          }}
                        >
                          {/* Symbol cell placeholder */}
                        </div>
                      ))}
                    </>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Lyrics functionality
  const handleLyricAdd = () => {
    if (!lyricPopup || !pendingLyric.trim()) return;
    
    const { measureIdx, segIdx, boxIdx } = lyricPopup;
    const lyricKey = `${measureIdx}-${segIdx}-${boxIdx}`;
    
    setLyrics(prev => ({
      ...prev,
      [lyricKey]: pendingLyric.trim()
    }));
    
    setLyricPopup(null);
    setPendingLyric('');
  };

  const handleLyricDelete = (measureIdx: number, segIdx: number, boxIdx: number) => {
    const lyricKey = `${measureIdx}-${segIdx}-${boxIdx}`;
    setLyrics(prev => {
      const newLyrics = { ...prev };
      delete newLyrics[lyricKey];
      return newLyrics;
    });
  };

  const handleLyricCancel = () => {
    setLyricPopup(null);
    setPendingLyric('');
  };

  // Render lyric popup
  const renderLyricPopup = () => {
    if (!lyricPopup) return null;

    const existingLyric = lyrics[`${lyricPopup.measureIdx}-${lyricPopup.segIdx}-${lyricPopup.boxIdx}`];

    return (
      <div 
        className="fixed bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-4 z-50"
        style={{ 
          left: lyricPopup.x, 
          top: lyricPopup.y - 150,
          minWidth: '280px'
        }}
      >
        <h3 className="text-sm font-semibold mb-3">Add Lyric</h3>
        
        {/* Text Input */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Lyric Text</label>
          <input
            type="text"
            value={pendingLyric}
            onChange={(e) => setPendingLyric(e.target.value)}
            placeholder="Enter lyric text..."
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLyricAdd();
              } else if (e.key === 'Escape') {
                handleLyricCancel();
              }
            }}
          />
          <div className="text-xs text-slate-400 mt-1">Press Enter to add, Escape to cancel</div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-between">
          <div>
            {existingLyric && (
              <button
                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                onClick={() => {
                  handleLyricDelete(lyricPopup.measureIdx, lyricPopup.segIdx, lyricPopup.boxIdx);
                  handleLyricCancel();
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500"
              onClick={handleLyricCancel}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleLyricAdd}
              disabled={!pendingLyric.trim()}
            >
              Add Lyric
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update Lyrics track with clickable lyric cells
  const renderLyricsTrack = () => {
    const pattern = getSolfaBarBoxPattern(timeSignature);
    return (
      <div className="flex items-center mb-0 min-h-[28px]">
        <span className="sticky left-0 z-10 w-32 px-2 py-1 font-semibold border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-between" style={{ minWidth: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
          <span>Lyrics</span>
          <button
            className="w-5 h-5 rounded bg-red-200 dark:bg-red-700 text-red-900 dark:text-white flex items-center justify-center hover:bg-red-300 dark:hover:bg-red-600 text-xs"
            onClick={handleClearLyricsTrack}
            title="Clear Lyrics track"
            type="button"
          >×
          </button>
        </span>
        <div className="flex-1 min-w-0 flex">
          {Array.from({ length: measureCount }).map((_, measureIdx) => (
            <div key={measureIdx} className="flex items-center h-full">
              {pattern.map((seg, segIdx) => (
                <React.Fragment key={`lyric-fragment-${measureIdx}-${segIdx}`}>
                  <span
                    key={`bar-${segIdx}`}
                    style={{
                      width: `${GRID_CELL_WIDTH * zoom}px`,
                      minWidth: `${GRID_CELL_WIDTH * zoom}px`,
                      display: 'inline-block',
                      textAlign: 'center'
                    }}
                    className="select-none"
                  >
                    {'\u00A0'}
                  </span>
                  {Array.from({ length: seg.boxes }).map((_, boxIdx) => {
                    const lyricKey = `${measureIdx}-${segIdx}-${boxIdx}`;
                    const lyric = lyrics[lyricKey];
                    
                    return (
                      <div
                        key={`lyric-${boxIdx}`}
                        className={`flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors text-xs ${
                          lyric 
                            ? 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700' 
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        style={{ width: `${GRID_CELL_WIDTH * zoom}px`, height: 28 }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const existingLyric = lyrics[lyricKey];
                          
                          // Initialize pending lyric with existing lyric or empty
                          setPendingLyric(existingLyric || '');
                          
                          setLyricPopup({
                            measureIdx,
                            segIdx,
                            boxIdx,
                            x: rect.left,
                            y: rect.top
                          });
                        }}
                        title={lyric || 'Click to add lyric'}
                      >
                        <span className="truncate px-1 text-green-700 dark:text-green-300 font-medium">
                          {lyric || '+'}
                        </span>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Chord selection constants
  const CHORD_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const CHORD_TYPES = [
    { value: 'maj', label: 'Major', symbol: '' },
    { value: 'min', label: 'Minor', symbol: 'm' },
    { value: 'dim', label: 'Diminished', symbol: '°' },
    { value: 'aug', label: 'Augmented', symbol: '+' },
    { value: 'dom7', label: 'Dominant 7th', symbol: '7' },
    { value: 'maj7', label: 'Major 7th', symbol: 'maj7' },
    { value: 'min7', label: 'Minor 7th', symbol: 'm7' }
  ];

  // Handle chord addition
  const handleChordAdd = () => {
    if (!chordPopup) return;
    
    const { measureIdx, segIdx } = chordPopup;
    const chordKey = `${measureIdx}-${segIdx}`;
    const typeInfo = CHORD_TYPES.find(t => t.value === pendingChord.type);
    const symbol = `${pendingChord.root}${typeInfo?.symbol || ''}`;
    
    setChords(prev => ({
      ...prev,
      [chordKey]: { root: pendingChord.root, type: pendingChord.type, symbol }
    }));
    
    setChordPopup(null);
    setPendingChord({ root: 'C', type: 'maj' });
  };

  // Handle chord popup close
  const handleChordCancel = () => {
    setChordPopup(null);
    setPendingChord({ root: 'C', type: 'maj' });
  };

  // Handle chord deletion
  const handleChordDelete = (measureIdx: number, segIdx: number) => {
    const chordKey = `${measureIdx}-${segIdx}`;
    setChords(prev => {
      const newChords = { ...prev };
      delete newChords[chordKey];
      return newChords;
    });
  };

  // Render chord popup
  const renderChordPopup = () => {
    if (!chordPopup) return null;

    const existingChord = chords[`${chordPopup.measureIdx}-${chordPopup.segIdx}`];
    const previewTypeInfo = CHORD_TYPES.find(t => t.value === pendingChord.type);
    const previewSymbol = `${pendingChord.root}${previewTypeInfo?.symbol || ''}`;

    return (
      <div 
        className="fixed bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-4 z-50"
        style={{ 
          left: chordPopup.x, 
          top: chordPopup.y - 220,
          minWidth: '300px'
        }}
      >
        <h3 className="text-sm font-semibold mb-3">Select Chord</h3>
        
        {/* Preview */}
        <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900 rounded border">
          <span className="text-xs text-slate-500 dark:text-slate-400">Preview: </span>
          <span className="font-semibold text-purple-700 dark:text-purple-300">{previewSymbol}</span>
        </div>
        
        {/* Chord Roots */}
        <div className="mb-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Root Note</label>
          <div className="flex gap-1">
            {CHORD_ROOTS.map(root => (
              <button
                key={root}
                className={`px-2 py-1 text-xs border rounded transition-colors ${
                  pendingChord.root === root 
                    ? 'bg-purple-200 dark:bg-purple-700 border-purple-400 dark:border-purple-500' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => setPendingChord(prev => ({ ...prev, root }))}
              >
                {root}
              </button>
            ))}
          </div>
        </div>

        {/* Chord Types */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Chord Type</label>
          <div className="grid grid-cols-2 gap-1">
            {CHORD_TYPES.map(chord => (
              <button
                key={chord.value}
                className={`px-2 py-1 text-xs border rounded text-left transition-colors ${
                  pendingChord.type === chord.value 
                    ? 'bg-purple-200 dark:bg-purple-700 border-purple-400 dark:border-purple-500' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => setPendingChord(prev => ({ ...prev, type: chord.value }))}
              >
                {chord.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-between">
          <div>
            {existingChord && (
              <button
                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                onClick={() => {
                  handleChordDelete(chordPopup.measureIdx, chordPopup.segIdx);
                  handleChordCancel();
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500"
              onClick={handleChordCancel}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={handleChordAdd}
            >
              Add Chord
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update Chord track with clickable chord blocks
  const renderChordTrack = () => {
    const pattern = getSolfaBarBoxPattern(timeSignature);
    return (
      <div className="flex items-center mb-0 min-h-[28px]">
        <span className="sticky left-0 z-10 w-32 px-2 py-1 font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left flex items-center justify-between" style={{ minWidth: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
          <span>Chord Track</span>
          <button
            className="w-5 h-5 rounded bg-red-200 dark:bg-red-700 text-red-900 dark:text-white flex items-center justify-center hover:bg-red-300 dark:hover:bg-red-600 text-xs"
            onClick={handleClearChordTrack}
            title="Clear Chord track"
            type="button"
          >×
          </button>
        </span>
        <div className="flex-1 min-w-0 flex">
          {Array.from({ length: measureCount }).map((_, measureIdx) => (
            <div key={measureIdx} className="flex items-center h-full">
              {pattern.map((seg, segIdx) => {
                const chordKey = `${measureIdx}-${segIdx}`;
                const chord = chords[chordKey];
                
                return (
                  <React.Fragment key={`chord-fragment-${measureIdx}-${segIdx}`}>
                    <span
                      key={`bar-${segIdx}`}
                      style={{
                        width: `${GRID_CELL_WIDTH * zoom}px`,
                        minWidth: `${GRID_CELL_WIDTH * zoom}px`,
                        display: 'inline-block',
                        textAlign: 'center'
                      }}
                      className="select-none font-solfa"
                    >
                      {'\u00A0'}
                    </span>
                    <div
                      key={`chord-${segIdx}`}
                      className={`flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors ${
                        chord 
                          ? 'bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700' 
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      style={{ width: `${GRID_CELL_WIDTH * 4 * zoom}px`, height: 28 }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const existingChord = chords[`${measureIdx}-${segIdx}`];
                        
                        // Initialize pending chord with existing chord or defaults
                        if (existingChord) {
                          setPendingChord({ root: existingChord.root, type: existingChord.type });
                        } else {
                          setPendingChord({ root: 'C', type: 'maj' });
                        }
                        
                        setChordPopup({
                          measureIdx,
                          segIdx,
                          x: rect.left,
                          y: rect.top
                        });
                      }}
                    >
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                        {chord?.symbol || '+'}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Focus the selected cell when it changes
  useEffect(() => {
    if (selectedCellRef.current) {
      selectedCellRef.current.focus();
    }
  }, [selectedCell]);

  // Keyboard navigation handler
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, measureIdx: number, rowIdx: number, segIdx: number, boxIdx: number) => {
    if (!selectedCell) return;
    let { measureIdx: m, rowIdx: r, segIdx: s, boxIdx: b } = selectedCell;
    if (e.key === 'ArrowRight') {
      b++;
    } else if (e.key === 'ArrowLeft') {
      b--;
    } else if (e.key === 'ArrowDown') {
      r = Math.min(r + 1, 3); // SATB rows: 0-3
    } else if (e.key === 'ArrowUp') {
      r = Math.max(r - 1, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      b++;
    }
    // Clamp and wrap
    if (b < 0) { b = 3; s--; } // wrap to previous segment
    if (b > 3) { b = 0; s++; }
    // TODO: clamp s, m as needed
    setSelectedCell({ measureIdx: m, rowIdx: r, segIdx: s, boxIdx: b });
  };

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const targetElement = e.target as Element;
      const isInsidePopup = targetElement.closest('.fixed');
      
      if (chordPopup && !isInsidePopup) {
        handleChordCancel();
      }
      if (lyricPopup && !isInsidePopup) {
        handleLyricCancel();
      }
      if (markerPopup && !isInsidePopup) {
        handleMarkerCancel();
      }
      if (notePopup && !isInsidePopup) {
        handleNoteCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [chordPopup, lyricPopup, markerPopup, notePopup]);

  // Render clear warning dialog
  const renderClearWarningDialog = () => {
    if (!clearWarning) return null;

    const trackName = clearWarning.type === 'SATB' ? clearWarning.trackName : clearWarning.type;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">Clear Track Data</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Are you sure you want to clear all data from the <strong>{trackName}</strong> track? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500"
              onClick={cancelClear}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              onClick={confirmClear}
            >
              Clear Track
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderChordPopup()}
      {renderLyricPopup()}
      {renderMarkerPopup()}
      {renderNotePopup()}
      {renderClearWarningDialog()}
      <div
        className={`fixed bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-all duration-300 ${isCollapsed ? 'h-12' : ''}`}
        style={{
          height: isCollapsed ? 48 : panelHeight + 48,
          left: '220px', // leave space for sidebar (adjust if sidebar width changes)
          right: 0,
          maxWidth: '1200px', // or '80vw' for responsive
          margin: '0 auto',
          zIndex: 20
        }}
      >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 z-10">
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`h-full flex flex-col ${isCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        {/* Drag handle */}
        <div
          ref={dragRef}
          className="w-full h-2 cursor-ns-resize bg-slate-200 dark:bg-slate-700 flex items-center justify-center z-20"
          style={{ marginTop: -8, marginBottom: 4, borderRadius: 4 }}
          onMouseDown={handleDragStart}
        >
          <div className="w-12 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
        </div>
        {/* Control Panel */}
        <div className="flex flex-col items-center justify-center py-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <PlaybackControls
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onStop={() => setIsPlaying(false)}
              onReset={clearAll}
            />
            <TimeSignatureSelector value={timeSignature} onChange={setTimeSignature} />
            <button
              className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${isMetronomeOn ? 'bg-blue-200 dark:bg-blue-800' : ''}`}
              title="Metronome"
              onClick={() => setIsMetronomeOn((on) => !on)}
            >
              <FaDrumSteelpan className="h-5 w-5" />
            </button>
            <button onClick={handleZoomOut} className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700" title="Zoom Out" disabled={zoom === ZOOM_LEVELS[0]}>
              <FaSearchMinus className="h-5 w-5" />
            </button>
            <button onClick={handleZoomIn} className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700" title="Zoom In" disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length-1]}>
              <FaSearchPlus className="h-5 w-5" />
            </button>
            <button
              onClick={addMeasure}
              className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Add measure"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={removeMeasure}
              className="p-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Remove measure"
              disabled={measureCount <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-xs">Measures: {measureCount}</span>
            <button
              className={`p-2 rounded border ${debugGrid ? 'bg-orange-200 border-orange-400 text-orange-900' : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}
              title="Toggle grid debug overlay"
              onClick={() => setDebugGrid(d => !d)}
            >
              {debugGrid ? 'Hide Grid Debug' : 'Show Grid Debug'}
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto" style={{ maxHeight: panelHeight }}>
          <div className="min-w-full w-max p-2">
            {renderTimelineRow()}
            {renderMarkerTrack()}
            {renderSymbolsTrack()}
            {renderLyricsTrack()}
            {renderChordTrack()}
            {renderSATBTracks()}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default TrackPanel;