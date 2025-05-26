import { Marker } from '../types/music';

interface TimelineProps {
  markers: Marker[];
  onAddMarker: (position: number) => void;
  onUpdateMarker: (id: string, text: string) => void;
  onRemoveMarker: (id: string) => void;
  measureCount: number;
}

const Timeline = ({
  markers,
  onAddMarker,
  onUpdateMarker,
  onRemoveMarker,
  measureCount,
}: TimelineProps) => {
  return (
    <div className="relative mb-4 min-w-[800px]">
      <div className="flex">
        <div className="w-8" /> {/* Spacer to align with voice labels */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
          <div className="flex relative h-8">
            {Array.from({ length: measureCount }).map((_, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 border-r border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                style={{ width: '200px' }}
                onClick={() => onAddMarker(i)}
              >
                <div className="absolute -top-2 left-1 text-xs text-slate-500">
                  {i + 1}
                </div>
                {markers.filter(m => m.position === i).map(marker => (
                  <div
                    key={marker.id}
                    className="absolute inset-x-0 bottom-0 flex items-center px-2"
                  >
                    <input
                      type="text"
                      value={marker.text}
                      onChange={(e) => onUpdateMarker(marker.id, e.target.value)}
                      className="w-full text-sm px-1 bg-blue-100 dark:bg-blue-900 rounded"
                      placeholder="Marker name..."
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveMarker(marker.id);
                      }}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timeline;