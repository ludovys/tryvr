import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = () => {
  return (
    <div className="page-container py-4">
      <div className="flex items-center justify-between">
        {/* Logo with Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="logo-float">
            <img 
              src={vrLogo} 
              alt="TryVR Logo" 
              className="h-10 w-10"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            TryVR
          </h1>
        </Link>
        
        {/* Contact Link */}
        <Link 
          to="/contact" 
          className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <i className="fas fa-envelope mr-2"></i>
          Contact
        </Link>
      </div>
    </div>
  );
};

export default Header; 