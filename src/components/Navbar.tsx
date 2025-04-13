
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
  const [onlineUsers, setOnlineUsers] = useState(1); // Start with 1 (current user)
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

  // Effect to track real online users
  useEffect(() => {
    // Create a unique session ID for this user
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Function to send heartbeat to indicate user is online
    const sendHeartbeat = () => {
      // Get current active users from localStorage
      const currentTime = new Date().getTime();
      let activeUsers = JSON.parse(localStorage.getItem('activeUsers') || '{}');
      
      // Clean up expired sessions (older than 1 minute)
      Object.keys(activeUsers).forEach(id => {
        if (currentTime - activeUsers[id] > 60000) {
          delete activeUsers[id];
        }
      });
      
      // Add this user's heartbeat
      activeUsers[sessionId] = currentTime;
      
      // Save back to localStorage
      localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
      
      // Update the counter
      setOnlineUsers(Object.keys(activeUsers).length);
    };
    
    // Send initial heartbeat
    sendHeartbeat();
    
    // Set up interval for regular heartbeats
    const heartbeatInterval = setInterval(sendHeartbeat, 10000); // Every 10 seconds
    
    return () => {
      clearInterval(heartbeatInterval);
      
      // Clean up this user from active users on unmount
      const activeUsers = JSON.parse(localStorage.getItem('activeUsers') || '{}');
      delete activeUsers[sessionId];
      localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
    };
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
              style={{ cursor: 'pointer' }}
            >
              <button className="p-2 text-white" style={{ cursor: 'pointer' }}>
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
                    style={{ cursor: 'text' }}
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
                            style={{ cursor: 'pointer' }}
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
