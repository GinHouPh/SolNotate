import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Minus, Music, ChevronUp, Hash, Volume2, Zap, Clock, Repeat } from 'lucide-react';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { FaDrumSteelpan } from 'react-icons/fa6';
import MusicStaff from './MusicStaff';
import PlaybackControls from './PlaybackControls';
import TimeSignatureSelector from './TimeSignatureSelector';
import type { Note, VoicePart, TimeSignature, NoteType, Subdivision, Tool } from '../types/music';

type TrackKey = VoicePart | 'Chord' | 'Lyrics';

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
    Chord: [] as Note[],
    Lyrics: [] as Note[]
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
  const [selectedChordRoot, setSelectedChordRoot] = useState<string | null>(null);
  const [selectedChordType, setSelectedChordType] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [previewChord, setPreviewChord] = useState<string | null>(null);

  const clearAll = () => {
    setTracks({
      S: [],
      A: [],
      T: [],
      B: [],
      Chord: [],
      Lyrics: []
    });
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

  // Update Marker track to allow marker placement
  const renderMarkerTrack = () => {
    const pattern = getSolfaBarBoxPattern(timeSignature);
    return (
      <div className="flex items-center mb-0 min-h-[32px]">
        <span className="sticky left-0 z-10 flex items-center justify-between bg-green-50 dark:bg-green-900 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left select-none px-2 font-semibold text-green-700 dark:text-green-300" style={{ minWidth: TRACK_HEADER_WIDTH, width: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
          Marker
        </span>
        <div className="flex-1 min-w-0 flex items-center h-8 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
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
                  <div
                    key={`marker-${segIdx}`}
                    className="flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center cursor-pointer"
                    style={{ width: `${GRID_CELL_WIDTH * 4 * zoom}px`, height: 28 }}
                    onClick={() => {
                      if (selectedMarker) {
                        // Place marker logic here
                        console.log(`Placing marker ${selectedMarker} at measure ${measureIdx + 1}, segment ${segIdx + 1}`);
                        setSelectedMarker(null); // Reset after placement
                      }
                    }}
                  >
                    {/* Marker cell placeholder */}
                  </div>
                </>
              ))}
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

  // Update SATB tracks to allow togglable note selection with subdivision beats
  const renderSATBTracks = () => (
    (["S", "A", "T", "B"] as VoicePart[]).map((part, rowIdx) => {
      const pattern = getSolfaBarBoxPattern(timeSignature);
      return (
        <div key={part} className="flex items-center mb-0 min-h-[28px]">
          <span className={`sticky left-0 top-0 z-10 w-32 px-2 py-1 font-semibold border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left ${SATB_HEADER_COLORS[part]}`} style={{ minWidth: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
            {SATB_LABELS[part]}
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
                      const isSelected = selectedCell && selectedCell.measureIdx === measureIdx && selectedCell.rowIdx === rowIdx && selectedCell.segIdx === segIdx && selectedCell.boxIdx === boxIdx;
                      return (
                        <div
                          key={`box-${segIdx}-${boxIdx}`}
                          className={`flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer ${isSelected ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} ${debugGrid ? 'outline outline-2 outline-pink-400' : ''}`}
                          style={{ width: `${GRID_CELL_WIDTH * zoom}px`, height: 28 }}
                          onClick={() => {
                            setSelectedCell({ measureIdx, rowIdx, segIdx, boxIdx });
                            // Note entry logic here
                            if (currentNote) {
                              const note = isHighOctave ? currentNote.toUpperCase() : isLowOctave ? currentNote.toLowerCase() : currentNote;
                              console.log(`Placing note ${note} with subdivision ${currentSubdivision} and articulation ${currentArticulation} at measure ${measureIdx + 1}, segment ${segIdx + 1}, box ${boxIdx + 1}, row ${rowIdx + 1}`);
                            }
                          }}
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

  // Update Lyrics track to use blank spacers for bars/colons
  const renderLyricsTrack = () => {
    const pattern = getSolfaBarBoxPattern(timeSignature);
    return (
      <div className="flex items-center mb-0 min-h-[28px]">
        <span className="sticky left-0 z-10 w-32 px-2 py-1 font-semibold border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200" style={{ minWidth: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
          Lyrics
        </span>
        <div className="flex-1 min-w-0 flex">
          {renderSolfaBlankRow(pattern, measureCount, zoom)}
        </div>
      </div>
    );
  };

  // Update Chord track to remove beat markers and use empty spaces
  const renderChordTrack = () => {
    const pattern = getSolfaBarBoxPattern(timeSignature);
    return (
      <div className="flex items-center mb-0 min-h-[28px]">
        <span className="sticky left-0 z-10 w-32 px-2 py-1 font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900 border-b border-slate-300 dark:border-slate-700 flex-shrink-0 text-sm text-left" style={{ minWidth: TRACK_HEADER_WIDTH, borderRadius: 0 }}>
          Chord Track
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
                    {'\u00A0'}
                  </span>
                  <div
                    key={`chord-${segIdx}`}
                    className="flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center"
                    style={{ width: `${GRID_CELL_WIDTH * 4 * zoom}px`, height: 28 }}
                    onClick={() => {
                      // Place chord logic here
                      console.log(`Placing chord at measure ${measureIdx + 1}, segment ${segIdx + 1}`);
                    }}
                  >
                    {/* Chord name will be placed here */}
                  </div>
                </>
              ))}
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

  return (
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
  );
};

export default TrackPanel;