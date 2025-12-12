import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Map, Home, Calendar, Backpack, ScrollText } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItemClass = (path: string) => `
    flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
    ${isActive(path) 
      ? 'text-wander-accent -translate-y-4 scale-110 drop-shadow-[0_10px_15px_rgba(238,186,77,0.4)]' 
      : 'text-gray-400 hover:text-white hover:-translate-y-1'}
  `;

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4 z-50 shadow-2xl">
      <div className="flex items-center space-x-6 md:space-x-8">
        <Link to="/" className={navItemClass('/')}>
          <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className={`text-[10px] md:text-xs mt-1 transition-opacity duration-300 ${isActive('/') ? 'opacity-100 font-bold' : 'opacity-70'}`}>Home</span>
        </Link>
        <Link to="/explore" className={navItemClass('/explore')}>
          <Compass size={24} strokeWidth={isActive('/explore') ? 2.5 : 2} />
          <span className={`text-[10px] md:text-xs mt-1 transition-opacity duration-300 ${isActive('/explore') ? 'opacity-100 font-bold' : 'opacity-70'}`}>Explore</span>
        </Link>
        <Link to="/planner" className={navItemClass('/planner')}>
          <Calendar size={24} strokeWidth={isActive('/planner') ? 2.5 : 2} />
          <span className={`text-[10px] md:text-xs mt-1 transition-opacity duration-300 ${isActive('/planner') ? 'opacity-100 font-bold' : 'opacity-70'}`}>Plan</span>
        </Link>
        <Link to="/maps" className={navItemClass('/maps')}>
          <Map size={24} strokeWidth={isActive('/maps') ? 2.5 : 2} />
          <span className={`text-[10px] md:text-xs mt-1 transition-opacity duration-300 ${isActive('/maps') ? 'opacity-100 font-bold' : 'opacity-70'}`}>Maps</span>
        </Link>
        <Link to="/packing" className={navItemClass('/packing')}>
          <Backpack size={24} strokeWidth={isActive('/packing') ? 2.5 : 2} />
          <span className={`text-[10px] md:text-xs mt-1 transition-opacity duration-300 ${isActive('/packing') ? 'opacity-100 font-bold' : 'opacity-70'}`}>Pack</span>
        </Link>
        <Link to="/culture" className={navItemClass('/culture')}>
          <ScrollText size={24} strokeWidth={isActive('/culture') ? 2.5 : 2} />
          <span className={`text-[10px] md:text-xs mt-1 transition-opacity duration-300 ${isActive('/culture') ? 'opacity-100 font-bold' : 'opacity-70'}`}>Culture</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;