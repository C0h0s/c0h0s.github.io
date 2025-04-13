
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
      </div>
    </nav>
  );
};

export default Navbar;
