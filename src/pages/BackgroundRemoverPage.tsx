
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ImageMinus, Upload, Download, MagicWand, Loader } from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageComparisonSlider from '@/components/ImageComparisonSlider';
import { removeBackground, validateImage, fileToDataUrl } from '@/utils/backgroundRemover';

const BackgroundRemoverPage = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateImage(file)) return;
      
      setUploadedFile(file);
      try {
        const dataUrl = await fileToDataUrl(file);
        setOriginalImage(dataUrl);
        setProcessedImage(null);
      } catch (error) {
        toast.error('Failed to read image file');
        console.error(error);
      }
    }
  };

  // Function to process the image
  const processImage = useCallback(async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    try {
      toast.info('Processing image...');
      
      // Add a slight delay to show the processing state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await removeBackground(originalImage);
      setProcessedImage(result);
      
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage]);
  
  // Download the processed image
  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `removed-bg-${uploadedFile?.name || 'image'}.png`;
    link.href = processedImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto pt-24 pb-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <ImageMinus className="h-8 w-8" />
            Background Remover Tool
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Remove backgrounds from your images with our AI-powered tool. 
            Upload an image, let our AI work its magic, and download your transparent PNG.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Controls */}
          <Card className="w-full md:w-1/3 bg-secondary/20">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Upload Controls */}
                <div>
                  <h3 className="text-lg font-medium mb-4">1. Upload Image</h3>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <Button 
                    onClick={handleUploadClick}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
                    size="lg"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                  {uploadedFile && (
                    <p className="mt-2 text-sm text-muted-foreground truncate">
                      {uploadedFile.name}
                    </p>
                  )}
                </div>
                
                {/* Process Controls */}
                <div>
                  <h3 className="text-lg font-medium mb-4">2. Remove Background</h3>
                  <Button 
                    onClick={processImage}
                    disabled={!originalImage || isProcessing}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <MagicWand className="mr-2 h-4 w-4" />
                        Remove Background
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Download Controls */}
                <div>
                  <h3 className="text-lg font-medium mb-4">3. Download Result</h3>
                  <Button 
                    onClick={downloadImage}
                    disabled={!processedImage}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Right Side - Image Preview */}
          <div className="w-full md:w-2/3">
            <div className="bg-secondary/10 rounded-xl flex items-center justify-center h-[400px] md:h-[500px] overflow-hidden">
              {!originalImage ? (
                <div className="text-center p-8">
                  <ImageMinus className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Upload an image to get started
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {originalImage && processedImage ? (
                    <ImageComparisonSlider 
                      originalImage={originalImage}
                      processedImage={processedImage}
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 bg-center"
                      style={{
                        backgroundImage: `url(${originalImage})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Processing information */}
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 bg-secondary/20 rounded-lg"
              >
                <p className="text-sm text-center">
                  Our AI is analyzing your image to separate foreground from background. 
                  This may take a few moments...
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BackgroundRemoverPage;
