import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  Share2, 
  MessageSquare, 
  ArrowLeft, 
  Gamepad, 
  Users,
  Clock, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { games } from '@/data/games';

// Sample game data - in a real app this would come from an API
const GAME_DATA = {
  '1': {
    id: '1',
    title: 'Space Invaders',
    description: 'Classic space shooting game where you defend Earth from alien invaders. Control your ship, dodge enemy fire, and shoot down waves of aliens before they reach the bottom of the screen. Featuring retro pixel graphics and addictive gameplay that has stood the test of time.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    category: 'Action',
    releaseDate: '2023-05-15',
    developer: 'GameHub Studios',
    players: '12,452 active players',
    rating: 4.8,
    reviews: 243,
    instructions: 'Use arrow keys to move left and right. Press spacebar to shoot. Avoid enemy projectiles and destroy all aliens to advance to the next level.',
    similarGames: ['2', '4', '7']
  },
  '2': {
    id: '2',
    title: 'Puzzle Master',
    description: 'Challenging puzzle game that tests your logical thinking and problem-solving skills. Complete increasingly difficult puzzles with limited moves and unlock new levels as you progress.',
    thumbnail: 'https://images.unsplash.com/photo-1522069213448-443a614da9b6',
    category: 'Puzzle',
    releaseDate: '2023-08-22',
    developer: 'Brain Games Inc',
    players: '8,921 active players',
    rating: 4.6,
    reviews: 187,
    instructions: 'Click or tap pieces to move them. Create patterns to clear the board. Complete the level with minimum moves for bonus points.',
    similarGames: ['5', '8', '3']
  }
};

const GameDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [gameUrl, setGameUrl] = useState("");

  useEffect(() => {
    // Simulate API fetch for game details
    const fetchData = () => {
      setIsLoading(true);
      setTimeout(() => {
        if (gameId && GAME_DATA[gameId as keyof typeof GAME_DATA]) {
          setGame(GAME_DATA[gameId as keyof typeof GAME_DATA]);
        }
        
        // Find actual game URL from the games data
        const actualGame = games.find(g => g.id === gameId);
        if (actualGame) {
          setGameUrl(actualGame.url);
        }
        
        setIsLoading(false);
      }, 500);
    };

    fetchData();
  }, [gameId]);

  const handlePlayGame = () => {
    if (gameUrl) {
      window.open(gameUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-gaming-purple/30 border-t-gaming-purple rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-28 container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
          <p className="mb-8">Sorry, the game you are looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button className="bg-gaming-purple hover:bg-gaming-purple/90">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-16">
        {/* Game Header */}
        <div className="relative h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f')] bg-cover bg-center opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"></div>
          
          <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
            <div className="w-full max-w-4xl mx-auto">
              <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-white transition-colors mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
              </Link>
              
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gaming-purple/50 animate-pulse-glow">
                  <img src={game?.thumbnail} alt={game?.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow text-left">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-gaming-purple/90 text-xs px-2 py-1 rounded-full text-white">
                      {game?.category}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" /> {game?.players}
                    </div>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold">{game?.title}</h1>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex space-x-1 mr-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                            fill={star <= Math.round(game?.rating || 0) ? "#9b87f5" : "#2A2D3A"} 
                            stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm">{game?.rating} ({game?.reviews} reviews)</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button onClick={() => setLiked(!liked)} variant="outline" size="icon" className={`rounded-full ${liked ? 'text-red-500 border-red-500' : 'text-muted-foreground'}`}>
                    <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full text-muted-foreground">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full text-muted-foreground">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Game Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Button 
                className="bg-gaming-purple hover:bg-gaming-purple/90 text-white w-full sm:w-auto"
                onClick={handlePlayGame}
              >
                <Play className="mr-2 h-5 w-5" /> Play Now
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 text-left">
                <div className="bg-secondary/30 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">About the Game</h2>
                  <p className="text-muted-foreground">
                    {game?.description}
                  </p>
                </div>
                
                <div className="bg-secondary/30 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-4">How to Play</h2>
                  <p className="text-muted-foreground mb-6">
                    {game?.instructions}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                      <div className="bg-gaming-purple/20 rounded-full p-2 mr-4">
                        <Gamepad className="h-5 w-5 text-gaming-purple" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Controls</p>
                        <p className="font-medium">Keyboard & Mouse</p>
                      </div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 flex items-center">
                      <div className="bg-gaming-purple/20 rounded-full p-2 mr-4">
                        <Clock className="h-5 w-5 text-gaming-purple" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Game Time</p>
                        <p className="font-medium">5-10 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-1">
                <div className="bg-secondary/30 rounded-xl p-6 mb-6 text-left">
                  <h3 className="text-lg font-semibold mb-4">Game Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Developer</span>
                      <span>{game?.developer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Release Date</span>
                      <span>{game?.releaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span>{game?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform</span>
                      <span>Web Browser</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-6 text-left">
                  <h3 className="text-lg font-semibold mb-4">Similar Games</h3>
                  <div className="space-y-3">
                    {game?.similarGames.map((gameId: string) => {
                      const similarGame = GAME_DATA[gameId as keyof typeof GAME_DATA];
                      if (!similarGame) return null;
                      
                      return (
                        <Link to={`/game/${similarGame.id}`} key={similarGame.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <img src={similarGame.thumbnail} alt={similarGame.title} className="w-12 h-12 object-cover rounded-md" />
                          <div className="flex-grow">
                            <h4 className="font-medium">{similarGame.title}</h4>
                            <p className="text-xs text-muted-foreground">{similarGame.category}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GameDetail;
