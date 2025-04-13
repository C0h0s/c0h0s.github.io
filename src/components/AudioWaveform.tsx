
import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  color?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  audioBuffer, 
  currentTime, 
  duration,
  onSeek,
  color = '#8b5cf6' // Default purple color
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draw waveform
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get audio data
    const channelData = audioBuffer.getChannelData(0); // Get left channel
    const step = Math.ceil(channelData.length / canvas.width);
    const amp = canvas.height / 2;

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    ctx.beginPath();
    ctx.moveTo(0, amp);
    
    // Draw the actual waveform by sampling the audio data
    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j] || 0;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      // Draw line from min to max
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
      ctx.stroke();
    }

    // Draw progress
    const progress = duration > 0 ? (currentTime / duration) * canvas.width : 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, progress, canvas.height);

  }, [audioBuffer, currentTime, duration, color]);

  // Handle click to seek
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || !canvasRef.current || duration <= 0) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = (x / rect.width) * duration;
    
    onSeek(seekTime);
  };

  return (
    <div ref={containerRef} className="relative w-full h-24 bg-black/30 rounded-lg overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        width={1000}
        height={100}
        onClick={handleClick}
      />
    </div>
  );
};

export default AudioWaveform;
