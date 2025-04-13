
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GameCardProps {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  delay: number;
}

const GameCard = ({ id, title, thumbnail, category, delay }: GameCardProps) => {
  // Get the game URL from the games data
  const openGameInNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Import games dynamically to get the URL
    import('@/data/games').then(module => {
      const games = module.games;
      const game = games.find(g => g.id === id);
      
      if (game && game.url) {
        window.open(game.url, '_blank', 'noopener,noreferrer');
      }
    });
  };

  return (
    <motion.div 
      className="game-card cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      onClick={openGameInNewTab}
    >
      <div className="aspect-[3/4] rounded-xl overflow-hidden relative">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="game-card-gradient"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <p className="text-xs font-medium text-white/70 mb-1">{category}</p>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
