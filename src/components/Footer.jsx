import { useState, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

// Tab configuration
const TABS = [
  { id: 'navigate', label: 'Navigate' },
  { id: 'support', label: 'Support' },
  { id: 'legal', label: 'Legal' },
  { id: 'social', label: 'Social' }
];

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState('navigate');

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'navigate':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link to="/games" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Browse Games
            </Link>
            <Link to="/games-showcase" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Games Showcase
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">
              About VR
            </Link>
            <Link to="/news" className="text-gray-600 hover:text-indigo-600 transition-colors">
              News
            </Link>
            <Link to="/blog" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Blog
            </Link>
          </div>
        );
      case 'support':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link to="/faq" className="text-gray-600 hover:text-indigo-600 transition-colors">
              FAQ
            </Link>
            <Link to="/help" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Help Center
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Contact Us
            </Link>
            <Link to="/feedback" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Feedback
            </Link>
            <Link to="/admin-login" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Admin Login
            </Link>
          </div>
        );
      case 'legal':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Cookie Policy
            </Link>
            <Link to="/licensing" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Licensing
            </Link>
          </div>
        );
      case 'social':
        return (
          <div className="flex flex-wrap gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
              <i className="fab fa-twitter text-lg mr-2"></i> Twitter
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
              <i className="fab fa-discord text-lg mr-2"></i> Discord
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
              <i className="fab fa-github text-lg mr-2"></i> GitHub
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
              <i className="fab fa-youtube text-lg mr-2"></i> YouTube
            </a>
          </div>
        );
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <footer className="site-footer">
      <div className="page-container">
        {/* Top section with newsletter */}
        <div className="flex flex-col md:flex-row gap-8 justify-between mb-8">
          <div className="max-w-md">
            <div className="flex items-center mb-4">
              <img src={vrLogo} alt="TryVR Logo" className="h-8 w-8 mr-3" loading="lazy" />
              <h3 className="text-xl font-bold text-indigo-600">TryVR</h3>
            </div>
            <p className="mb-4 text-gray-600">
              Experience immersive virtual reality directly in your browser. No expensive hardware or downloads required.
            </p>
          </div>
          
          <div className="max-w-md w-full">
            <h4 className="text-sm font-semibold uppercase text-gray-700 mb-3">Stay updated</h4>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email" 
                aria-label="Email for newsletter"
                className="flex-grow px-3 py-2 bg-gray-50 border border-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button 
                type="submit" 
                className="btn btn-primary rounded-l-none"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Tabbed navigation */}
        <div className="border-t border-gray-200 pt-8">
          {/* Tab navigation */}
          <div className="flex overflow-x-auto mb-6 border-b border-gray-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab content */}
          <div className="py-4" role="tabpanel">
            {tabContent}
          </div>
        </div>
        
        {/* Bottom credits */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {currentYear} TryVR. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-indigo-600 transition-colors">Cookies</Link>
            <Link to="/contact" className="hover:text-indigo-600 transition-colors font-medium">
              <i className="fas fa-envelope mr-2"></i>Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer; 