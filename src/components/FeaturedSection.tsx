
import React, { useEffect, useRef } from 'react';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedSection = () => {
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
    <section ref={sectionRef} className="bg-secondary py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent"></div>
      
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-left space-y-6">
            <h2 className="text-3xl font-bold text-white reveal">
              Featured Game of the Week
            </h2>
            <p className="text-lg text-gray-300 reveal">
              Experience the thrill of space exploration in our featured game. 
              Navigate through asteroid fields, battle alien forces, and discover 
              new planets in this immersive space adventure.
            </p>
            <div className="space-y-3 reveal">
              <div className="flex items-center">
                <div className="w-1/3 text-sm text-muted-foreground">Developer:</div>
                <div>GameHub Studios</div>
              </div>
              <div className="flex items-center">
                <div className="w-1/3 text-sm text-muted-foreground">Category:</div>
                <div>Space Shooter</div>
              </div>
              <div className="flex items-center">
                <div className="w-1/3 text-sm text-muted-foreground">Players:</div>
                <div>10,532 played this week</div>
              </div>
            </div>
            <div className="pt-2 reveal">
              <Button className="bg-gaming-purple hover:bg-gaming-purple/90 text-white">
                <Gamepad2 className="mr-2 h-5 w-5" /> Play Now
              </Button>
            </div>
          </div>
          
          <div className="reveal">
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden border-2 border-gaming-purple/50 animate-pulse-glow">
                <img 
                  src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131" 
                  alt="Featured Game" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">Space Odyssey</h3>
                  <div className="flex items-center mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#9b87f5" stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-white text-sm">5.0 (243 ratings)</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-gaming-purple text-white text-sm font-bold px-3 py-1 rounded-full animate-float">
                HOT! 🔥
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default FeaturedSection;
