
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { games } from '@/data/games';

interface TrendingGameProps {
  id: string;
  title: string;
  thumbnail: string;
  players: string;
  index: number;
}

const TrendingGame = ({ id, title, thumbnail, players, index }: TrendingGameProps) => {
  // Function to open game in new tab
  const openGameInNewTab = () => {
    const gameData = games.find(g => g.id === id);
    if (gameData && gameData.url) {
      window.open(gameData.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 hover:bg-secondary reveal cursor-pointer`} 
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={openGameInNewTab}
    >
      <div className="relative flex-shrink-0">
        <div className="bg-gaming-purple w-6 h-6 rounded-full absolute -left-2 -top-2 flex items-center justify-center text-sm font-bold text-white">
          {index + 1}
        </div>
        <img src={thumbnail} alt={title} className="w-16 h-16 object-cover rounded-lg" />
      </div>
      <div className="flex-grow text-left">
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-xs text-muted-foreground">{players} players</p>
      </div>
      <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground hover:text-white">
        <ArrowRight size={18} />
      </Button>
    </div>
  );
};

// Get 5 popular games for trending section with mock player counts
const trendingGames = games.slice(0, 5).map((game, index) => ({
  ...game,
  players: `${Math.floor(Math.random() * 10000 + 5000).toLocaleString()}`
}));

const TrendingNow = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

  return (
    <section ref={sectionRef} className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-left mb-8 reveal">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <p className="text-muted-foreground">Most played games this week</p>
        </div>
        <div className="space-y-3">
          {trendingGames.map((game, index) => (
            <TrendingGame
              key={game.id}
              id={game.id}
              title={game.title}
              thumbnail={game.thumbnail}
              players={game.players}
              index={index}
            />
          ))}
        </div>
        <div className="mt-6 text-center reveal">
          <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10">
            View All Trending Games <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingNow;
