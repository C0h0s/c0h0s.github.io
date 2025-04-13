
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { games } from '@/data/games';
import { useNavigate } from 'react-router-dom';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [searchResults, setSearchResults] = useState<typeof games>([]);
  const navigate = useNavigate();

  // Effect for search functionality
  useEffect(() => {
    if (searchQuery) {
      const filteredGames = games.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredGames);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Effect to simulate online users
  useEffect(() => {
    // Generate a random number between 80 and 250
    const randomUsers = Math.floor(Math.random() * (250 - 80 + 1)) + 80;
    setOnlineUsers(randomUsers);

    // Simulate fluctuations in user count
    const interval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // Random number between -2 and 2
        const newCount = prev + change;
        return newCount > 50 ? newCount : 50;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectGame = (gameId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/game/${gameId}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 py-3 px-4 border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="https://cdn.discordapp.com/avatars/787701539174613022/70fa0aa8ca6d6e2568252e57d32d1b98.webp?size=1024&format=webp" 
            alt="Logo" 
            className="rounded-xl w-8 h-8 animate-pulse-glow"
          />
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <div 
              className={`flex items-center bg-secondary rounded-full overflow-hidden transition-all duration-300 ${searchOpen ? 'w-64' : 'w-10'}`}
              onClick={() => !searchOpen && setSearchOpen(true)}
            >
              <button className="p-2 text-white">
                <Search size={20} />
              </button>
              {searchOpen && (
                <>
                  <Input
                    type="text"
                    placeholder="Search games..."
                    className="bg-transparent border-none focus:outline-none text-white w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {searchOpen && searchQuery && (
              <div className="absolute top-12 right-0 w-64 bg-background border border-border rounded-md shadow-lg z-50">
                <Command>
                  <CommandList>
                    {searchResults.length > 0 ? (
                      <CommandGroup heading="Games">
                        {searchResults.map((game) => (
                          <CommandItem 
                            key={game.id} 
                            onSelect={() => handleSelectGame(game.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <img 
                                src={game.thumbnail} 
                                alt={game.title} 
                                className="w-8 h-8 object-cover rounded"
                              />
                              <div>
                                <p className="text-sm font-medium">{game.title}</p>
                                <p className="text-xs text-muted-foreground">{game.category}</p>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <CommandEmpty>No results found</CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
          
          {/* Online Users Counter */}
          <div className="bg-secondary/70 rounded-full px-3 py-1 flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-white">{onlineUsers} online</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
