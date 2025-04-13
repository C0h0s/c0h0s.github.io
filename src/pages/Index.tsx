
import React, { useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import GamesGrid from '@/components/GamesGrid';
import FeaturedSection from '@/components/FeaturedSection';
import TrendingNow from '@/components/TrendingNow';
import Footer from '@/components/Footer';

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
      
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8 container mx-auto py-12 px-4">
          <div className="lg:col-span-3">
            {/* Games Grid */}
            <GamesGrid />
          </div>
          
          <div className="lg:col-span-1">
            {/* Trending Now Section */}
            <TrendingNow />
          </div>
        </div>
        
        {/* Featured Game Section */}
        <FeaturedSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
