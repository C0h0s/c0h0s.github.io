
import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Headphones, ArrowLeft, Upload, X, Download, AudioWaveform as WaveformIcon, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AudioPlayer from '@/components/AudioPlayer';
import { 
  loadAudioFromFile, 
  processVocalIsolation,
  processAdvancedInstrumentalExtraction,
  processAdvancedVocalExtraction,
  audioBufferToWav
} from '@/utils/audioProcessing';

type ProcessingStage = 'idle' | 'uploading' | 'processing' | 'complete';

interface AudioResult {
  instrumental: string;
  vocals: string;
  acappella: string;
  original: string;
}

const VocalRemoverPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AudioResult | null>(null);
  const [activeAudio, setActiveAudio] = useState<'original' | 'instrumental' | 'vocals' | 'acappella'>('original');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  
  // Current active player state for UI
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
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
    
    // Check if the file is an audio file
    if (!selectedFile.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 10MB for better performance)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an audio file smaller than 10MB for optimal processing",
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

  // Advanced audio processing with enhanced separation techniques
  const processAudioFile = async (audioFile: File) => {
    try {
      // Create new abort controller for this processing
      abortControllerRef.current = new AbortController();
      
      // Start processing
      setProcessingStage('uploading');
      setProgress(10);
      
      // Read file as AudioBuffer
      const originalUrl = URL.createObjectURL(audioFile);
      setProgress(15);
      
      // Decode audio data
      const audioBuffer = await loadAudioFromFile(audioFile);
      setProgress(25);
      
      // Move to processing stage with detailed progress updates
      setProcessingStage('processing');
      toast({
        title: "Processing started",
        description: "Applying standard vocal isolation techniques...",
      });
      
      // Standard vocal isolation (balanced approach)
      setProgress(35);
      const vocalBuffer = await processVocalIsolation(audioBuffer);
      setProgress(50);

      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      // Notify user about enhanced a cappella processing
      toast({
        title: "Creating pure vocals",
        description: "Applying advanced a cappella extraction algorithm...",
      });

      // Advanced a cappella extraction (focused purely on vocals)
      const acappellaBuffer = await processAdvancedVocalExtraction(audioBuffer);
      setProgress(70);

      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      toast({
        title: "Final processing step",
        description: "Now separating instrumental tracks...",
      });
      
      // Process instrumental with enhanced phase cancellation
      const instrumentalBuffer = await processAdvancedInstrumentalExtraction(audioBuffer);
      setProgress(85);
      
      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      // Convert AudioBuffers to WAV blobs
      const vocalBlob = audioBufferToWav(vocalBuffer);
      const acappellaBlob = audioBufferToWav(acappellaBuffer);
      const instrumentalBlob = audioBufferToWav(instrumentalBuffer);
      
      // Create object URLs for the audio elements
      const vocalsUrl = URL.createObjectURL(vocalBlob);
      const acappellaUrl = URL.createObjectURL(acappellaBlob);
      const instrumentalUrl = URL.createObjectURL(instrumentalBlob);
      
      // Set result
      setResult({
        original: originalUrl,
        instrumental: instrumentalUrl,
        vocals: vocalsUrl,
        acappella: acappellaUrl
      });
      
      // Complete processing
      setProgress(100);
      setProcessingStage('complete');
      
      toast({
        title: "Processing complete",
        description: "Your audio has been separated with advanced techniques - try the pure vocals option!",
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      toast({
        title: "Processing Error",
        description: "Failed to process the audio file. Please try again with a different file.",
        variant: "destructive"
      });
      
      setProcessingStage('idle');
      setFile(null);
      setProgress(0);
    }
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
      case 'acappella':
        url = result.acappella;
        filename = file ? `${file.name.split('.')[0]}_acappella.wav` : 'acappella.wav';
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

  // Handle play state changes
  const handlePlayStateChange = (trackType: string, isPlaying: boolean) => {
    if (isPlaying) {
      setCurrentlyPlaying(trackType);
    } else if (currentlyPlaying === trackType) {
      setCurrentlyPlaying(null);
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Advanced Vocal Remover</h1>
        <p className="text-muted-foreground max-w-2xl">
          Separate vocals from instrumentals using advanced audio processing algorithms. Now includes pure vocal extraction mode for a cappella tracks.
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
                  MP3, WAV, FLAC or OGG (max. 10MB)
                </p>
              </div>
            )}
            
            {(processingStage === 'uploading' || processingStage === 'processing') && (
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
                      {processingStage === 'uploading' && 'Loading audio...'}
                      {processingStage === 'processing' && 'Processing audio with AI...'}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
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
                      setCurrentlyPlaying(null);
                      
                      // Cleanup
                      if (result) {
                        URL.revokeObjectURL(result.original);
                        URL.revokeObjectURL(result.instrumental);
                        URL.revokeObjectURL(result.vocals);
                        URL.revokeObjectURL(result.acappella);
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
                      setActiveAudio(value as 'original' | 'instrumental' | 'vocals' | 'acappella');
                      setCurrentlyPlaying(null); // Stop playing when switching tracks
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
                      <Label htmlFor="vocals" className="cursor-pointer">Standard Vocals</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="acappella" id="acappella" />
                      <Label htmlFor="acappella" className="cursor-pointer flex items-center">
                        Pure Vocals <Mic className="ml-2 h-4 w-4 text-purple-400" />
                        <span className="ml-1 text-xs text-purple-400">(New!)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={downloadCurrentAudio}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {activeAudio === 'acappella' ? 'Pure Vocals' : 
                           activeAudio.charAt(0).toUpperCase() + activeAudio.slice(1)}
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
                <div className="space-y-6">
                  {activeAudio === 'original' && (
                    <AudioPlayer
                      audioUrl={result.original}
                      label="Original Track"
                      onPlayStateChange={(isPlaying) => handlePlayStateChange('original', isPlaying)}
                    />
                  )}
                  
                  {activeAudio === 'instrumental' && (
                    <AudioPlayer
                      audioUrl={result.instrumental}
                      label="Instrumental Track"
                      onPlayStateChange={(isPlaying) => handlePlayStateChange('instrumental', isPlaying)}
                    />
                  )}
                  
                  {activeAudio === 'vocals' && (
                    <AudioPlayer
                      audioUrl={result.vocals}
                      label="Standard Vocal Track"
                      onPlayStateChange={(isPlaying) => handlePlayStateChange('vocals', isPlaying)}
                    />
                  )}
                  
                  {activeAudio === 'acappella' && (
                    <AudioPlayer
                      audioUrl={result.acappella}
                      label="Pure Vocal Track (A Cappella)"
                      onPlayStateChange={(isPlaying) => handlePlayStateChange('acappella', isPlaying)}
                    />
                  )}
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
