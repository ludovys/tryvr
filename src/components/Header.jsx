import { Link } from 'react-router-dom';
import vrLogo from '../assets/vr-logo.svg';

const Header = () => {
  return (
    <div className="page-container py-4">
      {/* Logo Only - No Text */}
      <Link to="/" className="w-fit block">
        <div className="logo-float">
          <img 
            src={vrLogo} 
            alt="TryVR Logo" 
            className="h-10 w-10"
          />
        </div>
      </Link>
    </div>
  );
};

export default Header; 