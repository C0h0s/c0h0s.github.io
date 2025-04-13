
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 py-3 px-4 border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gaming-purple rounded-xl w-8 h-8 flex items-center justify-center animate-pulse-glow">
            <span className="font-bold text-white">G</span>
          </div>
          <span className="font-bold text-xl text-white">GameHub</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Popular
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            New
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Categories
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search games..."
              className="pl-9 w-[200px] bg-secondary/50 border-none"
            />
          </div>
          <Button variant="default" className="bg-gaming-purple hover:bg-gaming-purple/90 text-white">
            Sign In
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
