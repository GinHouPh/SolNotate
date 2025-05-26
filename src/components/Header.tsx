import { useState } from 'react';
import { Music, Sun, Moon, Save, Upload, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold">SolNotate</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>File</span>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg overflow-hidden z-20 border border-slate-200 dark:border-slate-700">
                  <div className="py-1">
                    <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                      <Save className="h-4 w-4 mr-2" />
                      <span>Save Composition</span>
                    </button>
                    <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Load Composition</span>
                    </button>
                    <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
                      <Download className="h-4 w-4 mr-2" />
                      <span>Export MIDI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              onClick={toggleTheme}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;