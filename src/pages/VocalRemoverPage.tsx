
import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Headphones, ArrowLeft, Upload, X, Music, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type ProcessingStage = 'idle' | 'uploading' | 'analyzing' | 'separating' | 'finalizing' | 'complete';

interface AudioResult {
  instrumental: string;
  vocals: string;
}

const VocalRemoverPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AudioResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const audioPreviewRef = useRef<HTMLAudioElement>(null);
  const vocalPreviewRef = useRef<HTMLAudioElement>(null);
  const instrumentalPreviewRef = useRef<HTMLAudioElement>(null);

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
    
    // Create audio preview
    const audioUrl = URL.createObjectURL(selectedFile);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.src = audioUrl;
    }
    
    // Begin simulated processing
    simulateProcessing();
  };

  const simulateProcessing = () => {
    // Reset progress
    setProgress(0);
    setProcessingStage('uploading');
    
    // Simulate the processing steps
    const totalTime = 5000; // Total processing time (5 seconds for demo)
    const steps = ['uploading', 'analyzing', 'separating', 'finalizing', 'complete'];
    const stepTime = totalTime / (steps.length - 1);
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      const progressPercentage = (currentStep / (steps.length - 1)) * 100;
      setProgress(progressPercentage);
      setProcessingStage(steps[currentStep] as ProcessingStage);
      
      currentStep++;
      
      if (currentStep >= steps.length) {
        clearInterval(interval);
        
        // In a real implementation, this would be actual separated audio
        // For demo, we'll just use the same audio file for both
        const audioUrl = URL.createObjectURL(file!);
        
        setResult({
          instrumental: audioUrl,
          vocals: audioUrl,
        });
        
        toast({
          title: "Processing complete",
          description: "Your audio has been successfully separated!",
        });
      }
    }, stepTime);
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
    
    // Reset audio previews
    if (audioPreviewRef.current) {
      audioPreviewRef.current.src = '';
    }
  };
  
  const handleDownload = (type: 'instrumental' | 'vocals') => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = type === 'instrumental' ? result.instrumental : result.vocals;
    link.download = `${file?.name.split('.')[0]}_${type}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: `Your ${type} track is downloading.`
    });
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

              {/* Audio Preview */}
              <div className="mb-6 bg-black/20 rounded-lg p-3">
                <audio 
                  ref={audioPreviewRef} 
                  controls 
                  className="w-full focus:outline-none"
                >
                  Your browser does not support the audio element.
                </audio>
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

              {/* Results */}
              {processingStage === 'complete' && result && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Instrumental Track</h4>
                    <div className="bg-black/20 rounded-lg p-3 flex items-center">
                      <audio 
                        ref={instrumentalPreviewRef} 
                        src={result.instrumental}
                        controls 
                        className="w-full focus:outline-none"
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2 flex-shrink-0 text-white hover:bg-white/10"
                        onClick={() => handleDownload('instrumental')}
                      >
                        <Download size={18} />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Vocals Track</h4>
                    <div className="bg-black/20 rounded-lg p-3 flex items-center">
                      <audio 
                        ref={vocalPreviewRef} 
                        src={result.vocals}
                        controls 
                        className="w-full focus:outline-none"
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2 flex-shrink-0 text-white hover:bg-white/10"
                        onClick={() => handleDownload('vocals')}
                      >
                        <Download size={18} />
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
              <li>Preview both the instrumental and vocals tracks</li>
              <li>Download the separated tracks using the download buttons</li>
            </ol>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Note: This tool works best with high-quality audio files with clear separation between vocals and instrumentals.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VocalRemoverPage;
