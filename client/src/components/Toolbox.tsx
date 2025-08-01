import { useState } from 'react';

const ACCIDENTALS = [
  { label: '♯', value: 'sharp' },
  { label: '♭', value: 'flat' },
  { label: '♮', value: 'natural' },
];
const KEY_SIGNATURES = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭'
];
const DYNAMICS = [
  { label: 'pp', value: 'pp' },
  { label: 'p', value: 'p' },
  { label: 'mp', value: 'mp' },
  { label: 'mf', value: 'mf' },
  { label: 'f', value: 'f' },
  { label: 'ff', value: 'ff' },
  { label: 'sfz', value: 'sfz' },
  { label: 'fp', value: 'fp' },
];
const ARTICULATIONS = [
  { label: 'Staccato', value: 'staccato', icon: '•' },
  { label: 'Legato', value: 'legato', icon: 'slur' },
  { label: 'Accent', value: 'accent', icon: '>' },
  { label: 'Tenuto', value: 'tenuto', icon: '-' },
  { label: 'Marcato', value: 'marcato', icon: '^' },
];
const TEMPOS = [
  { label: 'Largo', value: 'largo' },
  { label: 'Adagio', value: 'adagio' },
  { label: 'Andante', value: 'andante' },
  { label: 'Moderato', value: 'moderato' },
  { label: 'Allegro', value: 'allegro' },
  { label: 'Presto', value: 'presto' },
];
const REPEATS_CODAS = [
  { label: 'Repeat Start', value: 'repeatStart', icon: '||:' },
  { label: 'Repeat End', value: 'repeatEnd', icon: ':||' },
  { label: 'Coda', value: 'coda', icon: '𝄌' },
  { label: 'Segno', value: 'segno', icon: '𝄋' },
];

const Toolbox = ({ selectedTool, setSelectedTool }: {
  selectedTool: any;
  setSelectedTool: (tool: any) => void;
}) => {
  return (
    <div className="w-56 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-2 h-full overflow-y-auto">
      <div className="mb-4">
        <h4 className="font-semibold text-xs text-slate-500 mb-1">Accidentals</h4>
        <div className="flex gap-2 flex-wrap">
          {ACCIDENTALS.map(acc => (
            <button
              key={acc.value}
              className={`px-2 py-1 rounded text-lg border ${selectedTool?.value === acc.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
              onClick={() => setSelectedTool(acc)}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold text-xs text-slate-500 mb-1">Key Signatures</h4>
        <div className="flex gap-2 flex-wrap">
          {KEY_SIGNATURES.map(key => (
            <button
              key={key}
              className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === key ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
              onClick={() => setSelectedTool({ type: 'key', value: key })}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold text-xs text-slate-500 mb-1">Dynamics</h4>
        <div className="flex gap-2 flex-wrap">
          {DYNAMICS.map(dyn => (
            <button
              key={dyn.value}
              className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === dyn.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
              onClick={() => setSelectedTool(dyn)}
            >
              {dyn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold text-xs text-slate-500 mb-1">Articulations</h4>
        <div className="flex gap-2 flex-wrap">
          {ARTICULATIONS.map(art => (
            <button
              key={art.value}
              className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === art.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
              onClick={() => setSelectedTool(art)}
            >
              {art.icon || art.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold text-xs text-slate-500 mb-1">Tempo</h4>
        <div className="flex gap-2 flex-wrap">
          {TEMPOS.map(tempo => (
            <button
              key={tempo.value}
              className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === tempo.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
              onClick={() => setSelectedTool(tempo)}
            >
              {tempo.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <h4 className="font-semibold text-xs text-slate-500 mb-1">Repeats & Codas</h4>
        <div className="flex gap-2 flex-wrap">
          {REPEATS_CODAS.map(rep => (
            <button
              key={rep.value}
              className={`px-2 py-1 rounded text-sm border ${selectedTool?.value === rep.value ? 'bg-blue-200 dark:bg-blue-800' : 'bg-white dark:bg-slate-800'} hover:bg-blue-100 dark:hover:bg-blue-700`}
              onClick={() => setSelectedTool(rep)}
            >
              {rep.icon || rep.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbox; 