import { memo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import vrLogo from '../assets/vr-logo.svg';

const Header = memo(() => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

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
    return location.pathname === path;
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isDarkMode
        ? isScrolled 
          ? 'bg-[#181A2A]/95 backdrop-blur-md shadow-lg' 
          : 'bg-[#181A2A]'
        : isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between">
          {/* Left section: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <img 
                src={vrLogo}
                alt="TryVR Logo" 
                className="h-10 w-10 logo-float" 
              />
              <span className={`font-bold text-2xl`}>
                <span className="text-[#4B6BFB]">Try</span><span className={`text-[#FF6B35]`}>VR</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-base font-medium transition-colors ${
                isActive('/') 
                  ? isDarkMode ? 'text-white' : 'text-[#181A2A]' 
                  : isDarkMode ? 'text-white hover:text-[#4B6BFB]' : 'text-[#3B3C4A] hover:text-[#4B6BFB]'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/games" 
              className={`text-base font-medium transition-colors ${
                isActive('/games') 
                  ? isDarkMode ? 'text-white' : 'text-[#181A2A]' 
                  : isDarkMode ? 'text-white hover:text-[#4B6BFB]' : 'text-[#3B3C4A] hover:text-[#4B6BFB]'
              }`}
            >
              Games
            </Link>
            <Link 
              to="/games-showcase" 
              className={`text-base font-medium transition-colors ${
                isActive('/games-showcase') 
                  ? isDarkMode ? 'text-white' : 'text-[#181A2A]' 
                  : isDarkMode ? 'text-white hover:text-[#4B6BFB]' : 'text-[#3B3C4A] hover:text-[#4B6BFB]'
              }`}
            >
              Showcase
            </Link>
            <Link 
              to="/games-without-images" 
              className={`text-base font-medium transition-colors ${
                isActive('/games-without-images') 
                  ? isDarkMode ? 'text-white' : 'text-[#181A2A]' 
                  : isDarkMode ? 'text-white hover:text-[#4B6BFB]' : 'text-[#3B3C4A] hover:text-[#4B6BFB]'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin-login" 
              className={`text-base font-medium transition-colors ${
                isActive('/admin-login') 
                  ? isDarkMode ? 'text-white' : 'text-[#181A2A]' 
                  : isDarkMode ? 'text-white hover:text-[#4B6BFB]' : 'text-[#3B3C4A] hover:text-[#4B6BFB]'
              }`}
            >
              Admin
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className={`hidden md:flex items-center ${isDarkMode ? 'bg-[#242535]' : 'bg-[#F4F4F5]'} rounded-md px-4 py-2`}>
              <input 
                type="text" 
                placeholder="Search" 
                className={`bg-transparent ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm focus:outline-none w-32`}
              />
              <button className="text-gray-400 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="hidden md:flex items-center justify-center w-10 h-5 bg-[#4B6BFB] rounded-full relative"
            >
              <div className={`absolute w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-5' : '-translate-x-5'}`}>
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4B6BFB]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md ${isDarkMode ? 'text-white hover:bg-[#242535]' : 'text-[#181A2A] hover:bg-[#F4F4F5]'} focus:outline-none`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className={`md:hidden py-4 mt-4 border-t ${isDarkMode ? 'border-[#242535]' : 'border-[#E8E8EA]'} animate-fadeIn`}>
            <div className="space-y-3">
              <Link 
                to="/" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/') 
                    ? isDarkMode ? 'bg-[#4B6BFB] text-white' : 'bg-[#4B6BFB] text-white'
                    : isDarkMode ? 'text-white hover:bg-[#242535]' : 'text-[#3B3C4A] hover:bg-[#F4F4F5]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/games" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/games') 
                    ? isDarkMode ? 'bg-[#4B6BFB] text-white' : 'bg-[#4B6BFB] text-white'
                    : isDarkMode ? 'text-white hover:bg-[#242535]' : 'text-[#3B3C4A] hover:bg-[#F4F4F5]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Games
              </Link>
              <Link 
                to="/games-showcase" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/games-showcase') 
                    ? isDarkMode ? 'bg-[#4B6BFB] text-white' : 'bg-[#4B6BFB] text-white'
                    : isDarkMode ? 'text-white hover:bg-[#242535]' : 'text-[#3B3C4A] hover:bg-[#F4F4F5]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Showcase
              </Link>
              <Link 
                to="/games-without-images" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/games-without-images') 
                    ? isDarkMode ? 'bg-[#4B6BFB] text-white' : 'bg-[#4B6BFB] text-white'
                    : isDarkMode ? 'text-white hover:bg-[#242535]' : 'text-[#3B3C4A] hover:bg-[#F4F4F5]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin-login" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/admin-login') 
                    ? isDarkMode ? 'bg-[#4B6BFB] text-white' : 'bg-[#4B6BFB] text-white'
                    : isDarkMode ? 'text-white hover:bg-[#242535]' : 'text-[#3B3C4A] hover:bg-[#F4F4F5]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
              
              {/* Mobile Search */}
              <div className="px-4 py-2">
                <div className={`flex items-center ${isDarkMode ? 'bg-[#242535]' : 'bg-[#F4F4F5]'} rounded-md px-3 py-2`}>
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className={`bg-transparent ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm focus:outline-none w-full`}
                  />
                  <button className="text-gray-400 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Mobile Dark Mode Toggle */}
              <div className="px-4 py-2 flex items-center">
                <span className={`${isDarkMode ? 'text-white' : 'text-[#181A2A]'} text-sm mr-3`}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-10 h-5 bg-[#4B6BFB] rounded-full relative"
                >
                  <div className={`absolute w-4 h-4 bg-white rounded-full shadow-md transition-transform ${isDarkMode ? 'translate-x-5' : '-translate-x-5'}`}>
                    {isDarkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4B6BFB]" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
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