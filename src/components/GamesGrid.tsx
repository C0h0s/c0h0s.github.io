
import React, { useEffect, useRef } from 'react';
import GameCard from './GameCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { games } from '@/data/games';

const GamesGrid = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Get unique categories for tabs
  const categories = Array.from(new Set(games.map(game => game.category)));

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
          <h2 className="text-3xl font-bold mb-4">Browse All Games</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find your next favorite game from our extensive collection of browser games
          </p>
        </div>

        <Tabs defaultValue="all" className="reveal">
          <TabsList className="mb-8 bg-secondary/50 p-1 mx-auto flex justify-center flex-wrap">
            <TabsTrigger value="all" className="px-6">All Games</TabsTrigger>
            {categories.slice(0, 5).map(category => (
              <TabsTrigger key={category} value={category.toLowerCase()} className="px-6">{category}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {games.map((game, index) => (
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
          
          {categories.slice(0, 5).map(category => (
            <TabsContent key={category} value={category.toLowerCase()} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {games.filter(game => game.category === category).map((game, index) => (
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
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default GamesGrid;
