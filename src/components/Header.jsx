import { memo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = memo(() => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you would apply dark mode to the entire site here
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#181A2A]/95 backdrop-blur-md shadow-lg' 
        : 'bg-[#181A2A]'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between">
          {/* Left section: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="text-white font-bold text-2xl">
                <span className="text-[#4B6BFB]">Meta</span>Blog
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'text-white' 
                  : 'text-white hover:text-[#4B6BFB]'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/blog" 
              className={`text-base font-medium transition-colors ${
                isActive('/blog') 
                  ? 'text-white' 
                  : 'text-white hover:text-[#4B6BFB]'
              }`}
            >
              Blog
            </Link>
            <Link 
              to="/single-post" 
              className={`text-base font-medium transition-colors ${
                isActive('/single-post') 
                  ? 'text-white' 
                  : 'text-white hover:text-[#4B6BFB]'
              }`}
            >
              Single Post
            </Link>
            <Link 
              to="/pages" 
              className={`text-base font-medium transition-colors ${
                isActive('/pages') 
                  ? 'text-white' 
                  : 'text-white hover:text-[#4B6BFB]'
              }`}
            >
              Pages
            </Link>
            <Link 
              to="/contact" 
              className={`text-base font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-white' 
                  : 'text-white hover:text-[#4B6BFB]'
              }`}
            >
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="hidden md:flex items-center bg-[#242535] rounded-md px-4 py-2">
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent text-gray-300 text-sm focus:outline-none w-32"
              />
              <button className="text-gray-400 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
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
              className="md:hidden p-2 rounded-md text-white hover:bg-[#242535] focus:outline-none"
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
          <nav className="md:hidden py-4 mt-4 border-t border-[#242535] animate-fadeIn">
            <div className="space-y-3">
              <Link 
                to="/" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/') 
                    ? 'bg-[#4B6BFB] text-white' 
                    : 'text-white hover:bg-[#242535]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/blog" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/blog') 
                    ? 'bg-[#4B6BFB] text-white' 
                    : 'text-white hover:bg-[#242535]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/single-post" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/single-post') 
                    ? 'bg-[#4B6BFB] text-white' 
                    : 'text-white hover:bg-[#242535]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Single Post
              </Link>
              <Link 
                to="/pages" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/pages') 
                    ? 'bg-[#4B6BFB] text-white' 
                    : 'text-white hover:bg-[#242535]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pages
              </Link>
              <Link 
                to="/contact" 
                className={`block px-4 py-2 text-base font-medium rounded-md ${
                  isActive('/contact') 
                    ? 'bg-[#4B6BFB] text-white' 
                    : 'text-white hover:bg-[#242535]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Search */}
              <div className="px-4 py-2">
                <div className="flex items-center bg-[#242535] rounded-md px-3 py-2">
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="bg-transparent text-gray-300 text-sm focus:outline-none w-full"
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
                <span className="text-white text-sm mr-3">Dark Mode</span>
                <button 
                  onClick={toggleDarkMode}
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