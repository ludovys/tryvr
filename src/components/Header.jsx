import { memo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = memo(() => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if the current route matches the link
  const isActive = (path) => {
    if (path === '/games') {
      // Also highlight for game detail pages
      return location.pathname === path || location.pathname.startsWith('/game/');
    }
    return location.pathname === path;
  };

  return (
    <div className="sticky top-0 bg-white z-40 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between py-3">
          {/* Left section: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="logo-float">
                <img 
                  src={vrLogo} 
                  alt="TryVR Logo" 
                  className="h-8 w-8"
                  loading="eager"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                TryVR
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <Link 
              to="/" 
              className={`p-2 text-sm font-medium ${
                isActive('/') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-home mr-1"></i> Home
            </Link>
            <Link 
              to="/games" 
              className={`p-2 text-sm font-medium ${
                isActive('/games') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-gamepad mr-1"></i> Games
            </Link>
            <Link 
              to="/new" 
              className={`p-2 text-sm font-medium ${
                isActive('/new') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-plus-circle mr-1"></i> New
            </Link>
            <Link 
              to="/trending" 
              className={`p-2 text-sm font-medium ${
                isActive('/trending') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-chart-line mr-1"></i> Trending
            </Link>
            <Link 
              to="/updated" 
              className={`p-2 text-sm font-medium ${
                isActive('/updated') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-sync mr-1"></i> Updated
            </Link>
            <Link 
              to="/originals" 
              className={`p-2 text-sm font-medium ${
                isActive('/originals') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-star mr-1"></i> Originals
            </Link>
            <Link 
              to="/multiplayer" 
              className={`p-2 text-sm font-medium ${
                isActive('/multiplayer') 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-users mr-1"></i> Multiplayer
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Contact Link */}
            <Link 
              to="/contact" 
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors hidden md:flex items-center"
            >
              Contact us
            </Link>
            
            {/* Language Selector (simplified) */}
            <div className="hidden md:block">
              <button className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                English
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-indigo-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <i className="fas fa-times text-xl"></i>
              ) : (
                <i className="fas fa-bars text-xl"></i>
              )}
            </button>
          </div>
        </div>
        
        {/* Category Navigation - CrazyGames style */}
        <div className="hidden md:flex items-center space-x-4 py-2 border-t border-gray-100 overflow-x-auto">
          {['action', 'adventure', 'puzzle', 'simulation', 'sports', 'racing', 'casual', 'card', 'fps', 'horror', 'io', 'multiplayer'].map(category => (
            <Link 
              key={category}
              to={`/games?category=${category}`}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              <i className={`fas fa-${
                category === 'action' ? 'bolt' :
                category === 'adventure' ? 'mountain' :
                category === 'puzzle' ? 'puzzle-piece' :
                category === 'simulation' ? 'desktop' :
                category === 'sports' ? 'futbol' :
                category === 'racing' ? 'car' :
                category === 'casual' ? 'smile' :
                category === 'card' ? 'cards' :
                category === 'fps' ? 'crosshairs' :
                category === 'horror' ? 'ghost' :
                category === 'io' ? 'globe' :
                'gamepad'
              } mr-1`}></i>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Link>
          ))}
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-100 mt-3 animate-fadeIn">
            <div className="space-y-1 py-2">
              <Link 
                to="/" 
                className={`flex items-center px-4 py-2 text-base font-medium ${
                  isActive('/') 
                    ? 'text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-home mr-3 w-5 text-center"></i> Home
              </Link>
              <Link 
                to="/games" 
                className={`flex items-center px-4 py-2 text-base font-medium ${
                  isActive('/games') 
                    ? 'text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-gamepad mr-3 w-5 text-center"></i> Games
              </Link>
              {/* Add mobile categories similar to CrazyGames */}
              {['action', 'adventure', 'puzzle', 'simulation', 'sports', 'racing'].map(category => (
                <Link 
                  key={category}
                  to={`/games?category=${category}`}
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`fas fa-${
                    category === 'action' ? 'bolt' :
                    category === 'adventure' ? 'mountain' :
                    category === 'puzzle' ? 'puzzle-piece' :
                    category === 'simulation' ? 'desktop' :
                    category === 'sports' ? 'futbol' :
                    'car'
                  } mr-3 w-5 text-center`}></i>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Link>
              ))}
              <Link 
                to="/contact" 
                className={`flex items-center px-4 py-2 text-base font-medium ${
                  isActive('/contact') 
                    ? 'text-indigo-600' 
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-envelope mr-3 w-5 text-center"></i> Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header; 