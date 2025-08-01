import { useState } from 'react';
import { KeySignature, keySignatures } from '../utils/musicalFeatures';

interface KeySignatureSelectorProps {
  value: KeySignature;
  onChange: (keySignature: KeySignature) => void;
}

const KeySignatureSelector = ({ value, onChange }: KeySignatureSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getKeySignatureName = (keySignature: KeySignature): string => {
    const keyName = Object.entries(keySignatures).find(
      ([_, ks]) => 
        ks.tonic === keySignature.tonic && 
        ks.mode === keySignature.mode
    )?.[0] || 'Custom';
    
    return keyName;
  };

  return (
    <div className="relative">
      <button
        className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getKeySignatureName(value)}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10">
          <div className="py-1">
            {Object.entries(keySignatures).map(([name, keySignature]) => (
              <button
                key={name}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                onClick={() => {
                  onChange(keySignature);
                  setIsOpen(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeySignatureSelector; 