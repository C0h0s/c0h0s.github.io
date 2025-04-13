
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import GameCard from '@/components/GameCard';
import Footer from '@/components/Footer';
import { games } from '@/data/games';

// Helper function to handle scroll animations
const setupScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((el) => observer.observe(el));

  return () => {
    revealElements.forEach((el) => observer.unobserve(el));
  };
};

const Index = () => {
  useEffect(() => {
    const cleanupAnimations = setupScrollAnimations();
    return cleanupAnimations;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12 text-gaming-purple reveal">
            c0h0s games
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 reveal">
            {games.map((game, index) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                thumbnail={game.thumbnail}
                category={game.category}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
