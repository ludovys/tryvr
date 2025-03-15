import { memo } from 'react';
import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();
  
  // Categories for the footer like in CrazyGames
  const categories = [
    { name: 'Action', to: '/games?category=action' },
    { name: 'Adventure', to: '/games?category=adventure' },
    { name: 'Puzzle', to: '/games?category=puzzle' },
    { name: 'Simulation', to: '/games?category=simulation' },
    { name: 'Sports', to: '/games?category=sports' },
    { name: 'Racing', to: '/games?category=racing' },
    { name: 'Card', to: '/games?category=card' },
    { name: 'Casual', to: '/games?category=casual' },
    { name: 'Clicker', to: '/games?category=clicker' },
    { name: 'FPS', to: '/games?category=fps' },
    { name: 'Horror', to: '/games?category=horror' },
    { name: '.io', to: '/games?category=io' },
    { name: 'Multiplayer', to: '/games?category=multiplayer' },
    { name: 'Shooting', to: '/games?category=shooting' }
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800 pt-12 pb-8">
      <div className="page-container">
        {/* About TryVR */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg mr-3">
              <img src={vrLogo} alt="TryVR Logo" className="h-8 w-8" loading="lazy" />
            </div>
            <h3 className="text-2xl font-bold text-white">TryVR</h3>
          </div>
          <p className="text-gray-300 max-w-3xl">
            TryVR is a free browser gaming platform for VR experiences. Our mission is to create a browser-gaming platform that works seamlessly for users around the world, without requiring expensive hardware.
          </p>
          <div className="mt-6">
            <Link 
              to="/about" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <i className="fas fa-info-circle mr-2"></i> Learn more
            </Link>
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-12">
          <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-800 pb-2">Game Categories</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => (
              <Link 
                key={category.name}
                to={category.to}
                className="text-gray-400 hover:text-indigo-400 transition-colors text-sm"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Best Games */}
        <div className="mb-12">
          <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-800 pb-2">Play our Best Games</h4>
          <p className="text-gray-300 mb-4">
            TryVR has over 500 immersive VR games in every genre you can imagine. Our most popular games include Virtual Racing, Space Explorer, and Puzzle Quest VR.
          </p>
          <h5 className="text-base font-semibold mb-2 mt-6 text-indigo-300">Explore by Genre</h5>
          <p className="text-gray-300 mb-4">
            You'll find the main categories like action, adventure, and puzzle games at the top of any page. Popular tags include racing games, multiplayer, horror, and simulation.
          </p>
          <Link to="/contact" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors">
            <i className="fas fa-lightbulb mr-2"></i> Suggest a Game
          </Link>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-wrap gap-6">
            <Link to="/about" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">About</Link>
            <Link to="/developers" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Developers</Link>
            <Link to="/contact" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Contact us</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Privacy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">Terms & conditions</Link>
            <Link to="/games" className="text-gray-400 hover:text-indigo-400 transition-colors text-sm">All games</Link>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            © {currentYear} TryVR. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer; 