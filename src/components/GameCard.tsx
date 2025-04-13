
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
      className="game-card cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      onClick={openGameInNewTab}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
    >
      <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="game-card-gradient"></div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <p className="text-xs font-medium text-white/70 mb-1">{category}</p>
          <h3 className="text-base font-bold text-white">{title}</h3>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
