
import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, ArrowRight, Code, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const ToolsSection = () => {
  const navigate = useNavigate();
  const sectionRef = React.useRef<HTMLDivElement>(null);
  
  // Tools data
  const tools: Tool[] = [
    {
      id: 'vocal-remover',
      title: 'Vocal Remover',
      description: 'Remove vocals from your music files to create instrumentals and karaoke tracks.',
      icon: <Headphones size={24} />,
      path: '/vocalremover',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'code-snippets',
      title: 'Code Snippets',
      description: 'Useful code snippets for web developers and programmers.',
      icon: <Code size={24} />,
      path: '#', // Placeholder path
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'ai-tools',
      title: 'AI Tools',
      description: 'Artificial intelligence powered tools to help with various tasks.',
      icon: <Wand2 size={24} />,
      path: '#', // Placeholder path
      color: 'from-amber-500 to-orange-500'
    }
  ];

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

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-gaming-dark">
      <div className="container mx-auto">
        <div className="text-left mb-8 reveal">
          <h2 className="text-2xl font-bold text-white">Tools</h2>
          <p className="text-muted-foreground">Useful utilities to enhance your experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div 
              key={tool.id}
              className="reveal bg-secondary/20 rounded-xl overflow-hidden cursor-pointer"
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => handleNavigate(tool.path)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                
                <Button 
                  variant="ghost" 
                  className="mt-2 text-white hover:bg-white/10"
                  onClick={() => handleNavigate(tool.path)}
                >
                  Open Tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
