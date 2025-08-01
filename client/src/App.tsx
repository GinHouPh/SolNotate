import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import TrackPanel from './components/TrackPanel';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <Header />
        <div className="flex-grow flex overflow-hidden">
          <Sidebar />
          <main className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow overflow-auto p-4">
              <Canvas />
            </div>
            <TrackPanel />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;