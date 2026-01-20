
import React, { useState } from 'react';
import Recorder from './components/Recorder';
import RecordList from './components/RecordList';
import { Recording } from './types';

const App: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const addRecording = (rec: Recording) => {
    setRecordings(prev => [rec, ...prev]);
    setTimeout(() => setShowHistory(true), 1200);
  };

  const deleteRecording = (id: string) => {
    if (confirm('이 녹음 기록을 삭제하시겠습니까?')) {
      setRecordings(prev => {
        const target = prev.find(r => r.id === id);
        if (target) URL.revokeObjectURL(target.url);
        return prev.filter(r => r.id !== id);
      });
    }
  };

  const renameRecording = (id: string, newName: string) => {
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, name: newName } : r));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* The Radio Body */}
      <div className="relative w-full max-w-lg aspect-[4/5] sm:aspect-[4/3.5] wood-panel rounded-[3rem] p-1 border-[10px] border-[#331c12] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Top Handle Decorative Element */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-2 bg-black/40 rounded-full" />
        
        {/* Inner Gold Bezel */}
        <div className="w-full h-full rounded-[2.2rem] p-6 sm:p-10 flex flex-col relative border-2 border-amber-900/30">
          
          {/* Header Area */}
          <div className="flex justify-between items-center mb-8">
             <div className="flex flex-col">
                <span className="text-[10px] font-black gold-text tracking-[0.3em] uppercase opacity-60">High Fidelity</span>
                <span className="brand-font text-xl text-white font-bold tracking-tight">PHIL TONG</span>
             </div>
             <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  showHistory ? 'bg-amber-500 border-amber-300 text-black rotate-180' : 'bg-transparent border-amber-900/50 text-amber-500 hover:bg-amber-900/20'
                }`}
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
             </button>
          </div>

          {/* Main Display/Action Container */}
          <div className="flex-1 relative">
            {/* Recorder Section */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              showHistory ? 'opacity-0 scale-90 -translate-y-full pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
            }`}>
              <Recorder onSave={addRecording} />
            </div>

            {/* History Section */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out overflow-y-auto px-1 ${
              showHistory ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-full scale-90 pointer-events-none'
            }`}>
               <div className="mb-6 pb-2 border-b-2 border-amber-900/20">
                  <h2 className="brand-font text-2xl text-white italic">Station Log</h2>
                  <p className="dial-font text-[10px] gold-text font-bold uppercase opacity-60 tracking-widest">{recordings.length} Saved Entries</p>
               </div>
               <RecordList recordings={recordings} onDelete={deleteRecording} onRename={renameRecording} />
            </div>
          </div>

          {/* Bottom Branding Sticker */}
          {!showHistory && (
             <div className="mt-8 flex justify-center">
                <div className="px-4 py-1 border border-amber-500/20 rounded bg-black/20">
                   <span className="dial-font text-[8px] gold-text opacity-40 font-bold uppercase tracking-[0.5em]">Transistor Technology • 2025 Model</span>
                </div>
             </div>
          )}

        </div>
      </div>

      {/* Floating Return Button */}
      {showHistory && (
        <button 
          onClick={() => setShowHistory(false)}
          className="mt-10 px-10 py-4 bg-gradient-to-b from-[#c5a059] to-[#8c6d32] text-black font-black uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          New Recording
        </button>
      )}

      {/* Background Ambience Labels */}
      <div className="fixed bottom-4 right-4 opacity-10 brand-font text-4xl gold-text pointer-events-none select-none">
        RETRO HI-FI
      </div>
    </div>
  );
};

export default App;
