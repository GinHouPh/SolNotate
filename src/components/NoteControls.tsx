import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Music, Volume2, Zap, Clock, Repeat, Hash } from 'lucide-react';
import { NoteType, NoteDuration, Subdivision } from '../types/music';

const ACCIDENTALS = [
  { label: '♯', value: 'sharp' },
  { label: '♭', value: 'flat' },
  { label: '♮', value: 'natural' },
];
const KEY_SIGNATURES = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'
];
const DYNAMICS = [
  { label: 'pp', value: 'pp' },
  { label: 'p', value: 'p' },
  { label: 'mp', value: 'mp' },
  { label: 'mf', value: 'mf' },
  { label: 'f', value: 'f' },
  { label: 'ff', value: 'ff' },
  { label: 'sfz', value: 'sfz' },
  { label: 'fp', value: 'fp' },
];
const ARTICULATIONS = [
  { label: 'Staccato', value: 'staccato', icon: '•' },
  { label: 'Legato', value: 'legato', icon: 'slur' },
  { label: 'Accent', value: 'accent', icon: '>' },
  { label: 'Tenuto', value: 'tenuto', icon: '-' },
  { label: 'Marcato', value: 'marcato', icon: '^' },
];
const TEMPOS = [
  { label: 'Largo', value: 'largo' },
  { label: 'Adagio', value: 'adagio' },
  { label: 'Andante', value: 'andante' },
  { label: 'Moderato', value: 'moderato' },
  { label: 'Allegro', value: 'allegro' },
  { label: 'Presto', value: 'presto' },
];
const REPEATS_CODAS = [
  { label: 'Repeat Start', value: 'repeatStart', icon: '||:' },
  { label: 'Repeat End', value: 'repeatEnd', icon: ':||' },
  { label: 'Coda', value: 'coda', icon: '𝄌' },
  { label: 'Segno', value: 'segno', icon: '𝄋' },
];

// Add accidental notes and their keyboard mappings
const ACCIDENTAL_NOTES = [
  { note: 'de', key: 'q' },
  { note: 're', key: 'w' },
  { note: 'fe', key: 'e' },
  { note: 'se', key: 'y' },
  { note: 'le', key: 'u' },
  { note: 'ta', key: 'i' },
  { note: 'ba', key: 'o' },
  { note: 'ma', key: 'p' },
];

const NOTE_KEY_HINTS = {
  d: 'd/D/1', r: 'r/R/2', m: 'm/M/3', f: 'f/F/4', s: 's/S/5', l: 'l/L/6', t: 't/T/7',
};

const SUBDIVISION_SYMBOLS = [
  { value: '', label: 'None', symbol: 'None' },
  { value: ',', label: 'Comma', symbol: ',' },
  { value: '.', label: 'Dot', symbol: '.' },
  { value: '.,', label: 'Dot+Comma', symbol: '.,' },
];

const CHORD_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CHORD_TYPES = [
  { label: 'Major', value: 'maj' },
  { label: 'Minor', value: 'min' },
  { label: 'Diminished', value: 'dim' },
  { label: 'Augmented', value: 'aug' },
  { label: 'Sus2', value: 'sus2' },
  { label: 'Sus4', value: 'sus4' },
  { label: '7', value: '7' },
  { label: 'm7', value: 'm7' },
  { label: 'Maj7', value: 'maj7' },
  { label: 'Dim7', value: 'dim7' },
  { label: 'Aug7', value: 'aug7' },
];

interface NoteControlsProps {
  currentNote: NoteType;
  setCurrentNote: (note: NoteType) => void;
  currentDuration: NoteDuration;
  setCurrentDuration: (duration: NoteDuration) => void;
  currentSubdivision: Subdivision;
  setCurrentSubdivision: (subdivision: Subdivision) => void;
  isHighOctave: boolean;
  setIsHighOctave: (value: boolean) => void;
  isLowOctave: boolean;
  setIsLowOctave: (value: boolean) => void;
}

