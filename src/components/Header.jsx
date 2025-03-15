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
      <div className="page-container py-3">
        <div className="flex items-center justify-between">
          {/* Left section: Logo and navigation */}
          <div className="flex items-center">
            {/* Logo with Name */}
            <Link to="/" className="flex items-center space-x-3 group mr-8">
              <div className="logo-float">
                <img 
                  src={vrLogo} 
                  alt="TryVR Logo" 
                  className="h-10 w-10"
                  loading="eager"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                TryVR
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/games" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/games') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                Games
              </Link>
              <Link 
                to="/games-showcase" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/games-showcase') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                Showcase
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/about') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                About
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Contact Link */}
            <Link 
              to="/contact" 
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors hidden md:flex items-center"
            >
              <i className="fas fa-envelope mr-2"></i>
              Contact
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-3 border-t border-gray-100 mt-3 animate-fadeIn">
            <div className="space-y-1 py-2">
              <Link 
                to="/" 
                className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-colors ${
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
                className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-colors ${
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
                className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-colors ${
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
                className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/about') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-info-circle mr-3 w-5 text-center"></i> About
              </Link>
              <Link 
                to="/contact" 
                className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
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