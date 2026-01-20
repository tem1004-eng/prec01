
import React, { useState, useRef, useEffect } from 'react';
import { RecorderState, Recording } from '../types';
import { formatTime, generateFileName } from '../utils/formatters';
import Visualizer from './Visualizer';

interface RecorderProps {
  onSave: (recording: Recording) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onSave }) => {
  const [state, setState] = useState<RecorderState>('inactive');
  const [time, setTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempAudioUrl, setTempAudioUrl] = useState<string | null>(null);
  const [tempBlob, setTempBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    if (state !== 'inactive') return;
    
    // Stop any existing playback
    stopPlayback();

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/mp4';

      const recorder = new MediaRecorder(audioStream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setTempAudioUrl(url);
        setTempBlob(blob);
        
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      recorder.start();
      setState('recording');
      setTime(0);
      setTempAudioUrl(null);
      setTempBlob(null);
      
      timerRef.current = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecordingAction = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('inactive');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const stopPlayback = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
      setIsPlaying(false);
    }
  };

  const playTempAudio = () => {
    if (!tempAudioUrl) {
      alert('재생할 녹음 파일이 없습니다. 녹음을 먼저 하거나 파일을 불러오세요.');
      return;
    }
    
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const audio = new Audio(tempAudioUrl);
    audioPlaybackRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  const handleSaveAction = () => {
    if (!tempBlob || !tempAudioUrl) {
      alert('저장할 데이터가 없습니다.');
      return;
    }

    const fileName = generateFileName();
    const newRecording: Recording = {
      id: crypto.randomUUID(),
      url: tempAudioUrl,
      blob: tempBlob,
      name: fileName,
      duration: time || 0,
      timestamp: Date.now()
    };
    
    onSave(newRecording);
    // Reset temp
    setTempAudioUrl(null);
    setTempBlob(null);
    setTime(0);
  };

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop current state
    stopRecordingAction();
    stopPlayback();

    const url = URL.createObjectURL(file);
    setTempAudioUrl(url);
    setTempBlob(file);
    
    // Attempt to get duration
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      setTime(Math.round(tempAudio.duration));
    };
    
    setState('inactive');
    alert('파일을 불러왔습니다. 플레이 버튼으로 확인하세요.');
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* 5 Retro Buttons Bar */}
      <div className="flex items-center justify-between w-full max-w-sm mb-8 px-2">
        <button 
          onClick={startRecording}
          disabled={state === 'recording'}
          className="flex flex-col items-center group disabled:opacity-50"
        >
          <div className="w-12 h-8 bg-[#e5ddd2] rounded-t-lg border-x-2 border-t-2 border-amber-900/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-active:translate-y-1 transition-transform flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
          </div>
          <span className="text-[10px] font-bold gold-text mt-1 uppercase tracking-tighter">녹음</span>
        </button>

        <button 
          onClick={playTempAudio}
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-8 bg-[#e5ddd2] rounded-t-lg border-x-2 border-t-2 border-amber-900/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-active:translate-y-1 transition-transform flex items-center justify-center">
             <svg className={`w-4 h-4 ${isPlaying ? 'fill-blue-600' : 'fill-amber-900/60'}`} viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <span className="text-[10px] font-bold gold-text mt-1 uppercase tracking-tighter">플레이</span>
        </button>

        <button 
          onClick={() => { stopRecordingAction(); stopPlayback(); }}
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-8 bg-[#e5ddd2] rounded-t-lg border-x-2 border-t-2 border-amber-900/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-active:translate-y-1 transition-transform flex items-center justify-center">
            <div className="w-3 h-3 bg-amber-900/60" />
          </div>
          <span className="text-[10px] font-bold gold-text mt-1 uppercase tracking-tighter">정지</span>
        </button>

        <button 
          onClick={handleSaveAction}
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-8 bg-[#e5ddd2] rounded-t-lg border-x-2 border-t-2 border-amber-900/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-active:translate-y-1 transition-transform flex items-center justify-center">
            <svg className="w-4 h-4 fill-amber-900/60" viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zm-5 16a3 3 0 110-6 3 3 0 010 6zm3-10H5V5h10v4z"/></svg>
          </div>
          <span className="text-[10px] font-bold gold-text mt-1 uppercase tracking-tighter">저장</span>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center group"
        >
          <div className="w-12 h-8 bg-[#e5ddd2] rounded-t-lg border-x-2 border-t-2 border-amber-900/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] group-active:translate-y-1 transition-transform flex items-center justify-center">
            <svg className="w-4 h-4 fill-amber-900/60" viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>
          </div>
          <span className="text-[10px] font-bold gold-text mt-1 uppercase tracking-tighter">불러오기</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLoadFile} 
            accept="audio/mp3,audio/*" 
            className="hidden" 
          />
        </button>
      </div>

      {/* Main Speaker Grill Area */}
      <div className="w-full max-w-sm mb-10">
        <Visualizer stream={stream} isRecording={state !== 'inactive' || isPlaying} isPaused={state === 'paused'} />
      </div>

      {/* Control Panel (Analog Look) */}
      <div className="w-full bg-[#1a1a1a] rounded-xl p-6 border-b-4 border-black shadow-2xl relative overflow-hidden">
        {/* Tuning Scale Background Lines */}
        <div className="absolute inset-x-0 top-2 h-10 flex justify-between px-4 opacity-10">
           {[...Array(20)].map((_, i) => (
             <div key={i} className={`w-0.5 bg-white ${i % 5 === 0 ? 'h-6' : 'h-3'}`} />
           ))}
        </div>

        <div className="flex flex-col items-center space-y-8 relative z-10">
          {/* Digital Timer (Tuning Window) */}
          <div className="bg-[#0a0a0a] border-2 border-[#333] px-8 py-3 rounded-lg shadow-inner">
            <span className={`dial-font text-4xl tracking-widest ${state === 'recording' ? 'text-red-500' : 'text-amber-500/80'}`}>
              {formatTime(time)}
            </span>
          </div>

          <div className="flex items-center justify-around w-full">
            {/* Analog Knob Effect (Visual Only) */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#222] to-[#444] knob-shadow border-2 border-[#111] flex items-center justify-center relative">
                <div className="w-1 h-8 bg-amber-500 rounded-full absolute top-1 rotate-[-30deg]" />
              </div>
              <span className="text-[10px] mt-2 gold-text opacity-60 font-bold uppercase">TREBLE</span>
            </div>

            {/* Central Dial (Visual Status) */}
            <div className="relative">
              <div className={`absolute -inset-2 rounded-full blur-md ${state === 'recording' ? 'bg-red-500/20 animate-pulse' : ''}`} />
              <div className={`relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#333] via-[#1a1a1a] to-[#555] knob-shadow border-4 border-[#111] flex flex-col items-center justify-center`}>
                <div className={`w-3 h-3 rounded-full mb-1 ${state === 'inactive' ? 'bg-amber-900/30' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
                <span className="text-[10px] font-black gold-text tracking-widest uppercase">
                  {state === 'recording' ? 'REC' : isPlaying ? 'PLAY' : 'ON'}
                </span>
              </div>
            </div>

            {/* Volume Knob (Visual Only) */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#222] to-[#444] knob-shadow border-2 border-[#111] flex items-center justify-center relative">
                <div className="w-1 h-8 bg-amber-500/40 rounded-full absolute top-1 rotate-[120deg]" />
              </div>
              <span className="text-[10px] mt-2 gold-text opacity-60 font-bold uppercase">BASS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recorder;
