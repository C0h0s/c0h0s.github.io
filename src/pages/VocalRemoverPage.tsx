
import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Headphones, ArrowLeft, Upload, X, Music, Download, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// FFT.js for audio frequency analysis
import FFT from 'fft.js';

type ProcessingStage = 'idle' | 'uploading' | 'analyzing' | 'separating' | 'finalizing' | 'complete';

interface AudioResult {
  instrumental: string;
  vocals: string;
  original: string;
}

interface AudioPlayer {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const VocalRemoverPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AudioResult | null>(null);
  const [activeAudio, setActiveAudio] = useState<'original' | 'instrumental' | 'vocals'>('original');
  const [volume, setVolume] = useState(100);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const { toast } = useToast();
  
  const originalPlayerRef = useRef<AudioPlayer>({isPlaying: false, currentTime: 0, duration: 0});
  const instrumentalPlayerRef = useRef<AudioPlayer>({isPlaying: false, currentTime: 0, duration: 0});
  const vocalsPlayerRef = useRef<AudioPlayer>({isPlaying: false, currentTime: 0, duration: 0});
  
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const vocalPreviewRef = useRef<HTMLAudioElement>(null);
  const instrumentalPreviewRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle drag and drop functionality
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelected(droppedFile);
    }
  }, []);

  const handleFileSelected = (selectedFile: File) => {
    // Check if the file is an audio file
    if (!selectedFile.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an audio file smaller than 15MB",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    setProcessingStage('uploading');
    setProgress(0);
    
    // Process the audio file
    processAudioFile(selectedFile);
  };

  const processAudioFile = async (audioFile: File) => {
    try {
      // Initialize AudioContext if not already done
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Read file as ArrayBuffer
      const arrayBuffer = await readFileAsArrayBuffer(audioFile);
      setProcessingStage('analyzing');
      setProgress(20);

      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      setProcessingStage('separating');
      setProgress(50);

      // Perform vocal separation
      const { instrumentalBuffer, vocalsBuffer } = await separateVocals(audioBuffer);
      
      setProcessingStage('finalizing');
      setProgress(80);

      // Convert separated AudioBuffers to blobs
      const originalBlob = await audioBufferToWav(audioBuffer);
      const instrumentalBlob = await audioBufferToWav(instrumentalBuffer);
      const vocalsBlob = await audioBufferToWav(vocalsBuffer);
      
      // Create object URLs for the audio elements
      const originalUrl = URL.createObjectURL(originalBlob);
      const instrumentalUrl = URL.createObjectURL(instrumentalBlob);
      const vocalsUrl = URL.createObjectURL(vocalsBlob);

      // Set up audio elements
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = originalUrl;
      }
      if (instrumentalPreviewRef.current) {
        instrumentalPreviewRef.current.src = instrumentalUrl;
      }
      if (vocalPreviewRef.current) {
        vocalPreviewRef.current.src = vocalsUrl;
      }

      // Set result
      setResult({
        original: originalUrl,
        instrumental: instrumentalUrl,
        vocals: vocalsUrl
      });
      
      setProcessingStage('complete');
      setProgress(100);
      
      toast({
        title: "Processing complete",
        description: "Your audio has been successfully separated!",
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: "There was an error processing your audio file.",
        variant: "destructive"
      });
      setProcessingStage('idle');
    }
  };

  // Utility function to read file as ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Function to separate vocals from audio
  const separateVocals = async (audioBuffer: AudioBuffer): Promise<{instrumentalBuffer: AudioBuffer, vocalsBuffer: AudioBuffer}> => {
    // Basic vocal separation using frequency filtering
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    
    // Create new AudioBuffers for the separated audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const instrumentalBuffer = audioContext.createBuffer(numChannels, length, sampleRate);
    const vocalsBuffer = audioContext.createBuffer(numChannels, length, sampleRate);
    
    // Process each channel
    for (let channel = 0; channel < numChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const instrumentalData = instrumentalBuffer.getChannelData(channel);
      const vocalsData = vocalsBuffer.getChannelData(channel);
      
      // FFT params
      const fftSize = 2048;
      const fft = new FFT(fftSize);
      const halfSize = fftSize / 2;
      
      // Process in chunks
      for (let i = 0; i < length; i += fftSize) {
        // Create chunk with zero padding if needed
        const chunk = new Float32Array(fftSize);
        for (let j = 0; j < fftSize; j++) {
          chunk[j] = i + j < length ? inputData[i + j] : 0;
        }
        
        // Apply window function (Hann)
        for (let j = 0; j < fftSize; j++) {
          chunk[j] *= 0.5 * (1 - Math.cos(2 * Math.PI * j / fftSize));
        }
        
        // Prepare for FFT
        const complexInput = new Array(fftSize * 2);
        for (let j = 0; j < fftSize; j++) {
          complexInput[2 * j] = chunk[j];
          complexInput[2 * j + 1] = 0;
        }
        
        // Perform FFT
        const complexOutput = fft.createComplexArray();
        fft.transform(complexOutput, complexInput);
        
        // Apply vocal/instrumental separation in frequency domain
        // Human voice is typically in 80-255 Hz range (fundamental)
        const vocalRange = { min: Math.floor(80 / sampleRate * fftSize), max: Math.ceil(255 / sampleRate * fftSize) };
        
        // Copy complexOutput to separate arrays for manipulation
        const instrumentalSpectrum = [...complexOutput];
        const vocalSpectrum = [...complexOutput];
        
        // Filter spectrums
        for (let j = 0; j < fftSize; j++) {
          const idx = j * 2;
          
          // Suppress vocal frequency range in instrumental
          if (j > vocalRange.min && j < vocalRange.max) {
            instrumentalSpectrum[idx] *= 0.2;     // Real part
            instrumentalSpectrum[idx + 1] *= 0.2; // Imaginary part
          } else {
            vocalSpectrum[idx] *= 0.3;      // Real part
            vocalSpectrum[idx + 1] *= 0.3;  // Imaginary part
          }
        }
        
        // Inverse FFT for instrumental
        const instrumentalOutput = fft.createComplexArray();
        fft.inverseTransform(instrumentalOutput, instrumentalSpectrum);
        
        // Inverse FFT for vocals
        const vocalOutput = fft.createComplexArray();
        fft.inverseTransform(vocalOutput, vocalSpectrum);
        
        // Copy result back to output buffers with overlap-add
        for (let j = 0; j < fftSize; j++) {
          if (i + j < length) {
            instrumentalData[i + j] = instrumentalOutput[j * 2] / fftSize;
            vocalsData[i + j] = vocalOutput[j * 2] / fftSize;
          }
        }
      }
    }
    
    return { instrumentalBuffer, vocalsBuffer };
  };

  // Utility function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      const bitsPerSample = 16;
      const bytesPerSample = bitsPerSample / 8;
      const blockAlign = numChannels * bytesPerSample;
      const byteRate = sampleRate * blockAlign;
      const dataSize = length * blockAlign;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);
      
      // RIFF identifier
      writeString(view, 0, 'RIFF');
      // File length
      view.setUint32(4, 36 + dataSize, true);
      // RIFF type
      writeString(view, 8, 'WAVE');
      // Format chunk identifier
      writeString(view, 12, 'fmt ');
      // Format chunk length
      view.setUint32(16, 16, true);
      // Sample format (1 is PCM)
      view.setUint16(20, 1, true);
      // Channel count
      view.setUint16(22, numChannels, true);
      // Sample rate
      view.setUint32(24, sampleRate, true);
      // Byte rate (sample rate * block align)
      view.setUint32(28, byteRate, true);
      // Block align (channel count * bytes per sample)
      view.setUint16(32, blockAlign, true);
      // Bits per sample
      view.setUint16(34, bitsPerSample, true);
      // Data chunk identifier
      writeString(view, 36, 'data');
      // Data chunk length
      view.setUint32(40, dataSize, true);
      
      // Write the PCM samples
      const offset = 44;
      const volume = 1;
      let index = 0;
      
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          const sample = audioBuffer.getChannelData(channel)[i] * volume;
          // Clamp between -1 and 1
          const clampedSample = Math.max(-1, Math.min(1, sample));
          // Convert to 16-bit signed integer
          const intSample = clampedSample < 0 ? clampedSample * 32768 : clampedSample * 32767;
          view.setInt16(offset + index, intSample, true);
          index += 2;
        }
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' });
      resolve(blob);
    });
  };
  
  // Helper function to write a string to a DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setProcessingStage('idle');
    setProgress(0);
    setResult(null);
    setActiveAudio('original');
    setIsPlaying(false);
    
    // Reset audio previews
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.src = '';
    }
    if (instrumentalPreviewRef.current) {
      instrumentalPreviewRef.current.pause();
      instrumentalPreviewRef.current.src = '';
    }
    if (vocalPreviewRef.current) {
      vocalPreviewRef.current.pause();
      vocalPreviewRef.current.src = '';
    }
  };
  
  const handleDownload = (type: 'original' | 'instrumental' | 'vocals') => {
    if (!result) return;
    
    const urls = {
      original: result.original,
      instrumental: result.instrumental,
      vocals: result.vocals
    };
    
    const fileName = file?.name.replace(/\.[^/.]+$/, "") || "audio";
    
    const link = document.createElement('a');
    link.href = urls[type];
    link.download = `${fileName}_${type}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `Your ${type} track is downloading.`
    });
  };

  const togglePlayPause = () => {
    if (!result) return;
    
    let audioElement: HTMLAudioElement | null = null;
    
    switch (activeAudio) {
      case 'original':
        audioElement = audioPreviewRef.current;
        break;
      case 'instrumental':
        audioElement = instrumentalPreviewRef.current;
        break;
      case 'vocals':
        audioElement = vocalPreviewRef.current;
        break;
    }
    
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      // Pause all audio elements first
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      if (instrumentalPreviewRef.current) instrumentalPreviewRef.current.pause();
      if (vocalPreviewRef.current) vocalPreviewRef.current.pause();
      
      // Play the selected one
      audioElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleAudioTypeChange = (value: 'original' | 'instrumental' | 'vocals') => {
    if (isPlaying) {
      // Pause all audio elements
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      if (instrumentalPreviewRef.current) instrumentalPreviewRef.current.pause();
      if (vocalPreviewRef.current) vocalPreviewRef.current.pause();
      
      // Set the new active audio and play it
      setActiveAudio(value);
      
      let audioElement: HTMLAudioElement | null = null;
      
      switch (value) {
        case 'original':
          audioElement = audioPreviewRef.current;
          break;
        case 'instrumental':
          audioElement = instrumentalPreviewRef.current;
          break;
        case 'vocals':
          audioElement = vocalPreviewRef.current;
          break;
      }
      
      if (audioElement) {
        audioElement.play();
      }
    } else {
      setActiveAudio(value);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    
    // Update volume for all audio elements
    if (audioPreviewRef.current) audioPreviewRef.current.volume = volumeValue / 100;
    if (instrumentalPreviewRef.current) instrumentalPreviewRef.current.volume = volumeValue / 100;
    if (vocalPreviewRef.current) vocalPreviewRef.current.volume = volumeValue / 100;
  };

  const getStageDescription = () => {
    switch (processingStage) {
      case 'uploading':
        return 'Uploading your audio file...';
      case 'analyzing':
        return 'Analyzing audio frequencies...';
      case 'separating':
        return 'Isolating vocals from the instrumental...';
      case 'finalizing':
        return 'Optimizing separated audio tracks...';
      case 'complete':
        return 'Processing complete!';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="w-full bg-gaming-dark p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-4 text-white"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-gaming-purple flex items-center justify-center mr-3">
                <Headphones size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">Vocal Remover</h1>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto py-8 px-4">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Audio Vocal Remover Tool</h2>
            <p className="text-muted-foreground">
              Separate vocals from instrumentals in your audio files with ease
            </p>
          </div>

          {/* File Drop Area */}
          {!file && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-gaming-purple bg-gaming-purple/10'
                  : 'border-border hover:border-gaming-purple/50 hover:bg-secondary/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="audio/*"
                onChange={handleFileInputChange}
              />
              <Upload size={48} className="mx-auto mb-4 text-gaming-purple" />
              <h3 className="text-lg font-medium text-white mb-2">
                Drag and drop your audio file here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports MP3, WAV, and other audio formats (max 15MB)
              </p>
              <Button variant="outline" className="bg-gaming-dark border-gaming-purple/50 text-white">
                Browse Files
              </Button>
            </div>
          )}

          {/* File Preview and Processing */}
          {file && (
            <motion.div 
              className="bg-secondary/20 rounded-xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* File Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gaming-purple/20 rounded-lg flex items-center justify-center">
                    <Music size={20} className="text-gaming-purple" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-white">{file.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-white"
                  onClick={handleRemoveFile}
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Processing Progress */}
              {processingStage !== 'complete' && (
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Processing: {getStageDescription()}</p>
                    <p className="text-sm text-white">{Math.round(progress)}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Audio Player and Results */}
              {processingStage === 'complete' && result && (
                <div className="space-y-6">
                  {/* Hidden audio elements */}
                  <audio ref={audioPreviewRef} src={result.original} onEnded={() => setIsPlaying(false)} />
                  <audio ref={instrumentalPreviewRef} src={result.instrumental} onEnded={() => setIsPlaying(false)} />
                  <audio ref={vocalPreviewRef} src={result.vocals} onEnded={() => setIsPlaying(false)} />
                  
                  {/* Audio Player Controls */}
                  <div className="bg-black/30 rounded-lg p-6">
                    <div className="flex justify-center mb-5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full bg-gaming-purple text-white border-none hover:bg-gaming-purple/80"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </Button>
                    </div>
                    
                    {/* Audio Type Selection */}
                    <div className="mb-5">
                      <RadioGroup 
                        value={activeAudio}
                        onValueChange={(value) => handleAudioTypeChange(value as 'original' | 'instrumental' | 'vocals')}
                        className="flex justify-center space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="original" id="original" />
                          <Label htmlFor="original" className="text-white cursor-pointer">Original</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="instrumental" id="instrumental" />
                          <Label htmlFor="instrumental" className="text-white cursor-pointer">Instrumental</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="vocals" id="vocals" />
                          <Label htmlFor="vocals" className="text-white cursor-pointer">Vocals</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Volume Control */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-white">Volume</span>
                      <Slider
                        className="flex-1"
                        value={[volume]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                      />
                      <span className="text-sm text-white w-8 text-right">{volume}%</span>
                    </div>
                  </div>
                  
                  {/* Download Options */}
                  <div className="bg-black/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-3">Download Options</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        className="bg-gaming-dark/50 hover:bg-gaming-dark"
                        onClick={() => handleDownload('original')}
                      >
                        <Download size={16} className="mr-2" />
                        Original
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-gaming-dark/50 hover:bg-gaming-dark"
                        onClick={() => handleDownload('instrumental')}
                      >
                        <Download size={16} className="mr-2" />
                        Instrumental
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-gaming-dark/50 hover:bg-gaming-dark"
                        onClick={() => handleDownload('vocals')}
                      >
                        <Download size={16} className="mr-2" />
                        Vocals
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Instructions */}
          <motion.div 
            className="mt-10 bg-secondary/10 rounded-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-lg font-medium text-white mb-3">How to Use This Tool</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Upload an audio file by dragging and dropping or clicking the upload area</li>
              <li>Wait for the processing to complete (this usually takes a few seconds)</li>
              <li>Use the player controls to switch between original audio, instrumental, and vocals</li>
              <li>Download any of the separated audio tracks using the download buttons</li>
            </ol>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Note: The vocal separation technology uses frequency analysis to separate audio and works best with clearly recorded music.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VocalRemoverPage;
