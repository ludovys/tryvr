import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TryVR</h3>
            <p className="mb-4">
              Your ultimate destination for discovering the best VR products on the market.
              We curate top-rated virtual reality gear to enhance your immersive experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition">About VR</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
              </li>
              <li>
                <Link to="/admin-login" className="text-gray-300 hover:text-white transition">Admin</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/?category=headsets" className="text-gray-300 hover:text-white transition">VR Headsets</Link>
              </li>
              <li>
                <Link to="/?category=controllers" className="text-gray-300 hover:text-white transition">Controllers</Link>
              </li>
              <li>
                <Link to="/?category=games" className="text-gray-300 hover:text-white transition">VR Games</Link>
              </li>
              <li>
                <Link to="/?category=accessories" className="text-gray-300 hover:text-white transition">Accessories</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p>&copy; {currentYear} TryVR. All rights reserved.</p>
          <p className="mt-2 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link>
            {' | '}
            <Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link>
            {' | '}
            <Link to="/affiliate-disclosure" className="text-gray-400 hover:text-white transition">Affiliate Disclosure</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 