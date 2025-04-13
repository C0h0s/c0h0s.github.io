
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { games } from '@/data/games';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Create a type for game statistics
interface GameStats {
  id: string;
  title: string;
  thumbnail: string;
  playCount: number;
  percentageChange: number; // week-over-week change in popularity
  isRising: boolean;
}

const MostPlayedGames = () => {
  const [mostPlayedGames, setMostPlayedGames] = useState<GameStats[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Effect to generate and set most played games
  useEffect(() => {
    // Simulate most played games data with randomized play counts
    const generateMostPlayedGames = () => {
      // Take a random sample of games (5-8 games)
      const shuffled = [...games].sort(() => 0.5 - Math.random());
      const selectedGames = shuffled.slice(0, Math.floor(Math.random() * 4) + 5);
      
      // Generate play statistics for each game
      const gamesWithStats = selectedGames.map(game => {
        const playCount = Math.floor(Math.random() * 10000) + 1000; // Random between 1000-11000
        const percentageChange = Math.floor(Math.random() * 30) + 1; // Random between 1-30
        const isRising = Math.random() > 0.3; // 70% chance of rising
        
        return {
          id: game.id,
          title: game.title,
          thumbnail: game.thumbnail,
          playCount,
          percentageChange,
          isRising
        };
      });
      
      // Sort by play count (highest first)
      return gamesWithStats.sort((a, b) => b.playCount - a.playCount);
    };
    
    setMostPlayedGames(generateMostPlayedGames());
  }, []);

  // Intersection observer for animation
  useEffect(() => {
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

  // Format number to display with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Navigate to game detail
  const handleGameClick = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-gaming-dark">
      <div className="container mx-auto">
        <div className="text-left mb-8 reveal">
          <h2 className="text-2xl font-bold text-white">Most Played This Week</h2>
          <p className="text-muted-foreground">The games everyone's playing right now</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Featured #1 Game (Larger) */}
          {mostPlayedGames.length > 0 && (
            <motion.div 
              className="reveal bg-secondary/20 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => handleGameClick(mostPlayedGames[0].id)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative aspect-video">
                <img 
                  src={mostPlayedGames[0].thumbnail} 
                  alt={mostPlayedGames[0].title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-gaming-purple text-white text-sm font-medium px-3 py-1 rounded-full">#1 Most Played</span>
                    {mostPlayedGames[0].isRising && (
                      <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {mostPlayedGames[0].percentageChange}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{mostPlayedGames[0].title}</h3>
                  <p className="text-white/70">{formatNumber(mostPlayedGames[0].playCount)} plays this week</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* List of other top games */}
          <div className="space-y-3">
            {mostPlayedGames.slice(1, 5).map((game, index) => (
              <motion.div 
                key={game.id} 
                className="reveal bg-secondary/20 rounded-lg overflow-hidden cursor-pointer"
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => handleGameClick(game.id)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center p-2">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover rounded-md" />
                    <div className="absolute -left-2 -top-2 w-6 h-6 bg-gaming-purple rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 2}
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-white">{game.title}</h4>
                      <div>
                        {game.isRising ? (
                          <span className="text-green-400 text-xs flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            {game.percentageChange}%
                          </span>
                        ) : (
                          <span className="text-red-400 text-xs flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {game.percentageChange}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatNumber(game.playCount)} plays</p>
                  </div>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 text-white">
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            ))}

            <div className="mt-4 reveal">
              <Button variant="ghost" className="w-full border border-white/10 text-white hover:bg-white/5">
                View All Popular Games
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MostPlayedGames;
