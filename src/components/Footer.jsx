import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and info column */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-5">
              <img src={vrLogo} alt="TryVR Logo" className="h-8 w-8 mr-3" />
              <h3 className="text-xl font-bold text-indigo-600">TryVR</h3>
            </div>
            <p className="mb-6 text-gray-600 max-w-md">
              Experience immersive virtual reality directly in your browser. TryVR brings you the best browser-based VR games without the need for expensive hardware or downloads.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-3 mb-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-500 transition-colors">
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-500 transition-colors">
                <i className="fab fa-discord text-lg"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-500 transition-colors">
                <i className="fab fa-github text-lg"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-500 transition-colors">
                <i className="fab fa-youtube text-lg"></i>
              </a>
            </div>
            
            {/* Newsletter signup */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-semibold uppercase text-gray-700 mb-3">Stay updated</h4>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
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
          
          {/* Quick links */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-gray-800">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Browse Games
                </Link>
              </li>
              <li>
                <Link to="/games-showcase" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Games Showcase
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  About VR
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support links */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-gray-800">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/admin-login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom credits */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {currentYear} TryVR. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-indigo-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 