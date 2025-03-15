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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Games Without Valid Images</h1>
          <p className="text-gray-300">
            This page displays games that have missing or invalid image URLs.
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
          <div className="bg-red-900/50 border border-red-700 text-white p-4 rounded-lg">
            <p>Error: {error}</p>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-blue-900/50 border border-blue-700 text-white p-4 rounded-lg">
            <p>Great news! All games have valid images.</p>
          </div>
        ) : (
          <div>
            <div className="bg-blue-900/50 border border-blue-700 text-white p-4 rounded-lg mb-6">
              <p>Found {games.length} games with missing or invalid images.</p>
            </div>
            
            <div className="space-y-4">
              {games.map(game => (
                <div key={game.id} className="bg-gray-800/90 rounded-lg overflow-hidden shadow-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold mb-2">{game.title}</h2>
                      <p className="text-gray-300 mb-2 line-clamp-2">{game.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="bg-purple-900/70 text-purple-100 text-xs px-2 py-1 rounded">
                          {game.category}
                        </span>
                        {game.featured && (
                          <span className="bg-yellow-900/70 text-yellow-100 text-xs px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                        <span className="bg-gray-700/70 text-gray-100 text-xs px-2 py-1 rounded">
                          Rating: {game.rating}
                        </span>
                        <span className="bg-gray-700/70 text-gray-100 text-xs px-2 py-1 rounded">
                          Plays: {game.playCount}
                        </span>
                        <span className="bg-gray-700/70 text-gray-100 text-xs px-2 py-1 rounded">
                          Added: {formatDate(game.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className={`text-sm px-3 py-1 rounded-full ${
                        game.imageStatus === 'missing' 
                          ? 'bg-red-900/70 text-red-100' 
                          : 'bg-orange-900/70 text-orange-100'
                      }`}>
                        <i className={`fas ${game.imageStatus === 'missing' ? 'fa-times-circle' : 'fa-exclamation-circle'} mr-1`}></i>
                        {game.imageStatus === 'missing' ? 'Missing Image URL' : 'Invalid Image URL'}
                      </div>
                      
                      {game.imageUrl && (
                        <div className="text-xs text-gray-400 break-all">
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