import { useState, useEffect, useRef } from 'react';
import { Note, NoteType, TimeSignature, Subdivision, DynamicMarking } from '../types/music';

interface MusicStaffProps {
  voicePart: 'S' | 'A' | 'T' | 'B' | 'Chord';
  notes: Note[];
  timeSignature: TimeSignature;
  addNote: (position: number, subPosition: number, voicePart: 'S' | 'A' | 'T' | 'B' | 'Chord') => void;
  removeNote: (position: number, subPosition: number, voicePart: 'S' | 'A' | 'T' | 'B' | 'Chord') => void;
  currentNote: NoteType;
  currentSubdivision: Subdivision;
  measureCount: number;
  isSelected: boolean;
  onSelect: () => void;
  dynamics?: DynamicMarking[];
  zoom?: number;
  gridCellWidth?: number;
}

const MusicStaff = ({
  voicePart,
  notes,
  timeSignature,
  addNote,
  removeNote,
  currentNote,
  currentSubdivision,
  measureCount,
  isSelected,
  onSelect,
  dynamics = [],
  zoom = 1,
  gridCellWidth = 36
}: MusicStaffProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measures, setMeasures] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ measure: number; beat: number } | null>(null);
  
  const getBeatsPerMeasure = (timeSignature: TimeSignature): number => {
    const [numerator] = timeSignature.split('/').map(Number);
    return numerator;
  };
  
  useEffect(() => {
    setMeasures(Array.from({ length: measureCount }, (_, i) => i));
  }, [timeSignature, measureCount]);

  const getNoteAtPosition = (measure: number, beat: number, subPosition: number) => {
    return notes.find(note => 
      note.position === measure * getBeatsPerMeasure(timeSignature) + beat &&
      note.subPosition === subPosition
    );
  };

  const getDynamicAtPosition = (position: number): DynamicMarking | undefined => {
    return dynamics.find(d => 
      d.position === position && 
      (!d.voicePart || d.voicePart === voicePart)
    );
  };

  const handleMouseDown = (measure: number, beat: number) => {
    setIsDragging(true);
    setDragStart({ measure, beat });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleMouseEnter = (measure: number, beat: number) => {
    if (isDragging && dragStart) {
      // Handle selection logic here
    }
  };

  const getAccidentalSymbol = (accidental?: string) => {
    switch (accidental) {
      case 'sharp':
        return '♯';
      case 'flat':
        return '♭';
      case 'natural':
        return '♮';
      default:
        return '';
    }
  };

  const renderSubdivision = (measure: number, beat: number, subPosition: number) => {
    const note = getNoteAtPosition(measure, beat, subPosition);
    const position = measure * getBeatsPerMeasure(timeSignature) + beat;
    const dynamic = getDynamicAtPosition(position);
    
    const handleClick = () => {
      if (note) {
        removeNote(position, subPosition, voicePart);
      } else {
        addNote(position, subPosition, voicePart);
      }
    };

    return (
      <div
        key={`${measure}-${beat}-${subPosition}`}
        className={`h-full flex-1 border-r border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 ${
          subPosition === 0 ? 'border-l-2 border-l-slate-300 dark:border-l-slate-600' : ''
        } ${isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
        onClick={handleClick}
        onMouseDown={() => handleMouseDown(measure, beat)}
        onMouseEnter={() => handleMouseEnter(measure, beat)}
      >
        {dynamic && subPosition === 0 && (
          <div className="absolute -top-4 left-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            {dynamic.dynamic}
          </div>
        )}
        {note && (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs font-medium">
              {note.subdivision}
              {getAccidentalSymbol(note.accidental)}
              {note.type}
              {note.isHighOctave ? "'" : note.isLowOctave ? "," : ""}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative mb-0.5" 
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-center group">
        <div className="flex-1 relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
          <div className="flex">
            {measures.map((measure) => (
              <div
                key={measure}
                className="flex-shrink-0 border-r border-slate-300 dark:border-slate-600 relative"
                style={{ width: `${gridCellWidth * 4 * zoom}px` }}
              >
                <div className="flex h-6">
                  {Array.from({ length: getBeatsPerMeasure(timeSignature) }).map((_, beat) => (
                    <div key={beat} className="flex-1 flex">
                      {Array.from({ length: 4 }).map((_, sub) => 
                        renderSubdivision(measure, beat, sub)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicStaff;