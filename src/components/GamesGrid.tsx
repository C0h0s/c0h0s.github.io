
import React, { useEffect, useRef } from 'react';
import GameCard from './GameCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample game data
const GAMES = [
  {
    id: '1',
    title: 'Space Invaders',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    category: 'Action'
  },
  {
    id: '2',
    title: 'Puzzle Master',
    thumbnail: 'https://images.unsplash.com/photo-1522069213448-443a614da9b6',
    category: 'Puzzle'
  },
  {
    id: '3',
    title: 'Racing Fever',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
    category: 'Racing'
  },
  {
    id: '4',
    title: 'Zombie Survival',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
    category: 'Horror'
  },
  {
    id: '5',
    title: 'Tetris Challenge',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8',
    category: 'Classic'
  },
  {
    id: '6',
    title: 'Card Duels',
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d',
    category: 'Card'
  },
  {
    id: '7',
    title: 'Dungeon Explorer',
    thumbnail: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
    category: 'RPG'
  },
  {
    id: '8',
    title: 'Bubble Shooter',
    thumbnail: 'https://images.unsplash.com/photo-1559511260-66a654ae982a',
    category: 'Casual'
  }
];

const GamesGrid = () => {
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
    <section ref={sectionRef} className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl font-bold mb-4">Popular Games</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find your next favorite game from our extensive collection of browser games
          </p>
        </div>

        <Tabs defaultValue="all" className="reveal">
          <TabsList className="mb-8 bg-secondary/50 p-1 mx-auto flex justify-center">
            <TabsTrigger value="all" className="px-6">All Games</TabsTrigger>
            <TabsTrigger value="action" className="px-6">Action</TabsTrigger>
            <TabsTrigger value="puzzle" className="px-6">Puzzle</TabsTrigger>
            <TabsTrigger value="racing" className="px-6">Racing</TabsTrigger>
            <TabsTrigger value="strategy" className="px-6">Strategy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {GAMES.map((game, index) => (
                <div key={game.id} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                  <GameCard 
                    id={game.id}
                    title={game.title}
                    thumbnail={game.thumbnail}
                    category={game.category}
                    delay={index * 100}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="action" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {GAMES.filter(game => game.category === 'Action' || game.category === 'Horror').map((game, index) => (
                <div key={game.id} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                  <GameCard 
                    id={game.id}
                    title={game.title}
                    thumbnail={game.thumbnail}
                    category={game.category}
                    delay={index * 100}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="puzzle" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {GAMES.filter(game => game.category === 'Puzzle' || game.category === 'Classic').map((game, index) => (
                <div key={game.id} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                  <GameCard 
                    id={game.id}
                    title={game.title}
                    thumbnail={game.thumbnail}
                    category={game.category}
                    delay={index * 100}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="racing" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {GAMES.filter(game => game.category === 'Racing').map((game, index) => (
                <div key={game.id} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                  <GameCard 
                    id={game.id}
                    title={game.title}
                    thumbnail={game.thumbnail}
                    category={game.category}
                    delay={index * 100}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="strategy" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {GAMES.filter(game => game.category === 'Card' || game.category === 'RPG').map((game, index) => (
                <div key={game.id} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                  <GameCard 
                    id={game.id}
                    title={game.title}
                    thumbnail={game.thumbnail}
                    category={game.category}
                    delay={index * 100}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default GamesGrid;
