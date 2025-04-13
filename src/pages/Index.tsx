
import React from 'react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import { games } from '@/data/games';
import { motion } from 'framer-motion';
import BackgroundParticles from '@/components/BackgroundParticles';
import ToolsSection from '@/components/ToolsSection';

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundParticles />
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Games</h2>
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
      
      <ToolsSection />
    </div>
  );
};

export default Index;
