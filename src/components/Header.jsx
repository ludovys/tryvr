import { memo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = memo(() => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if the current route matches the link
  const isActive = (path) => {
    if (path === '/games') {
      // Also highlight for game detail pages
      return location.pathname === path || location.pathname.startsWith('/game/');
    }
    return location.pathname === path;
  };

  // Categories with their icons
  const categories = [
    { name: 'action', icon: 'bolt' },
    { name: 'adventure', icon: 'mountain' },
    { name: 'puzzle', icon: 'puzzle-piece' },
    { name: 'simulation', icon: 'desktop' },
    { name: 'sports', icon: 'futbol' },
    { name: 'racing', icon: 'car' },
    { name: 'casual', icon: 'smile' },
    { name: 'card', icon: 'cards' },
    { name: 'fps', icon: 'crosshairs' },
    { name: 'horror', icon: 'ghost' },
    { name: 'io', icon: 'globe' },
    { name: 'multiplayer', icon: 'users' }
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' 
        : 'bg-gray-900'
    }`}>
      <div className="page-container">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Left section: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="logo-float bg-indigo-600 p-2 rounded-lg shadow-lg">
                <img 
                  src={vrLogo} 
                  alt="TryVR Logo" 
                  className="h-8 w-8"
                  loading="eager"
                />
              </div>
              <h1 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                TryVR
              </h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className="fas fa-home mr-2"></i> Home
            </Link>
            <Link 
              to="/games" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/games') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className="fas fa-gamepad mr-2"></i> Games
            </Link>
            <Link 
              to="/new" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/new') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className="fas fa-plus-circle mr-2"></i> New
            </Link>
            <Link 
              to="/trending" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/trending') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className="fas fa-chart-line mr-2"></i> Trending
            </Link>
            <Link 
              to="/updated" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/updated') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className="fas fa-sync mr-2"></i> Updated
            </Link>
            <Link 
              to="/originals" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/originals') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className="fas fa-star mr-2"></i> Originals
            </Link>
            <Link 
              to="/multiplayer" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/multiplayer') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <i className="fas fa-users mr-2"></i> Multiplayer
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button className="hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              <i className="fas fa-search mr-2"></i> Search
            </button>
            
            {/* Contact Link */}
            <Link 
              to="/contact" 
              className="hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <i className="fas fa-envelope mr-2"></i> Contact
            </Link>
            
            {/* Language Selector (simplified) */}
            <div className="hidden md:block relative">
              <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                <i className="fas fa-globe mr-2"></i> English
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none"
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
        
        {/* Category Navigation */}
        <div className="hidden md:flex items-center space-x-1 py-2 overflow-x-auto category-nav">
          {categories.map(category => (
            <Link 
              key={category.name}
              to={`/games?category=${category.name}`}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                location.search.includes(`category=${category.name}`)
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <i className={`fas fa-${category.icon} mr-2`}></i>
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </Link>
          ))}
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-800 mt-3 animate-fadeIn">
            <div className="space-y-1 py-2">
              <Link 
                to="/" 
                className={`flex items-center px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/') 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-home mr-3 w-5 text-center"></i> Home
              </Link>
              <Link 
                to="/games" 
                className={`flex items-center px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/games') 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-gamepad mr-3 w-5 text-center"></i> Games
              </Link>
              <Link 
                to="/new" 
                className={`flex items-center px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/new') 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-plus-circle mr-3 w-5 text-center"></i> New
              </Link>
              <Link 
                to="/trending" 
                className={`flex items-center px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/trending') 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-chart-line mr-3 w-5 text-center"></i> Trending
              </Link>
              
              {/* Mobile Categories */}
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </div>
                <div className="mt-2 space-y-1">
                  {categories.slice(0, 8).map(category => (
                    <Link 
                      key={category.name}
                      to={`/games?category=${category.name}`}
                      className="flex items-center px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className={`fas fa-${category.icon} mr-3 w-5 text-center`}></i>
                      {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 pb-2">
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  More
                </div>
                <div className="mt-2 space-y-1">
                  <Link 
                    to="/contact" 
                    className="flex items-center px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-envelope mr-3 w-5 text-center"></i> Contact
                  </Link>
                  <button 
                    className="flex items-center px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md w-full text-left"
                  >
                    <i className="fas fa-globe mr-3 w-5 text-center"></i> English
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header; 