
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { games } from '@/data/games';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

const GamePlayer = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(games.find(g => g.id === gameId));

  useEffect(() => {
    if (!game) {
      navigate('/');
    }
  }, [game, navigate]);

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
        
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
          <iframe
            src={game.url}
            title={game.title}
            className="w-full h-full"
            allow="fullscreen; autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      </main>
    </div>
  );
};

export default GamePlayer;