const NoteControls = ({
  currentNote,
  setCurrentNote,
  currentDuration,
  setCurrentDuration,
  currentSubdivision,
  setCurrentSubdivision,
  isHighOctave,
  setIsHighOctave,
  isLowOctave,
  setIsLowOctave
}: NoteControlsProps) => {
  const notes: NoteType[] = ['d', 'r', 'm', 'f', 's', 'l', 't'];
  const subdivisions: Subdivision[] = ['', '.', '..', '...'];
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [collapsed, setCollapsed] = useState({
    notes: false,
    chord: false,
    dynamics: false,
    articulations: false,
    tempo: false,
    repeats: false,
  });
  const [selectedChordRoot, setSelectedChordRoot] = useState('C');
  const [selectedChordType, setSelectedChordType] = useState('maj');
  const [focusedButton, setFocusedButton] = useState<{ group: string, index: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [previewChord, setPreviewChord] = useState<string>('');
  
  const subdivisionLabels: Record<Subdivision, string> = {
    '': 'None',
    '.': 'Dot',
    '..': 'Double Dot',
    '...': 'Triple Dot'
  };

  const toggleOctave = (high: boolean) => {
    if (high) {
      setIsHighOctave(!isHighOctave);
      setIsLowOctave(false);
    } else {
      setIsLowOctave(!isLowOctave);
      setIsHighOctave(false);
    }
  };
  
  // Focus the selected/focused button
  useEffect(() => {
    if (focusedButton) {
      const refKey = `${focusedButton.group}-${focusedButton.index}`;
      if (buttonRefs.current[refKey]) {
        buttonRefs.current[refKey]?.focus();
      }
    }
  }, [focusedButton]);

  // Keyboard navigation handler
  const handleButtonKeyDown = (e: React.KeyboardEvent, group: string, index: number, groupArr: any[], groupOrder: string[]) => {
    let nextGroup = group;
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault();
      nextIndex = (index + 1) % groupArr.length;
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      nextIndex = (index - 1 + groupArr.length) % groupArr.length;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextGroupIdx = (groupOrder.indexOf(group) + 1) % groupOrder.length;
      nextGroup = groupOrder[nextGroupIdx];
      nextIndex = 0;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevGroupIdx = (groupOrder.indexOf(group) - 1 + groupOrder.length) % groupOrder.length;
      nextGroup = groupOrder[prevGroupIdx];
      nextIndex = 0;
    }
    setFocusedButton({ group: nextGroup, index: nextIndex });
  };

  // Define group order for navigation
  const groupOrder = ['notes', 'chord', 'dynamics', 'articulations', 'tempo', 'repeats'];

  // Flatten all note-related buttons into a single array for navigation
  const allNoteButtons = [
    ...notes.map((note, i) => ({ group: 'notes', type: 'natural', value: note, label: note, idx: i })),
    ...ACCIDENTAL_NOTES.map(({ note, key }, i) => ({ group: 'notes', type: 'accidental', value: note, label: key, idx: notes.length + i })),
    ...SUBDIVISION_SYMBOLS.map((sub, i) => ({ group: 'notes', type: 'subdivision', value: sub.value, label: sub.symbol, idx: notes.length + ACCIDENTAL_NOTES.length + i })),
    { group: 'notes', type: 'octave', value: 'high', label: 'high', idx: notes.length + ACCIDENTAL_NOTES.length + SUBDIVISION_SYMBOLS.length },
    { group: 'notes', type: 'octave', value: 'low', label: 'low', idx: notes.length + ACCIDENTAL_NOTES.length + SUBDIVISION_SYMBOLS.length + 1 },
  ];

  // Update chord selection logic to set previewChord
  useEffect(() => {
    const chordType = CHORD_TYPES.find(t => t.value === selectedChordType)?.label || '';
    setPreviewChord(`${selectedChordRoot} ${chordType}`);
  }, [selectedChordRoot, selectedChordType]);
  
  return (
    <div className="space-y-6 p-2 w-56 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
      {/* Note Selection, Subdivision, Octave as a single group */}
      <div>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setCollapsed(c => ({ ...c, notes: !c.notes }))}>
          <span className="flex items-center gap-1">
            <Music className="h-4 w-4 text-blue-400" />
            <h4 className="font-semibold text-xs text-slate-500 mb-1">Note Selection</h4>
          </span>
          <span className="text-xs">{collapsed.notes ? '+' : '-'}</span>
        </div>
        {!collapsed.notes && (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
              {allNoteButtons.filter(btn => btn.type === 'natural').map((btn, i) => (
                <button
                  key={btn.value}
                  ref={el => buttonRefs.current[`notes-${btn.idx}`] = el}
                  tabIndex={focusedButton?.group === 'notes' && focusedButton.index === btn.idx ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'notes', index: btn.idx })}
                  onKeyDown={e => handleButtonKeyDown(e, 'notes', btn.idx, allNoteButtons, groupOrder)}
                  className={`px-3 py-2 rounded-md text-xl font-solfa transition-colors duration-200 ${
                    currentNote === btn.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => setCurrentNote(btn.value as NoteType)}
                  title={`Middle: ${btn.value} | High: ${btn.value.toUpperCase()} | Low: ${NOTE_KEY_HINTS[btn.value as keyof typeof NOTE_KEY_HINTS].split('/')[2]}`}
                  aria-label={`Note ${btn.value}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {allNoteButtons.filter(btn => btn.type === 'accidental').map((btn, i) => (
                <button
                  key={btn.value}
                  ref={el => buttonRefs.current[`notes-${btn.idx}`] = el}
                  tabIndex={focusedButton?.group === 'notes' && focusedButton.index === btn.idx ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'notes', index: btn.idx })}
                  onKeyDown={e => handleButtonKeyDown(e, 'notes', btn.idx, allNoteButtons, groupOrder)}
                  className={`px-3 py-2 rounded-md text-xl font-solfa transition-colors duration-200 ${
                    currentNote === btn.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => setCurrentNote(btn.value as NoteType)}
                  title={btn.value}
                  aria-label={btn.value}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {allNoteButtons.filter(btn => btn.type === 'subdivision').map((btn, i) => (
                <button
                  key={btn.value}
                  ref={el => buttonRefs.current[`notes-${btn.idx}`] = el}
                  tabIndex={focusedButton?.group === 'notes' && focusedButton.index === btn.idx ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'notes', index: btn.idx })}
                  onKeyDown={e => handleButtonKeyDown(e, 'notes', btn.idx, allNoteButtons, groupOrder)}
                  className={`px-3 py-2 rounded-md text-xl transition-colors duration-200 ${
                    currentSubdivision === btn.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                  } ${btn.value !== '' ? 'font-solfa' : ''}`}
                  onClick={() => setCurrentSubdivision(btn.value as Subdivision)}
                  title={btn.label}
                  aria-label={btn.label}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              {allNoteButtons.filter(btn => btn.type === 'octave').map((btn, i) => (
                <button
                  key={btn.value}
                  ref={el => buttonRefs.current[`notes-${btn.idx}`] = el}
                  tabIndex={focusedButton?.group === 'notes' && focusedButton.index === btn.idx ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'notes', index: btn.idx })}
                  onKeyDown={e => handleButtonKeyDown(e, 'notes', btn.idx, allNoteButtons, groupOrder)}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    btn.value === 'high'
                      ? isHighOctave
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                      : isLowOctave
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => toggleOctave(btn.value === 'high')}
                  title={btn.value === 'high' ? 'High Octave (UPPERCASE)' : 'Low Octave (Numpad or zxcv...)'}
                  aria-label={btn.value === 'high' ? 'High Octave' : 'Low Octave'}
                >
                  {btn.value === 'high' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Toolbox Groups */}
      <div className="space-y-4">
        {/* Chord Selection */}
        <div>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setCollapsed(c => ({ ...c, chord: !c.chord }))}>
            <span className="flex items-center gap-1">
              <Hash className="h-4 w-4 text-purple-400" />
              <h4 className="font-semibold text-xs text-slate-500 mb-1">Chord Selection</h4>
            </span>
            <span className="text-xs">{collapsed.chord ? '+' : '-'}</span>
          </div>
          {!collapsed.chord && (
            <>
              <div className="flex gap-2 flex-wrap mb-2">
                {CHORD_ROOTS.map((root, i) => (
                  <button
                    key={root}
                    ref={el => buttonRefs.current[`chord-${i}`] = el}
                    tabIndex={focusedButton?.group === 'chord' && focusedButton.index === i ? 0 : -1}
                    onFocus={() => setFocusedButton({ group: 'chord', index: i })}
                    onKeyDown={e => handleButtonKeyDown(e, 'chord', i, CHORD_ROOTS, groupOrder)}
                    className={`px-2 py-1 rounded text-sm border ${selectedChordRoot === root ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
                    onClick={() => setSelectedChordRoot(root)}
                    aria-label={`Chord Root ${root}`}
                  >
                    {root}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {CHORD_TYPES.map((chord, i) => (
                  <button
                    key={chord.value}
                    ref={el => buttonRefs.current[`chord-type-${i}`] = el}
                    tabIndex={focusedButton?.group === 'chord' && focusedButton.index === i + CHORD_ROOTS.length ? 0 : -1}
                    onFocus={() => setFocusedButton({ group: 'chord', index: i + CHORD_ROOTS.length })}
                    onKeyDown={e => handleButtonKeyDown(e, 'chord', i + CHORD_ROOTS.length, [...CHORD_ROOTS, ...CHORD_TYPES], groupOrder)}
                    className={`px-2 py-1 rounded text-sm border ${selectedChordType === chord.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
                    onClick={() => setSelectedChordType(chord.value)}
                    aria-label={`Chord Type ${chord.label}`}
                  >
                    {chord.label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400 mb-2">Selected: {previewChord}</div>
            </>
          )}
        </div>
        {/* Dynamics */}
        <div>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setCollapsed(c => ({ ...c, dynamics: !c.dynamics }))}>
            <span className="flex items-center gap-1">
              <Volume2 className="h-4 w-4 text-green-400" />
              <h4 className="font-semibold text-xs text-slate-500 mb-1">Dynamics</h4>
            </span>
            <span className="text-xs">{collapsed.dynamics ? '+' : '-'}</span>
          </div>
          {!collapsed.dynamics && (
            <div className="flex gap-2 flex-wrap">
              {DYNAMICS.map((dyn, i) => (
                <button
                  key={dyn.value}
                  ref={el => buttonRefs.current[`dynamics-${i}`] = el}
                  tabIndex={focusedButton?.group === 'dynamics' && focusedButton.index === i ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'dynamics', index: i })}
                  onKeyDown={e => handleButtonKeyDown(e, 'dynamics', i, DYNAMICS, groupOrder)}
                  className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === dyn.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
                  onClick={() => setSelectedTool(dyn)}
                  aria-label={dyn.label}
                >
                  {dyn.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Articulations */}
        <div>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setCollapsed(c => ({ ...c, articulations: !c.articulations }))}>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <h4 className="font-semibold text-xs text-slate-500 mb-1">Articulations</h4>
            </span>
            <span className="text-xs">{collapsed.articulations ? '+' : '-'}</span>
          </div>
          {!collapsed.articulations && (
            <div className="flex gap-2 flex-wrap">
              {ARTICULATIONS.map((art, i) => (
                <button
                  key={art.value}
                  ref={el => buttonRefs.current[`articulations-${i}`] = el}
                  tabIndex={focusedButton?.group === 'articulations' && focusedButton.index === i ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'articulations', index: i })}
                  onKeyDown={e => handleButtonKeyDown(e, 'articulations', i, ARTICULATIONS, groupOrder)}
                  className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === art.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
                  onClick={() => setSelectedTool(art)}
                  aria-label={art.label}
                >
                  {art.icon || art.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Tempo */}
        <div>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setCollapsed(c => ({ ...c, tempo: !c.tempo }))}>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-pink-400" />
              <h4 className="font-semibold text-xs text-slate-500 mb-1">Tempo</h4>
            </span>
            <span className="text-xs">{collapsed.tempo ? '+' : '-'}</span>
          </div>
          {!collapsed.tempo && (
            <div className="flex gap-2 flex-wrap">
              {TEMPOS.map((tempo, i) => (
                <button
                  key={tempo.value}
                  ref={el => buttonRefs.current[`tempo-${i}`] = el}
                  tabIndex={focusedButton?.group === 'tempo' && focusedButton.index === i ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'tempo', index: i })}
                  onKeyDown={e => handleButtonKeyDown(e, 'tempo', i, TEMPOS, groupOrder)}
                  className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === tempo.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
                  onClick={() => setSelectedTool(tempo)}
                  aria-label={tempo.label}
                >
                  {tempo.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Repeats & Codas */}
        <div>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setCollapsed(c => ({ ...c, repeats: !c.repeats }))}>
            <span className="flex items-center gap-1">
              <Repeat className="h-4 w-4 text-red-400" />
              <h4 className="font-semibold text-xs text-slate-500 mb-1">Repeats & Codas</h4>
            </span>
            <span className="text-xs">{collapsed.repeats ? '+' : '-'}</span>
          </div>
          {!collapsed.repeats && (
            <div className="flex gap-2 flex-wrap">
              {REPEATS_CODAS.map((rep, i) => (
                <button
                  key={rep.value}
                  ref={el => buttonRefs.current[`repeats-${i}`] = el}
                  tabIndex={focusedButton?.group === 'repeats' && focusedButton.index === i ? 0 : -1}
                  onFocus={() => setFocusedButton({ group: 'repeats', index: i })}
                  onKeyDown={e => handleButtonKeyDown(e, 'repeats', i, REPEATS_CODAS, groupOrder)}
                  className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === rep.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
                  onClick={() => setSelectedTool(rep)}
                  aria-label={rep.label}
                >
                  {rep.icon || rep.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteControls;