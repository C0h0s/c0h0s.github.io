
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { games } from '@/data/games';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const GamePlayer = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(games.find(g => g.id === gameId));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!game) {
      navigate('/');
      return;
    }
    
    // Reset loading state when game changes
    setIsLoading(true);
    
    // Show toast that game is loading
    toast.info(`Loading ${game.title}...`, {
      duration: 2000
    });
  }, [game, navigate]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    toast.success(`${game?.title} loaded successfully!`, {
      duration: 2000
    });
  };

  const handleIframeError = () => {
    setIsLoading(false);
    toast.error("Failed to load game. Please try again.", {
      duration: 5000
    });
  };

  if (!game) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-16 container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} />
            Back to Games
          </Button>
          <h1 className="text-xl font-bold">{game.title}</h1>
          <div className="w-[100px]"></div> {/* Spacer for balance */}
        </div>
        
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gaming-dark/70 z-10">
              <div className="w-16 h-16 border-4 border-gaming-purple/30 border-t-gaming-purple rounded-full animate-spin"></div>
            </div>
          )}
          <iframe
            src={game.url}
            title={game.title}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            allow="fullscreen; autoplay; encrypted-media"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            loading="eager"
            referrerPolicy="origin"
          ></iframe>
        </div>
      </main>
    </div>
  );
};

export default GamePlayer;
