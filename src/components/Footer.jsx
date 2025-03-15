import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-700 border-t border-purple-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img src={vrLogo} alt="TryVR Logo" className="h-10 w-10 mr-3" />
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">TryVR</h3>
            </div>
            <p className="mb-6 text-gray-600 max-w-md">
              Your gateway to browser-based VR gaming. Experience immersive virtual reality directly in your browser without the need for expensive hardware or downloads.
            </p>
            <div className="flex space-x-4 mb-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-400 transition p-2 bg-gray-200 rounded-full">
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-400 transition p-2 bg-gray-200 rounded-full">
                <i className="fab fa-discord text-lg"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-400 transition p-2 bg-gray-200 rounded-full">
                <i className="fab fa-github text-lg"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-400 transition p-2 bg-gray-200 rounded-full">
                <i className="fab fa-youtube text-lg"></i>
              </a>
            </div>
            <div className="bg-gray-200 p-4 rounded-lg">
              <h4 className="text-sm font-semibold uppercase text-gray-700 mb-2">Subscribe to our newsletter</h4>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-l focus:outline-none focus:border-purple-500"
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
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-purple-400 transition">Home</Link></li>
              <li><Link to="/games" className="hover:text-purple-400 transition">Games</Link></li>
              <li><Link to="/products" className="hover:text-purple-400 transition">Products</Link></li>
              <li><Link to="/about" className="hover:text-purple-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-purple-400 transition">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="hover:text-purple-400 transition">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-purple-400 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-600">
          <p>&copy; {currentYear} TryVR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 