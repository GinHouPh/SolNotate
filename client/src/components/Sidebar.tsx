import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import NoteControls from './NoteControls';
import TimeSignatureSelector from './TimeSignatureSelector';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeSignature, setTimeSignature] = useState('4/4');

  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-64'} fixed top-0 left-0 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out z-30`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 z-10"
      >
        <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`flex-grow overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'} transition-all duration-300`}>
        {!isCollapsed && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Tools</h2>
            <NoteControls
              currentNote="d"
              setCurrentNote={() => {}}
              currentDuration="beat"
              setCurrentDuration={() => {}}
              currentSubdivision=""
              setCurrentSubdivision={() => {}}
              isHighOctave={false}
              setIsHighOctave={() => {}}
              isLowOctave={false}
              setIsLowOctave={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;