import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Notification from '../components/Notification';

const GamesWithoutImages = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchGamesWithoutImages = async () => {
      try {
        setLoading(true);
        
        // Get the API base URL from environment variables or use relative path
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const apiUrl = baseUrl ? `${baseUrl}/api/games-without-images` : `/api/games-without-images`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch games without images');
        }
        
        const data = await response.json();
        setGames(data.gamesWithoutImages || []);
      } catch (err) {
        console.error('Error fetching games without images:', err);
        setError(err.message);
        setNotification({
          message: 'Failed to load games without images.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGamesWithoutImages();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <div className="animate-pulse">
        {Array(5).fill().map((_, index) => (
          <div key={index} className="bg-gray-800/90 rounded-lg overflow-hidden shadow-lg mb-4 p-4">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="page-container py-8">
        <div className="mb-8 bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700/50">
          <h1 className="text-3xl font-bold mb-4 text-indigo-300">Games Without Valid Images</h1>
          <p className="text-gray-300">
            This page displays games that have missing or invalid image URLs. These games need attention to ensure a consistent user experience.
          </p>
        </div>
        
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
        
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 text-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <i className="fas fa-exclamation-circle mr-2 text-red-400"></i>
              Error Occurred
            </h2>
            <p>{error}</p>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-indigo-900/30 border border-indigo-700/50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <i className="fas fa-check-circle mr-2 text-indigo-400"></i>
              All Clear!
            </h2>
            <p>Great news! All games have valid images.</p>
          </div>
        ) : (
          <div>
            <div className="bg-indigo-900/30 border border-indigo-700/50 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <i className="fas fa-info-circle mr-2 text-indigo-400"></i>
                Image Issues Found
              </h2>
              <p>Found {games.length} games with missing or invalid images.</p>
            </div>
            
            <div className="space-y-4">
              {games.map(game => (
                <div key={game.id} className="bg-gray-800/80 rounded-lg overflow-hidden shadow-lg p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-xl font-bold mb-3 text-white">{game.title}</h2>
                      <p className="text-gray-300 mb-4 line-clamp-2">{game.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-indigo-900/70 text-indigo-100 text-xs px-3 py-1 rounded-full">
                          {game.category}
                        </span>
                        {game.featured && (
                          <span className="bg-yellow-900/70 text-yellow-100 text-xs px-3 py-1 rounded-full">
                            <i className="fas fa-star mr-1"></i> Featured
                          </span>
                        )}
                        <span className="bg-gray-700/70 text-gray-100 text-xs px-3 py-1 rounded-full">
                          <i className="fas fa-star-half-alt mr-1"></i> Rating: {game.rating}
                        </span>
                        <span className="bg-gray-700/70 text-gray-100 text-xs px-3 py-1 rounded-full">
                          <i className="fas fa-gamepad mr-1"></i> Plays: {game.playCount}
                        </span>
                        <span className="bg-gray-700/70 text-gray-100 text-xs px-3 py-1 rounded-full">
                          <i className="fas fa-calendar-alt mr-1"></i> Added: {formatDate(game.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className={`text-sm px-4 py-2 rounded-full flex items-center ${
                        game.imageStatus === 'missing' 
                          ? 'bg-red-900/70 text-red-100' 
                          : 'bg-orange-900/70 text-orange-100'
                      }`}>
                        <i className={`fas ${game.imageStatus === 'missing' ? 'fa-times-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                        {game.imageStatus === 'missing' ? 'Missing Image URL' : 'Invalid Image URL'}
                      </div>
                      
                      {game.imageUrl && (
                        <div className="text-xs text-gray-400 break-all bg-gray-900/80 p-3 rounded border border-gray-700">
                          <div className="font-semibold mb-1 text-gray-300">Current URL:</div>
                          <span className="font-mono">{game.imageUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default GamesWithoutImages; 