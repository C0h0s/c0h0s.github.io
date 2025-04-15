
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Search, Play, Plus, Info, Film, Tv, Star, TrendingUp, Clock, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

// Demo content categories
const categories = [
  { id: 'featured', name: 'Featured' },
  { id: 'trending', name: 'Trending Now' },
  { id: 'new', name: 'New Releases' },
  { id: 'action', name: 'Action' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'horror', name: 'Horror' },
];

// Demo content items
const contentItems = [
  {
    id: 1,
    title: "The Lost Kingdom",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    category: "Action",
    featured: true,
    description: "A kingdom in ruins, a hero must rise to save what remains of civilization.",
    year: 2023,
    duration: "2h 15m",
    rating: "PG-13"
  },
  {
    id: 2,
    title: "Ocean's Mystery",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    category: "Drama",
    featured: false,
    description: "An underwater adventure to discover secrets beneath the waves.",
    year: 2022,
    duration: "1h 55m",
    rating: "PG"
  },
  {
    id: 3,
    title: "City Nights",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    category: "Thriller",
    featured: true,
    description: "When the city sleeps, danger lurks in the shadows.",
    year: 2023,
    duration: "2h 5m",
    rating: "R"
  },
  {
    id: 4,
    title: "Beyond Stars",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    category: "Sci-Fi",
    featured: false,
    description: "A journey to the edges of the universe and beyond.",
    year: 2021,
    duration: "2h 30m",
    rating: "PG-13"
  },
  // Duplicate a few items to fill the rows
  {
    id: 5,
    title: "Urban Chase",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    category: "Action",
    featured: false,
    description: "A high-speed chase through the urban jungle.",
    year: 2023,
    duration: "1h 45m",
    rating: "PG-13"
  },
  {
    id: 6,
    title: "Silent Echo",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
    category: "Mystery",
    featured: false,
    description: "The silence hides secrets that echo through time.",
    year: 2022,
    duration: "2h 10m",
    rating: "PG-13"
  }
];

const StreamingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const featuredContent = contentItems.find(item => item.featured);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Banner */}
        <section className="relative h-[70vh]">
          <div className="absolute inset-0">
            <img 
              src={featuredContent?.image} 
              alt={featuredContent?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          </div>
          
          <div className="relative container mx-auto flex flex-col justify-end h-full pb-16 px-4">
            <div className="max-w-lg text-left">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-yellow-400">FEATURED</span>
              </div>
              <h1 className="text-5xl font-bold mb-4">{featuredContent?.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-300 mb-4">
                <span>{featuredContent?.year}</span>
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                <span>{featuredContent?.duration}</span>
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                <span>{featuredContent?.rating}</span>
                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                <span>{featuredContent?.category}</span>
              </div>
              <p className="text-gray-300 mb-8">{featuredContent?.description}</p>
              
              <div className="flex gap-4">
                <Button className="bg-gaming-purple hover:bg-gaming-purple/90 text-white">
                  <Play className="mr-2 h-5 w-5" /> Play
                </Button>
                <Button variant="outline" className="text-white">
                  <Info className="mr-2 h-5 w-5" /> More Info
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Navigation Menu */}
        <section className="bg-black/90 backdrop-blur-sm sticky top-0 z-10 py-3">
          <div className="container mx-auto px-4">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-8">
                <NavigationMenuItem>
                  <NavigationMenuLink href="#" className="text-white hover:text-gaming-purple transition-colors">
                    <div className="flex items-center">
                      <Film className="mr-2 h-4 w-4" /> Movies
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#" className="text-white hover:text-gaming-purple transition-colors">
                    <div className="flex items-center">
                      <Tv className="mr-2 h-4 w-4" /> TV Shows
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#" className="text-white hover:text-gaming-purple transition-colors">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" /> Trending
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#" className="text-white hover:text-gaming-purple transition-colors">
                    <div className="flex items-center">
                      <Heart className="mr-2 h-4 w-4" /> Watchlist
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </section>
        
        {/* Content Sections */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            {categories.map((category) => (
              <div key={category.id} className="mb-12">
                <h2 className="text-xl font-bold mb-6">{category.name}</h2>
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {contentItems.map((item) => (
                    <motion.div 
                      key={`${category.id}-${item.id}`}
                      variants={itemVariants}
                      className="relative group cursor-pointer"
                    >
                      <div className="aspect-[2/3] rounded-lg overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <h3 className="text-sm font-bold">{item.title}</h3>
                        <div className="flex items-center mt-2 gap-2">
                          <Button size="sm" className="bg-white hover:bg-white/90 text-black p-1 h-7 w-7 rounded-full">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="p-1 h-7 w-7 rounded-full">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StreamingPage;
