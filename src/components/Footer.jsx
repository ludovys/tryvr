import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-purple-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={vrLogo} alt="TryVR Logo" className="h-10 w-10 mr-3" />
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">TryVR</h3>
            </div>
            <p className="mb-6 text-gray-400 max-w-md">
              Your gateway to browser-based VR gaming. Experience immersive virtual reality directly in your browser without the need for expensive hardware or downloads.
            </p>
            <div className="flex space-x-4 mb-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition p-2 bg-gray-800 rounded-full">
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition p-2 bg-gray-800 rounded-full">
                <i className="fab fa-discord text-lg"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition p-2 bg-gray-800 rounded-full">
                <i className="fab fa-github text-lg"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition p-2 bg-gray-800 rounded-full">
                <i className="fab fa-youtube text-lg"></i>
              </a>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-semibold uppercase text-gray-300 mb-2">Subscribe to our newsletter</h4>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l focus:outline-none focus:border-purple-500"
                />
                <button 
                  type="submit" 
                  className="vr-button px-4 py-2 rounded-r"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Home
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> All Games
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> About VR
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Contact
                </Link>
              </li>
              <li>
                <Link to="/admin-login" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Admin
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">Game Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/?category=action" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Action
                </Link>
              </li>
              <li>
                <Link to="/?category=adventure" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Adventure
                </Link>
              </li>
              <li>
                <Link to="/?category=simulation" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Simulation
                </Link>
              </li>
              <li>
                <Link to="/?category=puzzle" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Puzzle
                </Link>
              </li>
              <li>
                <Link to="/?category=racing" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Racing
                </Link>
              </li>
              <li>
                <Link to="/?category=sports" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Sports
                </Link>
              </li>
              <li>
                <Link to="/?category=shooter" className="text-gray-400 hover:text-purple-400 transition flex items-center">
                  <i className="fas fa-chevron-right mr-2 text-xs text-purple-500"></i> Shooter
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">&copy; {currentYear} TryVR. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-purple-400 transition">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-purple-400 transition">Terms of Service</Link>
            <Link to="/cookies" className="text-gray-500 hover:text-purple-400 transition">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 