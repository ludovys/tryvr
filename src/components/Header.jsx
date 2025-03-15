import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if the current route matches the link
  const isActive = (path) => {
    if (path === '/games') {
      // Also highlight for game detail pages
      return location.pathname === path || location.pathname.startsWith('/game/');
    }
    return location.pathname === path;
  };

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`vr-header-bg fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'py-2 bg-opacity-90 backdrop-blur-md' : 'py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <div className={`vr-float transition-all duration-300 ${isScrolled ? 'mr-2' : 'mr-4'}`}>
              <img 
                src={vrLogo} 
                alt="TryVR Logo" 
                className={`transition-all duration-300 ${isScrolled ? 'h-12 w-12' : 'h-16 w-16'}`} 
              />
            </div>
            <div>
              <h1 className={`font-bold vr-text-3d transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
                TryVR
              </h1>
              <p className={`transition-all duration-300 ${isScrolled ? 'text-sm' : 'mt-1'}`}>
                Experience Virtual Reality Like Never Before
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`vr-button px-4 py-2 rounded-lg transition ${
                isActive('/') 
                  ? 'bg-purple-500 text-white pulse' 
                  : 'bg-gray-200 hover:bg-purple-400 text-gray-800'
              }`}
            >
              <i className="fas fa-home mr-2"></i> Home
            </Link>
            <Link 
              to="/games" 
              className={`vr-button px-4 py-2 rounded-lg transition ${
                isActive('/games') 
                  ? 'bg-purple-500 text-white pulse' 
                  : 'bg-gray-200 hover:bg-purple-400 text-gray-800'
              }`}
            >
              <i className="fas fa-gamepad mr-2"></i> Games
            </Link>
            <Link 
              to="/games-showcase" 
              className={`vr-button px-4 py-2 rounded-lg transition ${
                isActive('/games-showcase') 
                  ? 'bg-purple-500 text-white pulse' 
                  : 'bg-gray-200 hover:bg-purple-400 text-gray-800'
              }`}
            >
              <i className="fas fa-th-large mr-2"></i> Games Showcase
            </Link>
            <Link 
              to="/games-without-images" 
              className={`vr-button px-4 py-2 rounded-lg transition ${
                isActive('/games-without-images') 
                  ? 'bg-purple-500 text-white pulse' 
                  : 'bg-gray-200 hover:bg-purple-400 text-gray-800'
              }`}
            >
              <i className="fas fa-image-slash mr-2"></i> Missing Images
            </Link>
            <Link 
              to="/about" 
              className={`vr-button px-4 py-2 rounded-lg transition ${
                isActive('/about') 
                  ? 'bg-purple-500 text-white pulse' 
                  : 'bg-gray-200 hover:bg-purple-400 text-gray-800'
              }`}
            >
              <i className="fas fa-info-circle mr-2"></i> About VR
            </Link>
            <Link 
              to="/admin-login" 
              className="vr-button px-4 py-2 rounded-lg bg-gray-800/70 hover:bg-gray-700 transition text-gray-200"
            >
              <i className="fas fa-user-shield mr-2"></i> Admin
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-lg hover:bg-gray-800/50 transition"
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
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`vr-button px-4 py-2 rounded-lg transition ${
                  isActive('/') 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800/70 hover:bg-purple-700 text-gray-200'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-home mr-2"></i> Home
              </Link>
              <Link 
                to="/games" 
                className={`vr-button px-4 py-2 rounded-lg transition ${
                  isActive('/games') 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800/70 hover:bg-purple-700 text-gray-200'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-gamepad mr-2"></i> Games
              </Link>
              <Link 
                to="/games-showcase" 
                className={`vr-button px-4 py-2 rounded-lg transition ${
                  isActive('/games-showcase') 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800/70 hover:bg-purple-700 text-gray-200'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-th-large mr-2"></i> Games Showcase
              </Link>
              <Link 
                to="/games-without-images" 
                className={`vr-button px-4 py-3 rounded-lg text-lg transition ${
                  isActive('/games-without-images') ? 'bg-purple-600 text-white pulse' : 'bg-gray-800/70 text-gray-200'
                }`}
                onClick={toggleMobileMenu}
              >
                <i className="fas fa-image-slash mr-2"></i> Missing Images
              </Link>
              <Link 
                to="/about" 
                className={`vr-button px-4 py-2 rounded-lg transition ${
                  isActive('/about') 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800/70 hover:bg-purple-700 text-gray-200'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-info-circle mr-2"></i> About VR
              </Link>
              <Link 
                to="/admin-login" 
                className="vr-button px-4 py-2 rounded-lg bg-gray-800/70 hover:bg-gray-700 transition text-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-user-shield mr-2"></i> Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 