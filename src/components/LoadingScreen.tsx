
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  useEffect(() => {
    // Show loading screen for 4 seconds before completing
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Framer motion variants for animations
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };
  
  const titleVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { delay: 3, duration: 0.7 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-gaming-dark flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex flex-col items-center">
        {/* Updated logo with new image */}
        <div className="rounded-2xl w-16 h-16 flex items-center justify-center mb-6 overflow-hidden">
          <motion.img 
            src="https://cdn.discordapp.com/avatars/787701539174613022/70fa0aa8ca6d6e2568252e57d32d1b98.webp?size=1024&format=webp"
            alt="Loading Logo"
            className="w-full h-full object-cover"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </div>
        
        {/* Loading spinner */}
        <div className="w-16 h-16 mb-8 relative">
          <motion.div 
            className="absolute inset-0 border-4 border-gaming-purple/30 border-t-gaming-purple rounded-full"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </div>
        
        {/* Welcome title that appears at the end */}
        <motion.h1 
          variants={titleVariants}
          initial="initial"
          animate="animate"
          className="text-4xl font-bold text-white text-center"
        >
          Welcome to <span className="text-gaming-purple">c0h0s games</span>.
        </motion.h1>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
