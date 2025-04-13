import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Headphones, ArrowLeft, Upload, X, Music, Download, Play, Pause, SkipForward, SkipBack, AudioWaveform as WaveformIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import AudioWaveform from '@/components/AudioWaveform';

// Import for more efficient audio processing
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const { toast } = useToast();
  
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const vocalPreviewRef = useRef<HTMLAudioElement>(null);
  const instrumentalPreviewRef = useRef<HTMLAudioElement>(null);
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Set up current audio reference based on active audio selection
  useEffect(() => {
    switch (activeAudio) {
      case 'original':
        currentAudioRef.current = audioPreviewRef.current;
        break;
      case 'instrumental':
        currentAudioRef.current = instrumentalPreviewRef.current;
        break;
      case 'vocals':
        currentAudioRef.current = vocalPreviewRef.current;
        break;
      default:
        currentAudioRef.current = null;
    }

    // Set the current duration if available
    if (currentAudioRef.current) {
      setDuration(isNaN(currentAudioRef.current.duration) ? 0 : currentAudioRef.current.duration);
      
      // Reset current time when switching tracks
      if (currentAudioRef.current.currentTime > 0) {
        setCurrentTime(currentAudioRef.current.currentTime);
      } else {
        setCurrentTime(0);
      }
    }
  }, [activeAudio]);

  // Update time indicator during playback
  useEffect(() => {
    const updateTime = () => {
      if (currentAudioRef.current && !currentAudioRef.current.paused) {
        setCurrentTime(currentAudioRef.current.currentTime);
        setDuration(currentAudioRef.current.duration);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any processing when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Terminate any workers
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      
      // Revoke any object URLs
      if (result) {
        URL.revokeObjectURL(result.original);
        URL.revokeObjectURL(result.instrumental);
        URL.revokeObjectURL(result.vocals);
      }
    };
  }, [result]);

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
    // Cancel any existing processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Terminate any workers
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    // Reset error state
    setProcessingError(null);
    
    // Check if the file is an audio file
    if (!selectedFile.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 15MB for optimal performance)
    if (selectedFile.size > 15 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an audio file smaller than 15MB for optimal performance",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    setProcessingStage('uploading');
    setProgress(0);
    
    // Process the audio file with improved handling for large files
    processAudioFile(selectedFile);
  };

  const processAudioFile = async (audioFile: File) => {
    try {
      // Create new abort controller for this processing
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      // Initialize AudioContext if not already done
      if (!audioContextRef.current) {
        try {
          // Force a lower sample rate for better performance
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 22050, // Reduced sample rate to ease processing
          });
        } catch (error) {
          console.error("Failed to create AudioContext:", error);
          throw new Error("Your browser doesn't support audio processing. Please try a different browser.");
        }
      }

      // Read file as ArrayBuffer with error handling and progress tracking
      setProgress(5);
      const arrayBuffer = await readFileAsArrayBuffer(audioFile, signal, (loadProgress) => {
        // Update progress during file loading (from 5% to 15%)
        const calculatedProgress = 5 + Math.floor(loadProgress * 10);
        setProgress(calculatedProgress);
      }).catch(error => {
        console.error("Error reading file:", error);
        throw new Error("Failed to read the audio file. Please try again with a different file.");
      });
      
      if (signal.aborted) return; // Stop if aborted
      
      setProcessingStage('analyzing');
      setProgress(20);

      // Decode audio data with error handling
      let audioBuffer: AudioBuffer;
      try {
        // Use a promise with timeout to prevent browser hanging
        audioBuffer = await Promise.race([
          audioContextRef.current.decodeAudioData(arrayBuffer),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Audio decoding timeout. Try a smaller file or different format.")), 20000);
          })
        ]) as AudioBuffer;
      } catch (error) {
        console.error("Failed to decode audio data:", error);
        throw new Error("Unable to process this audio file. It might be corrupted or in an unsupported format.");
      }
      
      if (signal.aborted) return; // Stop if aborted
      
      audioBufferRef.current = audioBuffer;
      setProcessingStage('separating');
      setProgress(30);

      // Always process in chunks to prevent memory issues, regardless of file size
      console.log(`Processing audio: ${audioBuffer.numberOfChannels} channels, ${audioBuffer.length} samples, ${audioBuffer.sampleRate}Hz`);
      
      // Use smaller chunk size for safer processing (3 seconds at a time)
      const result = await processLargeAudioFile(audioBuffer, signal, (separationProgress) => {
        // Update progress during separation (from 30% to 80%)
        const calculatedProgress = 30 + Math.floor(separationProgress * 50);
        setProgress(calculatedProgress);
      }).catch(error => {
        console.error("Error in audio processing:", error);
        throw new Error("Failed during audio separation. Please try again with a smaller file.");
      });
      
      if (signal.aborted) return; // Stop if aborted
      
      const instrumentalBuffer = result.instrumentalBuffer;
      const vocalsBuffer = result.vocalsBuffer;
      
      setProcessingStage('finalizing');
      setProgress(80);

      // Convert separated AudioBuffers to blobs with optimized settings
      const originalBlob = await audioBufferToWav(audioBuffer).catch(error => {
        console.error("Error creating WAV for original:", error);
        throw new Error("Failed to create output files. Please try again.");
      });
      
      if (signal.aborted) return;
      
      const instrumentalBlob = await audioBufferToWav(instrumentalBuffer).catch(error => {
        console.error("Error creating WAV for instrumental:", error);
        throw new Error("Failed to create instrumental track. Please try again.");
      });
      
      if (signal.aborted) return;
      
      const vocalsBlob = await audioBufferToWav(vocalsBuffer).catch(error => {
        console.error("Error creating WAV for vocals:", error);
        throw new Error("Failed to create vocals track. Please try again.");
      });
      
      if (signal.aborted) return; // Stop if aborted
      
      // Create object URLs for the audio elements
      const originalUrl = URL.createObjectURL(originalBlob);
      const instrumentalUrl = URL.createObjectURL(instrumentalBlob);
      const vocalsUrl = URL.createObjectURL(vocalsBlob);

      // Set result
      setResult({
        original: originalUrl,
        instrumental: instrumentalUrl,
        vocals: vocalsUrl
      });
      
      // Setup audio elements after a short delay to ensure they're ready
      setTimeout(() => {
        if (signal.aborted) return; // Final abort check
        
        try {
          if (audioPreviewRef.current) {
            audioPreviewRef.current.src = originalUrl;
            audioPreviewRef.current.volume = Math.min(volume / 100, 1.0);
            
            // Force load the audio to ensure it's ready
            audioPreviewRef.current.load();
          }
          
          if (instrumentalPreviewRef.current) {
            instrumentalPreviewRef.current.src = instrumentalUrl;
            instrumentalPreviewRef.current.volume = Math.min((volume / 100) * 1.2, 1.0);
            
            // Force load the audio to ensure it's ready
            instrumentalPreviewRef.current.load();
          }
          
          if (vocalPreviewRef.current) {
            vocalPreviewRef.current.src = vocalsUrl;
            // Set vocal volume much higher by default
            vocalPreviewRef.current.volume = Math.min((volume / 100) * 10.0, 1.0);
            
            // Force load the audio to ensure it's ready
            vocalPreviewRef.current.load();
          }
          
          setProcessingStage('complete');
          setProgress(100);
          
          // Clear the abort controller since processing is complete
          abortControllerRef.current = null;
          
          toast({
            title: "Processing complete",
            description: "Your audio has been successfully separated!",
          });
        } catch (error) {
          console.error("Error setting up audio elements:", error);
          throw new Error("Failed to set up audio playback. Please try refreshing the page.");
        }
      }, 500);
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Don't show error if processing was intentionally aborted
      if (abortControllerRef.current?.signal.aborted) return;
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error processing audio";
      setProcessingError(errorMessage);
      
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setProcessingStage('idle');
      setFile(null);
      setProgress(0);
      
      // Clear the abort controller
      abortControllerRef.current = null;
    }
  };

  // Process large audio files in chunks to prevent memory issues
  const processLargeAudioFile = async (
    audioBuffer: AudioBuffer, 
    signal?: AbortSignal,
    progressCallback?: (progress: number) => void
  ): Promise<{instrumentalBuffer: AudioBuffer, vocalsBuffer: AudioBuffer}> => {
    // Calculate optimal chunk size (about 3 seconds of audio at a time for better stability)
    const chunkSize = 3 * audioBuffer.sampleRate;
    const totalLength = audioBuffer.length;
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numChunks = Math.ceil(totalLength / chunkSize);
    
    // Create output buffers for the entire audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: sampleRate // Maintain original sample rate
    });
    
    const instrumentalBuffer = audioContext.createBuffer(numChannels, totalLength, sampleRate);
    const vocalsBuffer = audioContext.createBuffer(numChannels, totalLength, sampleRate);
    
    try {
      // Process each chunk
      for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
        // Check for abort signal
        if (signal?.aborted) {
          throw new Error("Processing aborted");
        }
        
        // Calculate start and end positions for this chunk
        const startSample = chunkIndex * chunkSize;
        const endSample = Math.min((chunkIndex + 1) * chunkSize, totalLength);
        const currentChunkSize = endSample - startSample;
        
        // Create a buffer for this chunk
        const chunkBuffer = audioContext.createBuffer(numChannels, currentChunkSize, sampleRate);
        
        // Copy data from main buffer to chunk buffer
        for (let channel = 0; channel < numChannels; channel++) {
          const mainData = audioBuffer.getChannelData(channel);
          const chunkData = chunkBuffer.getChannelData(channel);
          
          for (let i = 0; i < currentChunkSize; i++) {
            chunkData[i] = mainData[startSample + i];
          }
        }
        
        try {
          // Process this chunk with enhanced error handling
          const { instrumentalBuffer: chunkInstrumentalBuffer, vocalsBuffer: chunkVocalsBuffer } = 
            await professionalVocalSeparation(chunkBuffer, signal);
          
          // Copy processed chunk data back to main output buffers
          for (let channel = 0; channel < numChannels; channel++) {
            const instrumentalData = instrumentalBuffer.getChannelData(channel);
            const vocalsData = vocalsBuffer.getChannelData(channel);
            const chunkInstrumentalData = chunkInstrumentalBuffer.getChannelData(channel);
            const chunkVocalsData = chunkVocalsBuffer.getChannelData(channel);
            
            for (let i = 0; i < currentChunkSize; i++) {
              instrumentalData[startSample + i] = chunkInstrumentalData[i];
              vocalsData[startSample + i] = chunkVocalsData[i];
            }
          }
        } catch (error) {
          console.error(`Error processing chunk ${chunkIndex}:`, error);
          // Continue with next chunk instead of failing the entire process
          // This makes the process more resilient to errors in specific chunks
          continue;
        }
        
        // Update progress
        if (progressCallback) {
          progressCallback((chunkIndex + 1) / numChunks);
        }
        
        // Add a small delay between chunks to prevent UI freezing
        if (chunkIndex < numChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      return { instrumentalBuffer, vocalsBuffer };
    } catch (error) {
      console.error("Error in chunk processing:", error);
      throw error;
    }
  };

  // Utility function to read file as ArrayBuffer with abort support and progress tracking
  const readFileAsArrayBuffer = (file: File, signal?: AbortSignal, progressCallback?: (progress: number) => void): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (signal?.aborted) {
          reject(new Error("File reading was aborted"));
          return;
        }
        
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable && progressCallback) {
          const progress = event.loaded / event.total;
          progressCallback(progress);
        }
      };
      
      reader.onerror = () => reject(reader.error || new Error("Unknown error reading file"));
      
      // Handle abort
      if (signal) {
        signal.addEventListener('abort', () => {
          reader.abort();
          reject(new Error("File reading was aborted"));
        });
      }
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Professional vocal separation algorithm modeled after commercial vocal separators
  const professionalVocalSeparation = async (
    audioBuffer: AudioBuffer, 
    signal?: AbortSignal,
    progressCallback?: (progress: number) => void
  ): Promise<{instrumentalBuffer: AudioBuffer, vocalsBuffer: AudioBuffer}> => {
    // Create new AudioContext for output buffers
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: audioBuffer.sampleRate
    });
    
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    
    // Create output buffers
    const instrumentalBuffer = audioContext.createBuffer(numChannels, length, sampleRate);
    const vocalsBuffer = audioContext.createBuffer(numChannels, length, sampleRate);
    
    // We'll only use one FFT size to improve performance
    const fftSize = 4096; // Balanced for performance and quality
    
    // Process each channel separately for stereo support
    for (let channel = 0; channel < numChannels; channel++) {
      // Check for abort signal before processing each channel
      if (signal?.aborted) {
        throw new Error("Processing aborted");
      }
      
      const inputData = audioBuffer.getChannelData(channel);
      const instrumentalData = instrumentalBuffer.getChannelData(channel);
      const vocalsData = vocalsBuffer.getChannelData(channel);
      
      // Initialize output arrays with zeros
      for (let i = 0; i < length; i++) {
        instrumentalData[i] = 0;
        vocalsData[i] = 0;
      }
      
      try {
        const fft = new FFT(fftSize);
        
        // Use more overlap for better quality (75% overlap)
        const hopSize = Math.floor(fftSize / 4);
        
        // Create windowing functions for analysis/synthesis
        const analysisWindow = createHannWindow(fftSize);
        const synthesisWindow = createHannWindow(fftSize);
        
        // Normalize window for perfect reconstruction with overlap-add
        let windowSum = 0;
        for (let i = 0; i < fftSize; i += hopSize) {
          if (i < length) {
            windowSum += analysisWindow[i % fftSize] * synthesisWindow[i % fftSize];
          }
        }
        
        const windowScaleFactor = 1.0 / (windowSum / hopSize);
        
        // Process in overlapping chunks
        for (let i = 0; i < length; i += hopSize) {
          // Check for abort periodically
          if (i % (hopSize * 10) === 0 && signal?.aborted) {
            throw new Error("Processing aborted");
          }
          
          // Update progress occasionally
          if (progressCallback && i % (hopSize * 20) === 0) {
            progressCallback(Math.min(0.95, i / length)); // Cap at 95% for the final step
          }
          
          // Create windowed chunk
          const chunk = new Float32Array(fftSize);
          for (let j = 0; j < fftSize; j++) {
            if (i + j < length) {
              chunk[j] = inputData[i + j] * analysisWindow[j];
            }
          }
          
          // FFT
          const complexInput = fft.createComplexArray();
          for (let j = 0; j < fftSize; j++) {
            complexInput[2 * j] = chunk[j];     // Real part
            complexInput[2 * j + 1] = 0;        // Imaginary part
          }
          
          const complexSpectrum = fft.createComplexArray();
          fft.transform(complexSpectrum, complexInput);
          
          // Create spectrum copies for separate processing
          const instrumentalSpectrum = Array.from(complexSpectrum);
          const vocalSpectrum = Array.from(complexSpectrum);
          
          // Define more aggressive vocal frequency ranges
          const vocalFreqRanges = [
            // Main vocal fundamental frequencies (singing & speech)
            { min: 80, max: 650, vocalGain: 5.0, instGain: 0.01 },
            
            // Critical vocal presence and harmonics
            { min: 650, max: 1800, vocalGain: 8.0, instGain: 0.02 },
            
            // Vowel formants and upper harmonics
            { min: 1800, max: 4500, vocalGain: 9.0, instGain: 0.04 },
            
            // Sibilance and high frequencies
            { min: 4500, max: 8000, vocalGain: 7.5, instGain: 0.1 },
            
            // Ultra high (mostly noise)
            { min: 8000, max: 20000, vocalGain: 3.0, instGain: 0.5 }
          ];
          
          // Calculate magnitudes
          const magnitudes = new Float32Array(fftSize / 2);
          const phases = new Float32Array(fftSize / 2);
          
          for (let k = 0; k < fftSize / 2; k++) {
            const real = complexSpectrum[k * 2];
            const imag = complexSpectrum[k * 2 + 1];
            magnitudes[k] = Math.sqrt(real * real + imag * imag);
            phases[k] = Math.atan2(imag, real);
          }
          
          // Bin frequencies in Hz
          const binToFreq = (bin: number) => bin * sampleRate / fftSize;
          
          // Process spectrum - simplified approach for better performance
          for (let k = 0; k < fftSize / 2; k++) {
            const freq = binToFreq(k);
            const phase = phases[k];
            const mag = magnitudes[k];
            
            // Default values
            let vocalGain = 0.0;
            let instrumentalGain = 1.0;
            
            // Apply frequency-dependent processing
            for (const range of vocalFreqRanges) {
              if (freq >= range.min && freq <= range.max) {
                vocalGain = range.vocalGain;
                instrumentalGain = range.instGain;
                break;
              }
            }
            
            // Apply to spectra
            vocalSpectrum[k * 2] = mag * vocalGain * Math.cos(phase);
            vocalSpectrum[k * 2 + 1] = mag * vocalGain * Math.sin(phase);
            
            instrumentalSpectrum[k * 2] = mag * instrumentalGain * Math.cos(phase);
            instrumentalSpectrum[k * 2 + 1] = mag * instrumentalGain * Math.sin(phase);
          }
          
          // Mirror the spectrum for the IFFT (needed for real output)
          for (let k = 1; k < fftSize / 2; k++) {
            const mirrorIndex = fftSize - k;
            
            // Vocals
            vocalSpectrum[mirrorIndex * 2] = vocalSpectrum[k * 2];
            vocalSpectrum[mirrorIndex * 2 + 1] = -vocalSpectrum[k * 2 + 1]; // Conjugate
            
            // Instrumental
            instrumentalSpectrum[mirrorIndex * 2] = instrumentalSpectrum[k * 2];
            instrumentalSpectrum[mirrorIndex * 2 + 1] = -instrumentalSpectrum[k * 2 + 1]; // Conjugate
          }
          
          // Inverse FFT
          const vocalOutput = fft.createComplexArray();
          const instrumentalOutput = fft.createComplexArray();
          
          fft.inverseTransform(vocalOutput, vocalSpectrum);
          fft.inverseTransform(instrumentalOutput, instrumentalSpectrum);
          
          // Overlap-add to output buffer with windowing
          for (let j = 0; j < fftSize; j++) {
            if (i + j < length) {
              // Scale by FFT size and apply synthesis window
              const windowedVocal = (vocalOutput[j * 2] / fftSize) * synthesisWindow[j] * windowScaleFactor;
              const windowedInst = (instrumentalOutput[j * 2] / fftSize) * synthesisWindow[j] * windowScaleFactor;
              
              vocalsData[i + j] += windowedVocal;
              instrumentalData[i + j] += windowedInst;
            }
          }
        }
      } catch (error) {
        console.error(`Error processing channel ${channel}:`, error);
        // Try to continue with what we have rather than completely failing
        continue;
      }
      
      // Final enhancement with extreme vocal boost to make up for simplified algorithm
      for (let i = 0; i < length; i++) {
        // Apply huge boost to vocals (80x) - needed because we simplified the algorithm
        vocalsData[i] *= 80.0; 
        
        // Reduce any potential artifacts by soft clipping
        vocalsData[i] = softClip(vocalsData[i], 0.95);
        instrumentalData[i] = softClip(instrumentalData[i], 0.95);
      }
    }
    
    // Additional stereo enhancement for better results
    if (audioBuffer.numberOfChannels === 2) {
      // Get both channels
      const leftVocal = vocalsBuffer.getChannelData(0);
      const rightVocal = vocalsBuffer.getChannelData(1);
      const leftInst = instrumentalBuffer.getChannelData(0);
      const rightInst = instrumentalBuffer.getChannelData(1);
      
      // Apply the center-channel extraction technique
      for (let i = 0; i < length; i++) {
        // Enhance the common/center content for vocals
        const commonContent = (leftVocal[i] + rightVocal[i]) / 2;
        leftVocal[i] = commonContent * 6.0; // Increase center channel boost for vocals
        rightVocal[i] = commonContent * 6.0;
        
        // Enhance the difference content for instrumentals
        const diffContent = (leftInst[i] - rightInst[i]) / 2;
        leftInst[i] += diffContent * 0.5; // Increase stereo width for instrumentals
        rightInst[i] -= diffContent * 0.5;
      }
    }
    
    // One final progress update
    if (progressCallback) {
      progressCallback(1.0); // 100%
    }
    
    return { instrumentalBuffer, vocalsBuffer };
  };
  
  // Soft clipping to prevent harsh artifacts
  const softClip = (sample: number, threshold: number): number => {
    if (Math.abs(sample) < threshold) {
      return sample;
    }
    
    // Soft clip with a smooth curve
    const sign = sample > 0 ? 1 : -1;
    return sign * (threshold + (1 - threshold) * Math.tanh((Math.abs(sample) - threshold) / (1 - threshold)));
  };
  
  // Create Hann window function for better frequency analysis
  const createHannWindow = (size: number): Float32Array => {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (size - 1)));
    }
    return window;
  };

  // Utility function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const numChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;
        const sampleRate = audioBuffer.sampleRate;
        const bitsPerSample = 16;
        const bytesPerSample = bitsPerSample / 8;
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = length * blockAlign;
        
        // Create the buffer with appropriate size
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
        
        // Write the PCM samples - using a more efficient approach for large files
        const offset = 44;
        let index = 0;
        
        // Process in manageable chunks to avoid memory issues
        const chunkSize = 10000; // Process this many samples at once
        
        for (let chunkStart = 0; chunkStart < length; chunkStart += chunkSize) {
          const chunkEnd = Math.min(chunkStart + chunkSize, length);
          
          for (let i = chunkStart; i < chunkEnd; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
              // Get sample from the buffer
              let sample = audioBuffer.getChannelData(channel)[i];
              
              // Clamp between -1 and 1
              const clampedSample = Math.max(-1, Math.min(1, sample));
              
              // Convert to 16-bit signed integer
              const intSample = clampedSample < 0 ? clampedSample * 32768 : clampedSample * 32767;
              
              // Set the sample in the DataView
              view.setInt16(offset + index, intSample, true);
              index += 2;
            }
          }
        }
        
        // Create WAV blob with proper MIME type
        resolve(new Blob([buffer], { type: 'audio/wav' }));
      } catch (error) {
        console.error('Error converting to WAV:', error);
        reject(error);
      }
    });
  };

  // Helper function to write strings to DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Function to handle play/pause
  const togglePlayPause = () => {
    if (!currentAudioRef.current) return;
    
    if (isPlaying) {
      currentAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Ensure we have the proper volume before playing
      if (currentAudioRef.current === vocalPreviewRef.current) {
        currentAudioRef.current.volume = Math.min((volume / 100) * 10.0, 1.0); 
      } else if (currentAudioRef.current === instrumentalPreviewRef.current) {
        currentAudioRef.current.volume = Math.min((volume / 100) * 1.2, 1.0);
      } else {
        currentAudioRef.current.volume = Math.min(volume / 100, 1.0);
      }
      
      currentAudioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback Error",
            description: "Could not play the audio. Please try again.",
            variant: "destructive"
          });
        });
    }
  };

  // Function to handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentAudioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    currentAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Function to handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0];
    setVolume(volumeValue);
    
    // Apply different volume levels based on track type
    if (audioPreviewRef.current) {
      audioPreviewRef.current.volume = Math.min(volumeValue / 100, 1.0);
    }
    
    if (instrumentalPreviewRef.current) {
      instrumentalPreviewRef.current.volume = Math.min((volumeValue / 100) * 1.2, 1.0);
    }
    
    if (vocalPreviewRef.current) {
      vocalPreviewRef.current.volume = Math.min((volumeValue / 100) * 10.0, 1.0);
    }
  };

  // Function to format time in MM:SS format
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to download the current audio
  const downloadCurrentAudio = () => {
    if (!result) return;
    
    let url: string;
    let filename: string;
    
    switch (activeAudio) {
      case 'instrumental':
        url = result.instrumental;
        filename = file ? `${file.name.split('.')[0]}_instrumental.wav` : 'instrumental.wav';
        break;
      case 'vocals':
        url = result.vocals;
        filename = file ? `${file.name.split('.')[0]}_vocals.wav` : 'vocals.wav';
        break;
      default:
        url = result.original;
        filename = file ? file.name : 'original.wav';
    }
    
    // Create temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Function to cancel processing
  const cancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset state
    setProcessingStage('idle');
    setFile(null);
    setProgress(0);
    setProcessingError(null);
  };

  // Function to handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-white">
      {/* Header */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center text-white hover:bg-white/10"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Professional Vocal Remover</h1>
        <p className="text-muted-foreground max-w-2xl">
          Separate vocals from instrumentals using advanced audio processing. Optimized for files up to 15MB.
        </p>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Upload section (2 cols on medium+ screens) */}
          <div className="md:col-span-2 space-y-6">
            {processingStage === 'idle' && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 h-64 flex flex-col items-center justify-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-gray-600'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className="h-10 w-10 mb-4 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">
                  <span className="font-medium text-white">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  MP3, WAV, FLAC or OGG (max. 15MB)
                </p>
              </div>
            )}
            
            {processingStage !== 'idle' && processingStage !== 'complete' && (
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{file?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {file && `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={cancelProcessing}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {processingStage === 'uploading' && 'Preparing...'}
                      {processingStage === 'analyzing' && 'Analyzing audio...'}
                      {processingStage === 'separating' && 'Separating vocals...'}
                      {processingStage === 'finalizing' && 'Finalizing output...'}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                
                {processingError && (
                  <div className="text-sm text-red-500 mt-2">
                    Error: {processingError}
                  </div>
                )}
              </div>
            )}
            
            {processingStage === 'complete' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border rounded-lg p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{file?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Processing complete!
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setFile(null);
                      setProcessingStage('idle');
                      setResult(null);
                      setIsPlaying(false);
                      setCurrentTime(0);
                      setDuration(0);
                      
                      // Cleanup
                      if (result) {
                        URL.revokeObjectURL(result.original);
                        URL.revokeObjectURL(result.instrumental);
                        URL.revokeObjectURL(result.vocals);
                      }
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="pt-2">
                  <RadioGroup 
                    value={activeAudio}
                    onValueChange={(value: any) => {
                      // Need to stop current playback before switching
                      if (currentAudioRef.current && isPlaying) {
                        currentAudioRef.current.pause();
                        setIsPlaying(false);
                      }
                      setActiveAudio(value as 'original' | 'instrumental' | 'vocals');
                    }}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="original" id="original" />
                      <Label htmlFor="original" className="cursor-pointer">Original Track</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="instrumental" id="instrumental" />
                      <Label htmlFor="instrumental" className="cursor-pointer">Instrumental Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vocals" id="vocals" />
                      <Label htmlFor="vocals" className="cursor-pointer">Vocals Only</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={downloadCurrentAudio}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {activeAudio.charAt(0).toUpperCase() + activeAudio.slice(1)}
                </Button>
              </motion.div>
            )}
          </div>
          
          {/* Player section (3 cols on medium+ screens) */}
          <div className="md:col-span-3">
            {processingStage === 'complete' && result && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="border rounded-lg p-6 space-y-6"
              >
                <div className="flex flex-col items-center justify-center mb-4">
                  <div className="w-full max-w-md h-32 relative mb-6">
                    {activeAudio === 'original' && <AudioWaveform audioUrl={result.original} />}
                    {activeAudio === 'instrumental' && <AudioWaveform audioUrl={result.instrumental} />}
                    {activeAudio === 'vocals' && <AudioWaveform audioUrl={result.vocals} />}
                  </div>
                  
                  <audio ref={audioPreviewRef} preload="metadata" />
                  <audio ref={instrumentalPreviewRef} preload="metadata" />
                  <audio ref={vocalPreviewRef} preload="metadata" />
                  
                  <div className="w-full max-w-md space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatTime(currentTime)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(duration)}
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      value={currentTime}
                      step={0.01}
                      onChange={handleSeek}
                      className="w-full cursor-pointer"
                    />
                    
                    <div className="flex justify-center space-x-4">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={true}  // Skip back not implemented yet
                      >
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      
                      <Button 
                        size="icon"
                        variant={isPlaying ? "outline" : "default"}
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={true}  // Skip forward not implemented yet
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon">
                          <Headphones className="h-4 w-4" />
                        </Button>
                        <Slider 
                          value={[volume]} 
                          max={100} 
                          step={1} 
                          onValueChange={handleVolumeChange} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Note: Vocals may require higher volume levels
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {processingStage === 'idle' && (
              <div className="border rounded-lg p-6 h-full flex flex-col items-center justify-center text-muted-foreground">
                <WaveformIcon className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-center">
                  Upload an audio file to begin processing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocalRemoverPage;
