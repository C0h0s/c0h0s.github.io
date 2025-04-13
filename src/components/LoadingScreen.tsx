
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + 1;
        }
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 500);
        return 100;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Framer motion variants for animations
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };
  
  const titleVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { delay: 0.3, duration: 0.7 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
  };
  
  const progressVariants = {
    initial: { width: "0%" },
    animate: { width: `${progress}%`, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-gaming-dark flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div 
        className="flex flex-col items-center"
        variants={titleVariants} 
      >
        <div className="bg-gaming-purple rounded-2xl w-16 h-16 flex items-center justify-center animate-pulse-glow mb-6">
          <span className="font-bold text-white text-3xl">G</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to <span className="text-gaming-purple">c0h0s games</span>
        </h1>
        <p className="text-gray-400 mb-8">Your browser gaming destination</p>
      </motion.div>
      
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-600 to-gaming-purple rounded-full"
          variants={progressVariants}
          initial="initial"
          animate="animate"
        />
      </div>
      
      <p className="text-gray-500 mt-2">{progress}%</p>
    </motion.div>
  );
};

export default LoadingScreen;
