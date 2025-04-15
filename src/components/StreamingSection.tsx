
import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StreamingSection = () => {
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    navigate('/streaming');
  };

  return (
    <motion.section 
      className="py-16 px-4 bg-black relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-left">
            <h2 className="text-3xl font-bold text-white mb-2">c0h0s Streaming</h2>
            <p className="text-gray-400 mb-6">Stream movies & TV shows instantly. No sign-up required.</p>
            <Button 
              onClick={handleNavigate}
              className="bg-gaming-purple hover:bg-gaming-purple/90 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Watching
            </Button>
          </div>
          
          <div className="flex-1">
            <motion.div 
              className="relative aspect-video rounded-lg overflow-hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg" 
                alt="Streaming Preview" 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              
              <Button 
                onClick={handleNavigate}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full size-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white p-0"
              >
                <Play className="h-5 w-5 text-white" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default StreamingSection;
