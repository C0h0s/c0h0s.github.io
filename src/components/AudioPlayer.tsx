
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import AudioWaveform from './AudioWaveform';

interface AudioPlayerProps {
  audioUrl: string;
  label: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  label,
  onPlayStateChange 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [muted, setMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Setup audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (onPlayStateChange) onPlayStateChange(false);
      });
      
      audio.volume = volume / 100;
      audioRef.current = audio;
    } else {
      // Update source if audioUrl changes
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setCurrentTime(0);
        
        if (isPlaying) {
          setIsPlaying(false);
          if (onPlayStateChange) onPlayStateChange(false);
        }
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  // Update time indicator during playback
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current && !audioRef.current.paused) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onPlayStateChange) onPlayStateChange(false);
    } else {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (onPlayStateChange) onPlayStateChange(true);
          })
          .catch(error => {
            console.error("Error playing audio:", error);
          });
      }
    }
  };

  // Handle seek
  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Format time in MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Toggle mute
  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">{label}</h4>
        <span className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      
      <div className="relative">
        <AudioWaveform
          audioUrl={audioUrl}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          color="#8b5cf6"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant={isPlaying ? "secondary" : "default"}
          className="w-24"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={toggleMute}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[muted ? 0 : volume]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={(value) => setVolume(value[0])}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
