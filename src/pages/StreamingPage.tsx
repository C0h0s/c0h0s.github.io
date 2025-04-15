
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Search, Play, Plus, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  fetchFeaturedContent, 
  fetchContentByCategory, 
  searchContent,
  type Content 
} from '@/services/streamingApi';

// Content categories
const categories = [
  { id: 'trending', name: 'Trending Now' },
  { id: 'new', name: 'New Releases' },
  { id: 'action', name: 'Action' },
  { id: 'drama', name: 'Drama' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'animation', name: 'Animation' },
  { id: 'sci-fi', name: 'Sci-Fi' }
];

const StreamingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [categoryContent, setCategoryContent] = useState<{[key: string]: Content[]}>({});
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        setIsLoading(true);
        // Load featured content
        const featured = await fetchFeaturedContent();
        setFeaturedContent(featured);
        
        // Load content for each category
        const categoryData: {[key: string]: Content[]} = {};
        
        const promises = categories.map(async category => {
          const content = await fetchContentByCategory(category.id);
          categoryData[category.id] = content;
        });
        
        await Promise.all(promises);
        setCategoryContent(categoryData);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialContent();
  }, []);

  useEffect(() => {
    // Debounced search
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchContent(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleWatchContent = (contentId: string) => {
    navigate(`/stream/${contentId}`);
  };

  const renderContentRow = (title: string, content: Content[]) => {
    if (!content || content.length === 0) return null;
    
    return (
      <div className="mb-10">
        <h2 className="text-lg font-medium text-white mb-4">{title}</h2>
        <motion.div 
          className="flex gap-3 overflow-x-auto pb-4 no-scrollbar"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {content.map((item) => (
            <motion.div 
              key={item.id}
              variants={itemVariants}
              className="flex-shrink-0 w-[180px] cursor-pointer group"
              onClick={() => handleWatchContent(item.id)}
            >
              <div className="relative aspect-[2/3] rounded-md overflow-hidden">
                <img 
                  src={item.poster} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                  <Button size="sm" className="bg-white text-black hover:bg-white/90 w-full">
                    <Play className="h-3 w-3 mr-1" /> Play
                  </Button>
                </div>
              </div>
              <h3 className="text-sm font-medium text-white mt-2 truncate">{item.title}</h3>
              <p className="text-xs text-gray-400">{item.year}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-16">
        {/* Search Bar */}
        <div className="sticky top-16 z-10 px-4 py-3 bg-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="container mx-auto max-w-7xl flex">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="search"
                placeholder="Search movies & shows..." 
                className="pl-10 bg-gray-900 border-gray-800 text-white focus-visible:ring-gaming-purple"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isSearching ? (
          /* Search Results */
          <section className="px-4 py-6">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-xl font-medium mb-4">Search Results for "{searchQuery}"</h2>
              {searchResults.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {searchResults.map((item) => (
                    <motion.div 
                      key={item.id}
                      variants={itemVariants}
                      className="cursor-pointer group"
                      onClick={() => handleWatchContent(item.id)}
                    >
                      <div className="aspect-[2/3] rounded-md overflow-hidden">
                        <img 
                          src={item.poster} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-sm font-medium mt-2">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.year}</p>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="text-gray-400">No results found for "{searchQuery}"</p>
              )}
            </div>
          </section>
        ) : (
          /* Regular Content Display */
          <>
            {/* Hero Banner */}
            {featuredContent && (
              <section className="relative h-[70vh]">
                <div className="absolute inset-0">
                  <img 
                    src={featuredContent.backdrop} 
                    alt={featuredContent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
                </div>
                
                <div className="relative container mx-auto max-w-7xl flex flex-col justify-end h-full pb-16 px-4">
                  <div className="max-w-lg text-left">
                    <h1 className="text-4xl font-bold mb-2">{featuredContent.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                      <span>{featuredContent.year}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                      {'duration' in featuredContent && <span>{featuredContent.duration}</span>}
                      <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                      <span>{featuredContent.rating}</span>
                    </div>
                    <p className="text-gray-300 mb-6 line-clamp-3">{featuredContent.description}</p>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="bg-white hover:bg-white/90 text-black"
                        onClick={() => handleWatchContent(featuredContent.id)}
                      >
                        <Play className="mr-2 h-4 w-4" /> Play
                      </Button>
                      <Button variant="outline" className="text-white border-white">
                        <Info className="mr-2 h-4 w-4" /> More Info
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}
            
            {/* Content Categories */}
            <section className="px-4 pb-12">
              <div className="container mx-auto max-w-7xl">
                {categories.map((category) => (
                  renderContentRow(
                    category.name, 
                    categoryContent[category.id] || []
                  )
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default StreamingPage;
