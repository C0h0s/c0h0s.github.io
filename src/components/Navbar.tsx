
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-background/80 py-3 px-4 border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gaming-purple rounded-xl w-8 h-8 flex items-center justify-center animate-pulse-glow">
            <span className="font-bold text-white">G</span>
          </div>
          <span className="font-bold text-xl text-white">c0h0s games</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
