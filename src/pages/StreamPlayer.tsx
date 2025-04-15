
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { getContentDetails, getStreamSources, type Content, type Source } from '@/services/streamingApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const StreamPlayer = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [content, setContent] = useState<Content | null>(null);
  const [streamSources, setStreamSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId) {
        setError("Content ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get content details
        const contentDetails = await getContentDetails(contentId);
        if (!contentDetails) {
          setError("Content not found");
          setIsLoading(false);
          return;
        }
        
        setContent(contentDetails);
        
        // Get the streaming sources
        const sources = await getStreamSources(contentId);
        
        if (sources.length === 0) {
          toast({
            title: "No streaming sources available",
            description: "Try another title or check back later",
            variant: "destructive"
          });
          setError("No streaming sources available");
        } else {
          setStreamSources(sources);
        }
      } catch (err) {
        console.error("Error loading content:", err);
        setError("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, toast]);

  const goBack = () => {
    navigate('/streaming');
  };
  
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex flex-col">
        <div className="p-4 z-10">
          <Button onClick={goBack} variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-full max-w-6xl aspect-video rounded-md" />
        </div>
      </div>
    );
  }
  
  if (error || !content) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error || "Failed to load content"}</p>
          <Button onClick={goBack} variant="outline" className="text-white border-white hover:bg-white/10">
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="p-4 z-10">
        <Button onClick={goBack} variant="ghost" className="text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        <div className="w-full max-w-6xl aspect-video">
          {streamSources.length > 0 ? (
            <VideoPlayer 
              sources={streamSources}
              title={content.title}
              autoPlay={true}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-white">Stream not available</p>
            </div>
          )}
        </div>
        
        <div className="w-full max-w-6xl mt-8">
          <h1 className="text-3xl font-bold text-white mb-2">{content.title}</h1>
          <div className="flex items-center text-sm text-gray-400 mb-4">
            <span>{content.year}</span>
            <span className="mx-2">•</span>
            <span>{content.rating}</span>
            <span className="mx-2">•</span>
            {'duration' in content ? (
              <span>{content.duration}</span>
            ) : (
              <span>{content.seasons} Seasons</span>
            )}
          </div>
          <p className="text-gray-300">{content.description}</p>
        </div>
      </div>
    </div>
  );
};

export default StreamPlayer;
