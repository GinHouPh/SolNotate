import { TimeSignature } from '../types/music';

interface TimeSignatureProps {
  value: TimeSignature;
  onChange: (value: TimeSignature) => void;
}

const TimeSignatureSelector = ({ value, onChange }: TimeSignatureProps) => {
  const timeSignatures: TimeSignature[] = ['2/4', '3/4', '4/4', '6/8'];

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium">Time Signature:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeSignature)}
        className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
      >
        {timeSignatures.map((ts) => (
          <option key={ts} value={ts}>
            {ts}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TimeSignatureSelector;