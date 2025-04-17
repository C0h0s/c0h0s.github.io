
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ImageMinus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ToolsSection = () => {
  const navigate = useNavigate();
  const sectionRef = React.useRef<HTMLDivElement>(null);
  
  // Background removal tool data
  const tool = {
    id: 'background-remover',
    title: 'AI-Powered Background Remover',
    description: 'Remove backgrounds from your images with cutting-edge AI technology. Create transparent PNGs in seconds. Perfect for product photography, profile pictures, and graphic design projects.',
    icon: <ImageMinus size={24} />,
    path: '/background-remover',
    color: 'from-blue-500 to-indigo-500'
  };

  // Intersection observer for animation
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
    navigate(tool.path);
  };

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-gaming-dark">
      <div className="container mx-auto">
        <div className="text-left mb-8 reveal">
          <h2 className="text-2xl font-bold text-white">Creative Tools</h2>
          <p className="text-muted-foreground">Professional tools powered by cutting-edge AI technology</p>
        </div>

        <div className="flex justify-center">
          <motion.div 
            className="reveal bg-secondary/20 rounded-xl overflow-hidden cursor-pointer max-w-md w-full"
            onClick={handleNavigate}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                {tool.icon}
              </div>
              <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                {tool.title}
                <Sparkles className="ml-2 h-4 w-4 text-blue-400" />
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
              
              <Button 
                variant="ghost" 
                className="mt-2 text-white hover:bg-white/10"
                onClick={handleNavigate}
              >
                Open Tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
