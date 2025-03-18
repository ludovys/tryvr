import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const { isDarkMode } = useTheme();
  
  // Categories for the footer
  const categories = [
    { name: 'VR Headsets', to: '/category/vr-headsets' },
    { name: 'Action Games', to: '/category/action' },
    { name: 'Adventure', to: '/category/adventure' },
    { name: 'Simulation', to: '/category/simulation' },
    { name: 'Puzzle', to: '/category/puzzle' },
    { name: 'Multiplayer', to: '/category/multiplayer' }
  ];

  // Quick links
  const quickLinks = [
    { name: 'Home', to: '/' },
    { name: 'Games', to: '/games' },
    { name: 'Showcase', to: '/games-showcase' },
    { name: 'Dashboard', to: '/games-without-images' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' }
  ];

  // Handle newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log(`Subscribing email: ${email}`);
    setEmail('');
    // Show success message
    alert('Thank you for subscribing!');
  };

  return (
    <footer className={`${isDarkMode ? 'bg-[#141624] border-[#242535]' : 'bg-[#F6F6F7] border-[#E8E8EA]'} border-t pt-8 sm:pt-12 md:pt-16`}>
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-16">
          {/* About Section */}
          <div className="space-y-3 md:space-y-4">
            <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#181A2A]'} mb-3 md:mb-4`}>About</h3>
            <p className={`${isDarkMode ? 'text-[#97989F]' : 'text-[#696A75]'} text-sm md:text-base`}>
              TryVR is your gateway to immersive virtual reality experiences. Browse our collection of VR games and play them directly in your browser without any downloads or installations.
            </p>
            <div className="space-y-1 md:space-y-2">
              <p className={`${isDarkMode ? 'text-white' : 'text-[#181A2A]'} font-semibold text-sm md:text-base`}>Email : contact@tryvr.com</p>
              <p className={`${isDarkMode ? 'text-white' : 'text-[#181A2A]'} font-semibold text-sm md:text-base`}>Discord : TryVR Community</p>
            </div>
          </div>
          
          {/* Quick Links and Categories */}
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {/* Quick Links */}
            <div>
              <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#181A2A]'} mb-3 md:mb-4`}>Quick Link</h3>
              <ul className="space-y-1 md:space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.to} 
                      className={`${isDarkMode ? 'text-[#97989F] hover:text-white' : 'text-[#3B3C4A] hover:text-[#4B6BFB]'} transition-colors text-sm md:text-base`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#181A2A]'} mb-3 md:mb-4`}>Category</h3>
              <ul className="space-y-1 md:space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link 
                      to={category.to} 
                      className={`${isDarkMode ? 'text-[#97989F] hover:text-white' : 'text-[#3B3C4A] hover:text-[#4B6BFB]'} transition-colors text-sm md:text-base`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className={`${isDarkMode ? 'bg-[#242535]' : 'bg-white'} p-4 md:p-6 rounded-xl`}>
            <div className="text-center mb-4 md:mb-6">
              <h3 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#181A2A]'} mb-1 md:mb-2`}>VR Updates</h3>
              <p className={`${isDarkMode ? 'text-[#97989F]' : 'text-[#696A75]'} text-xs md:text-sm`}>
                Get the latest VR games and news via email
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="space-y-3 md:space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email" 
                  className={`w-full py-2 md:py-3 px-3 md:px-4 text-sm ${isDarkMode ? 'bg-[#242535] text-white border-[#3B3C4A]' : 'bg-white text-[#3B3C4A] border-[#E8E8EA]'} border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B6BFB]`}
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-[#4B6BFB] text-white py-2 md:py-3 px-4 text-sm rounded-md hover:bg-[#3b5bdb] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className={`py-4 md:py-8 border-t ${isDarkMode ? 'border-[#242535]' : 'border-[#E8E8EA]'} flex flex-col md:flex-row justify-between items-center`}>
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={isDarkMode ? "#141624" : "#181A2A"} />
                <path d="M7.5 11.5L10.5 14.5L16.5 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className={`font-bold text-lg md:text-xl`}>
                <span className="text-[#4B6BFB]">Try</span><span className="text-[#FF6B35]">VR</span>
              </div>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-[#97989F]' : 'text-[#3B3C4A]'}`}>
                © TryVR {currentYear}. All Rights Reserved.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-4 text-xs md:text-sm">
            <Link to="/terms" className={`${isDarkMode ? 'text-[#97989F]' : 'text-[#3B3C4A]'} hover:text-[#4B6BFB]`}>
              Terms of Use
            </Link>
            <span className={`h-3 md:h-4 w-px ${isDarkMode ? 'bg-[#242535]' : 'bg-[#E8E8EA]'}`}></span>
            <Link to="/privacy" className={`${isDarkMode ? 'text-[#97989F]' : 'text-[#3B3C4A]'} hover:text-[#4B6BFB]`}>
              Privacy Policy
            </Link>
            <span className={`h-3 md:h-4 w-px ${isDarkMode ? 'bg-[#242535]' : 'bg-[#E8E8EA]'}`}></span>
            <Link to="/cookies" className={`${isDarkMode ? 'text-[#97989F]' : 'text-[#3B3C4A]'} hover:text-[#4B6BFB]`}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer; 