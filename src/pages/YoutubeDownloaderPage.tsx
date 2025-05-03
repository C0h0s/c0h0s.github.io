
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Download, Play, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

type VideoQuality = '360p' | '480p' | '720p' | '1080p';

interface VideoDetails {
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
}

const YoutubeDownloaderPage = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('1080p');
  
  // This function would extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };
  
  // This function would fetch video details
  const fetchVideoDetails = async () => {
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would make an API call
      // For demo purposes, we'll simulate the API response
      setTimeout(() => {
        // Mock data
        setVideoDetails({
          title: "Sample YouTube Video",
          thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          duration: "10:30",
          author: "YouTube Creator"
        });
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      toast.error('Error fetching video details');
      setIsLoading(false);
    }
  };
  
  // This function would handle the download
  const handleDownload = () => {
    if (!videoDetails) return;
    
    toast.success(`Starting download in ${selectedQuality}`);
    // This would be replaced with actual download logic
    // For now just show a success message as this is a frontend demo
    toast.success('Download would start now in a real implementation');
    
    // In a real implementation, this would call a server endpoint or use a service
    // that can download and convert the YouTube video
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center mb-6 space-x-3">
            <Youtube className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-white">YouTube to MP4 Downloader</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Fast, ad-free YouTube video downloads in high quality up to 1080p
          </p>
          
          <div className="bg-secondary/20 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                placeholder="Paste YouTube URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={fetchVideoDetails}
                disabled={isLoading || !url}
                className="bg-primary"
              >
                {isLoading ? 'Loading...' : 'Get Video'}
              </Button>
            </div>
          </div>
          
          {videoDetails && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/20 rounded-xl overflow-hidden mb-8"
            >
              <div className="relative aspect-video w-full bg-black/40">
                {videoDetails.thumbnail && (
                  <img 
                    src={videoDetails.thumbnail} 
                    alt={videoDetails.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="rounded-full bg-white/10 p-4 backdrop-blur-sm">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{videoDetails.title}</h3>
                <div className="flex items-center text-muted-foreground mb-6">
                  <span className="mr-4">{videoDetails.author}</span>
                  <span>{videoDetails.duration}</span>
                </div>
                
                <Separator className="mb-6" />
                
                <div className="mb-6">
                  <Label className="text-white mb-2 block">Select quality:</Label>
                  <RadioGroup 
                    value={selectedQuality} 
                    onValueChange={(value) => setSelectedQuality(value as VideoQuality)}
                    className="flex flex-wrap gap-4"
                  >
                    {['360p', '480p', '720p', '1080p'].map((quality) => (
                      <div key={quality} className="flex items-center space-x-2">
                        <RadioGroupItem value={quality} id={quality} />
                        <Label htmlFor={quality}>{quality}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <Button onClick={handleDownload} className="w-full bg-primary">
                  <Download className="mr-2 h-4 w-4" /> Download MP4 ({selectedQuality})
                </Button>
              </div>
            </motion.div>
          )}
          
          <div className="bg-secondary/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">How it works:</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 rounded-full p-2 mt-1">
                  <ArrowDown className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Paste YouTube URL</h3>
                  <p className="text-muted-foreground">Paste any YouTube video link in the input field above</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 rounded-full p-2 mt-1">
                  <ArrowDown className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Select quality</h3>
                  <p className="text-muted-foreground">Choose your preferred video quality up to 1080p</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/20 rounded-full p-2 mt-1">
                  <ArrowDown className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Download instantly</h3>
                  <p className="text-muted-foreground">Get your MP4 file instantly without any ads or waiting</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default YoutubeDownloaderPage;
