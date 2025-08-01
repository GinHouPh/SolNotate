interface MarkerProps {
  value: string;
  onChange: (value: string) => void;
}

const Marker = ({ value, onChange }: MarkerProps) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add marker (e.g., Verse, Chorus)"
      className="w-full px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
    />
  );
};

export default Marker;