import { Play, Square, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import TimeSignatureSelector from './TimeSignatureSelector';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
}

const PlaybackControls = ({ 
  isPlaying, 
  onPlay, 
  onStop,
  onReset 
}: PlaybackControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  
  return (
    <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 transition-colors duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {!isPlaying ? (
            <button
              className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
              onClick={onPlay}
            >
              <Play className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
              onClick={onStop}
            >
              <Square className="h-4 w-4" />
            </button>
          )}
          
          <button
            className="p-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
            onClick={onReset}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            className="p-1.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
        
        
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium">Tempo:</span>
          <input
            type="range"
            min="60"
            max="240"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-xs font-medium w-12">{tempo} BPM</span>
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;