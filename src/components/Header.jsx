import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="page-container">
        <div className="flex items-center justify-center py-4">
          {/* Logo Only */}
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
        </div>
      </div>
    </header>
  );
};

export default Header; 