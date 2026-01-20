
import React, { useState, useRef } from 'react';
import { Recording } from '../types';
import { formatTime, formatDate } from '../utils/formatters';

interface RecordListProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

const RecordList: React.FC<RecordListProps> = ({ recordings, onDelete, onRename }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (recording: Recording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(recording.url);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(recording.id);
    }
  };

  if (recordings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <p className="brand-font italic text-lg gold-text">No entries logged</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {recordings.map((recording) => (
        <div key={recording.id} className="relative group">
           {/* Classic label card aesthetic */}
           <div className="bg-[#f4ece1] text-[#2a1a0a] rounded-md p-4 shadow-lg border-l-8 border-amber-800 flex flex-col space-y-3 transform transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold dial-font text-sm uppercase truncate pr-4">{recording.name}</h3>
                  <div className="flex items-center space-x-2 text-[10px] font-bold opacity-70 mt-1 uppercase">
                    <span className="bg-amber-800 text-white px-1.5 py-0.5 rounded-sm">LOG</span>
                    <span>{formatDate(recording.timestamp)}</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="dial-font font-bold text-lg">{formatTime(recording.duration)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-amber-800/20 pt-3">
                 <button 
                   onClick={() => handlePlay(recording)}
                   className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest transition-colors ${
                     playingId === recording.id ? 'bg-amber-800 text-white' : 'bg-[#e5ddd2] text-amber-900 border border-amber-900/20 hover:bg-amber-800 hover:text-white'
                   }`}
                 >
                   {playingId === recording.id ? (
                      <><div className="w-2 h-2 bg-white animate-pulse rounded-full"/><span>PLAYING</span></>
                   ) : (
                      <span>LISTEN</span>
                   )}
                 </button>

                 <div className="flex items-center space-x-4">
                    <a href={recording.url} download={`${recording.name}.mp3`} className="text-amber-900 opacity-60 hover:opacity-100 transition-opacity">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </a>
                    <button onClick={() => onDelete(recording.id)} className="text-red-900 opacity-40 hover:opacity-100 transition-opacity">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                 </div>
              </div>
           </div>
           
           {/* Decorative binding rings effect */}
           <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 flex flex-col space-y-4">
              <div className="w-6 h-1 bg-[#888] rounded-full shadow-md" />
              <div className="w-6 h-1 bg-[#888] rounded-full shadow-md" />
           </div>
        </div>
      ))}
    </div>
  );
};

export default RecordList;
