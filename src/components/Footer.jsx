import { memo, useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  
  // Categories for the footer
  const categories = [
    { name: 'Lifestyle', to: '/category/lifestyle' },
    { name: 'Technology', to: '/category/technology' },
    { name: 'Travel', to: '/category/travel' },
    { name: 'Business', to: '/category/business' },
    { name: 'Economy', to: '/category/economy' },
    { name: 'Sports', to: '/category/sports' }
  ];

  // Quick links
  const quickLinks = [
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Blog', to: '/blog' },
    { name: 'Archived', to: '/archived' },
    { name: 'Author', to: '/author' },
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
    <footer className="bg-[#141624] border-t border-[#242535] pt-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">About</h3>
            <p className="text-[#97989F] text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
            </p>
            <div className="space-y-2">
              <p className="text-white font-semibold">Email : info@jstemplate.net</p>
              <p className="text-white font-semibold">Phone : 880 123 456 789</p>
            </div>
          </div>
          
          {/* Quick Links and Categories */}
          <div className="grid grid-cols-2 gap-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Quick Link</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.to}
                      className="text-[#BABABF] hover:text-[#4B6BFB] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Category</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link 
                      to={category.to}
                      className="text-[#BABABF] hover:text-[#4B6BFB] transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="bg-[#242535] p-8 rounded-xl">
            <h3 className="text-xl font-semibold text-white text-center mb-2">Weekly Newsletter</h3>
            <p className="text-[#97989F] text-center mb-6">Get blog articles and offers via email</p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email" 
                  className="w-full px-4 py-3 pl-10 bg-[#181A2A] border border-[#3B3C4A] rounded-md text-white focus:outline-none focus:border-[#4B6BFB]"
                  required
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#696A75] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-[#4B6BFB] text-white font-medium rounded-md hover:bg-[#3a54c4] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-[#242535] py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg width="35" height="35" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
                <path d="M17.5 35C27.165 35 35 27.165 35 17.5C35 7.83502 27.165 0 17.5 0C7.83502 0 0 7.83502 0 17.5C0 27.165 7.83502 35 17.5 35Z" fill="white"/>
                <path d="M11.487 23.5V12.2H15.614C16.5513 12.2 17.3687 12.3573 18.066 12.672C18.7633 12.9867 19.3033 13.426 19.686 13.99C20.0687 14.554 20.26 15.218 20.26 15.982C20.26 16.746 20.0687 17.41 19.686 17.974C19.3033 18.538 18.7633 18.9773 18.066 19.292C17.3687 19.6067 16.5513 19.764 15.614 19.764H12.825V17.848H15.362C15.9207 17.848 16.3873 17.7573 16.762 17.576C17.1367 17.3947 17.4187 17.1313 17.608 16.786C17.7973 16.4407 17.892 16.0387 17.892 15.58C17.892 15.1213 17.7973 14.7193 17.608 14.374C17.4187 14.0287 17.1367 13.7653 16.762 13.584C16.3873 13.4027 15.9207 13.312 15.362 13.312H13.855V23.5H11.487ZM21.7374 23.5V12.2H24.1054V22.388H28.8714V23.5H21.7374Z" fill="#181A2A"/>
              </svg>
              <div>
                <h3 className="text-xl font-bold text-white">MetaBlog</h3>
                <p className="text-[#BABABF] text-sm">© JS Template {currentYear}. All Rights Reserved.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/terms" className="text-[#BABABF] hover:text-[#4B6BFB] transition-colors text-sm">
                Terms of Use
              </Link>
              <span className="text-[#242535]">|</span>
              <Link to="/privacy" className="text-[#BABABF] hover:text-[#4B6BFB] transition-colors text-sm">
                Privacy Policy
              </Link>
              <span className="text-[#242535]">|</span>
              <Link to="/cookie" className="text-[#BABABF] hover:text-[#4B6BFB] transition-colors text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer; 