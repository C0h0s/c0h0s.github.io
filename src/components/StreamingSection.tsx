
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Film, Tv, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StreamingSection = () => {
  const navigate = useNavigate();
  const sectionRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const elements = entry.target.querySelectorAll('.reveal');
        if (entry.isIntersecting) {
          elements.forEach((el) => {
            el.classList.add('active');
          });
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleNavigate = () => {
    navigate('/streaming');
  };

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-gaming-dark">
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent"></div>
      
      <div className="container mx-auto">
        <div className="text-left mb-8 reveal">
          <h2 className="text-3xl font-bold text-white">c0h0s Streaming</h2>
          <p className="text-muted-foreground">Unlimited movies, TV shows, and more. Free streaming, no subscriptions.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <motion.div 
            className="reveal basis-1/2 bg-gradient-to-br from-purple-900/30 via-black/60 to-black/80 rounded-xl overflow-hidden relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="aspect-video relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05" 
                alt="Featured Content" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-400">FEATURED</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Unlimited Streaming</h3>
                <p className="text-gray-300 mb-4">Stream thousands of movies and TV shows completely free. No subscriptions, no ads.</p>
                <Button 
                  onClick={handleNavigate}
                  className="bg-gaming-purple hover:bg-gaming-purple/90 text-white"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Watching
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="basis-1/2 grid grid-cols-2 gap-4">
            <motion.div 
              className="reveal bg-secondary/20 rounded-xl overflow-hidden cursor-pointer"
              onClick={handleNavigate}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 text-left">
                <Film className="h-8 w-8 text-gaming-purple mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Movies</h3>
                <p className="text-sm text-muted-foreground">Thousands of movies from classic to new releases</p>
              </div>
            </motion.div>

            <motion.div 
              className="reveal bg-secondary/20 rounded-xl overflow-hidden cursor-pointer"
              onClick={handleNavigate}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 text-left">
                <Tv className="h-8 w-8 text-gaming-purple mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">TV Shows</h3>
                <p className="text-sm text-muted-foreground">Binge-worthy shows with all episodes available</p>
              </div>
            </motion.div>

            <motion.div 
              className="reveal bg-secondary/20 rounded-xl overflow-hidden cursor-pointer col-span-2"
              onClick={handleNavigate}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 text-left flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-1">Start Watching Now</h3>
                  <p className="text-sm text-muted-foreground">No account needed. Just click and stream.</p>
                </div>
                <Button 
                  onClick={handleNavigate} 
                  className="bg-gaming-purple hover:bg-gaming-purple/90 text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default StreamingSection;
