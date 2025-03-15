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
      if (window.scrollY > 20) {
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
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="page-container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="logo-float">
              <img 
                src={vrLogo} 
                alt="TryVR Logo" 
                className="h-10 w-10"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                TryVR
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Browser-based VR experiences
              </p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-home mr-2"></i> Home
            </Link>
            <Link 
              to="/games" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/games') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-gamepad mr-2"></i> Games
            </Link>
            <Link 
              to="/games-showcase" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/games-showcase') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-th-large mr-2"></i> Showcase
            </Link>
            <Link 
              to="/about" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <i className="fas fa-info-circle mr-2"></i> About
            </Link>
          </nav>
          
          {/* Right side - Login & CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Link 
              to="/admin-login" 
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2"
            >
              <i className="fas fa-user-shield mr-2"></i> Admin
            </Link>
            <Link
              to="/games"
              className="btn btn-primary"
            >
              <i className="fas fa-vr-cardboard mr-2"></i> Try VR Now
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-50 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <i className="fas fa-times text-xl"></i>
            ) : (
              <i className="fas fa-bars text-xl"></i>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-100 animate-fadeIn">
            <div className="space-y-1 py-2">
              <Link 
                to="/" 
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-home mr-3 w-5 text-center"></i> Home
              </Link>
              <Link 
                to="/games" 
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/games') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-gamepad mr-3 w-5 text-center"></i> Games
              </Link>
              <Link 
                to="/games-showcase" 
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/games-showcase') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-th-large mr-3 w-5 text-center"></i> Showcase
              </Link>
              <Link 
                to="/about" 
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive('/about') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-info-circle mr-3 w-5 text-center"></i> About
              </Link>
              
              <div className="pt-4 pb-2">
                <div className="flex items-center px-4">
                  <Link 
                    to="/admin-login" 
                    className="flex items-center text-base font-medium text-gray-700 hover:text-indigo-600 px-3 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-user-shield mr-2"></i> Admin
                  </Link>
                </div>
                <div className="mt-3 px-4">
                  <Link
                    to="/games"
                    className="btn btn-primary w-full justify-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-vr-cardboard mr-2"></i> Try VR Now
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 