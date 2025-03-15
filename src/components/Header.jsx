import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = () => {
  return (
    <div className="page-container py-4">
      {/* Logo Only - Left Aligned */}
      <Link to="/" className="flex items-center space-x-3 group w-fit">
        <div className="logo-float">
          <img 
            src={vrLogo} 
            alt="TryVR Logo" 
            className="h-10 w-10"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
            TryVR
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Browser-based VR experiences
          </p>
        </div>
      </Link>
    </div>
  );
};

export default Header; 