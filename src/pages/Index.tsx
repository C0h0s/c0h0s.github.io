
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { games } from '@/data/games';
import { motion } from 'framer-motion';

const Index = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const titleVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.2
      } 
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={titleVariants}
            className="flex flex-col items-center justify-center mb-12"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
              <img 
                src="https://cdn.discordapp.com/avatars/787701539174613022/70fa0aa8ca6d6e2568252e57d32d1b98.webp?size=1024&format=webp"
                alt="c0h0s games"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold text-center text-gaming-purple">
              c0h0s games
            </h1>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {games.map((game, index) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard
                  id={game.id}
                  title={game.title}
                  thumbnail={game.thumbnail}
                  category={game.category}
                  delay={index * 100}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
