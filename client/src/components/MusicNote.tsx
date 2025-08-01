import { Note, NoteType } from '../types/music';
import { motion } from '../utils/motionStub';

interface MusicNoteProps {
  note: Note;
  currentNote: NoteType;
}

const MusicNote = ({ note, currentNote }: MusicNoteProps) => {
  // Calculate the vertical position based on the note type
  const getNotePosition = (noteType: NoteType): number => {
    const positions: Record<NoteType, number> = {
      'do': 135,
      're': 120,
      'mi': 105,
      'fa': 90,
      'sol': 75,
      'la': 60,
      'ti': 45,
    };
    
    return positions[noteType] || 0;
  };
  
  // Get the note symbol based on duration
  const getNoteSymbol = () => {
    switch (note.duration) {
      case 'whole':
        return '𝅝';
      case 'half':
        return '𝅗𝅥';
      case 'quarter':
        return '♩';
      case 'eighth':
        return '♪';
      case 'sixteenth':
        return '𝅘𝅥𝅯';
      default:
        return '♩';
    }
  };
  
  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ top: getNotePosition(note.type) }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-2xl leading-none select-none">{getNoteSymbol()}</span>
      <span className="text-xs mt-0.5 font-medium text-blue-600 dark:text-blue-400 transition-colors duration-300">
        {note.type}{note.octave !== 4 ? note.octave : ''}
      </span>
    </motion.div>
  );
};

export default MusicNote;