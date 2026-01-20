
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isPaused?: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ stream, isRecording, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (!stream || !isRecording || isPaused) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64; 
    source.connect(analyser);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Draw amber glow bars from center
      const barWidth = 6;
      const gap = 4;
      
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        const barHeight = (value / 255) * height * 0.7;
        
        const opacity = (value / 255) * 0.8 + 0.2;
        ctx.fillStyle = `rgba(197, 160, 89, ${opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#c5a059';

        // Draw symmetrical bars
        const xPos = centerX + (i * (barWidth + gap));
        const xNeg = centerX - (i * (barWidth + gap)) - barWidth;
        
        ctx.fillRect(xPos, centerY - barHeight / 2, barWidth, barHeight);
        ctx.fillRect(xNeg, centerY - barHeight / 2, barWidth, barHeight);
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioContext.close();
    };
  }, [stream, isRecording, isPaused]);

  return (
    <div className="relative w-full h-32 flex items-center justify-center speaker-mesh rounded-xl border-2 border-[#3a3a3a] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        width={400} 
        height={128}
      />
    </div>
  );
};

export default Visualizer;
