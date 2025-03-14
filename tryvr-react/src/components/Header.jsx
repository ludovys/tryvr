import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = () => {
  return (
    <header className="vr-header-bg shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="vr-float mr-4">
              <img src={vrLogo} alt="TryVR Logo" className="h-16 w-16" />
            </div>
            <div>
              <h1 className="text-3xl font-bold vr-text-3d">TryVR</h1>
              <p className="mt-1">Experience Virtual Reality Like Never Before</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="vr-button px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition">
              Home
            </Link>
            <Link to="/about" className="vr-button px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition">
              About VR
            </Link>
            <Link to="/contact" className="vr-button px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition">
              Contact
            </Link>
            <Link to="/admin-login" className="vr-button px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
              Admin
            </Link>
          </div>
          <div className="md:hidden">
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 