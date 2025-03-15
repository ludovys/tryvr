import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-6xl font-bold mb-4 vr-text-3d">404</h1>
      <p className="text-xl mb-8">Oops! The page you're looking for doesn't exist in this virtual reality.</p>
      <Link 
        to="/" 
        className="vr-button px-6 py-3 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound; 