
import React, { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  audioBuffer?: AudioBuffer | null;
  audioUrl?: string;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  color?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  audioBuffer, 
  audioUrl,
  currentTime = 0, 
  duration = 0,
  onSeek,
  color = '#8b5cf6' // Default purple color
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localAudioBuffer, setLocalAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Create AudioContext and load audio from URL if provided
  useEffect(() => {
    if (audioUrl && !audioBuffer && !localAudioBuffer) {
      const loadAudio = async () => {
        try {
          // Create AudioContext if it doesn't exist
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }

          // Fetch audio data
          const response = await fetch(audioUrl);
          const arrayBuffer = await response.arrayBuffer();
          
          // Decode audio data
          const decodedData = await audioContextRef.current.decodeAudioData(arrayBuffer);
          setLocalAudioBuffer(decodedData);
        } catch (error) {
          console.error("Error loading audio from URL:", error);
        }
      };

      loadAudio();
    }

    // Cleanup
    return () => {
      if (audioContextRef.current) {
        // Don't close the AudioContext as it might be used elsewhere
        // Just clean up the reference
        audioContextRef.current = null;
      }
    };
  }, [audioUrl, audioBuffer]);

  // Use the provided audioBuffer or the locally loaded one
  const effectiveAudioBuffer = audioBuffer || localAudioBuffer;

  // Draw waveform
  useEffect(() => {
    if (!effectiveAudioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get audio data
    const channelData = effectiveAudioBuffer.getChannelData(0); // Get left channel
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

  }, [effectiveAudioBuffer, currentTime, duration, color]);

  // Handle click to seek
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current || !canvasRef.current || !onSeek || duration <= 0) return;
    
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
        onClick={onSeek ? handleClick : undefined}
      />
    </div>
  );
};

export default AudioWaveform;
