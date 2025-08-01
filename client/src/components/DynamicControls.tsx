import { useState } from 'react';
import { Dynamic, VoicePart } from '../types/music';

interface DynamicControlsProps {
  onAddDynamic: (position: number, dynamic: Dynamic, voicePart?: VoicePart) => void;
  selectedVoicePart?: VoicePart;
}

const DynamicControls = ({ onAddDynamic, selectedVoicePart }: DynamicControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(0);

  const dynamics: Dynamic[] = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff', 'sfz', 'fp'];

  const handleAddDynamic = (dynamic: Dynamic) => {
    onAddDynamic(position, dynamic, selectedVoicePart);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="0"
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
          className="w-16 px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
          placeholder="Position"
        />
        <button
          className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          Add Dynamic
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
          <div className="py-1">
            {dynamics.map((dynamic) => (
              <button
                key={dynamic}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                onClick={() => handleAddDynamic(dynamic)}
              >
                {dynamic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicControls; 