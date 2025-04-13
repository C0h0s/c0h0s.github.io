
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface GameCardProps {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  delay?: number;
}

const GameCard = ({ id, title, thumbnail, category, delay = 0 }: GameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/play/${id}`);
  };

  return (
    <div 
      className={`game-card animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/game/${id}`}>
        <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          <div className="game-card-gradient"></div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
               style={{ opacity: isHovered ? 1 : 0 }}>
            <Button 
              variant="default" 
              size="lg" 
              className="bg-gaming-purple/90 hover:bg-gaming-purple"
              onClick={handlePlay}
            >
              <Play className="mr-2 h-5 w-5" /> Play Now
            </Button>
          </div>

          <div className="absolute top-3 right-3 bg-gaming-purple/90 text-xs px-2 py-1 rounded-full text-white font-medium">
            {category}
          </div>
          
          <div className="absolute bottom-3 left-3 right-3 text-left">
            <h3 className="font-bold text-white text-lg line-clamp-1">{title}</h3>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GameCard;
