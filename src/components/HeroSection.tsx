
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="hero-gradient min-h-[80vh] w-full flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f')] bg-cover bg-center opacity-20"></div>
      
      <div className="container mx-auto px-4 z-10 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className={`text-4xl md:text-6xl font-bold text-white text-glow transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Play Exciting Games <br />
            <span className="text-gaming-purple">Instantly in Your Browser</span>
          </h1>
          
          <p className={`text-lg text-gray-300 max-w-xl mx-auto transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Dive into hundreds of free games without downloads or installs. 
            Start playing right away!
          </p>
          
          <div className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Button size="lg" className="bg-gaming-purple hover:bg-gaming-purple/90 text-white">
              <Play className="mr-2 h-5 w-5" /> Play Featured Game
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Browse All Games
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
};

export default HeroSection;
