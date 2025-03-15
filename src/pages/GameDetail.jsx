import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GamePlayer from '../components/GamePlayer';
import Notification from '../components/Notification';
import useGames from '../hooks/useGames';

const GameDetail = () => {
  const { gameId } = useParams();
  const [notification, setNotification] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedGames, setRelatedGames] = useState([]);
  
  const { games, incrementPlayCount } = useGames();

  useEffect(() => {
    // Find the game by ID
    const id = parseInt(gameId, 10);
    const foundGame = games.find(g => g.id === id);
    
    if (foundGame) {
      setGame(foundGame);
      
      // Find related games (same category)
      const related = games
        .filter(g => g.id !== id && g.category === foundGame.category)
        .slice(0, 4);
      setRelatedGames(related);
    } else {
      setNotification({
        message: 'Game not found',
        type: 'error'
      });
    }
    
    setLoading(false);
  }, [gameId, games]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>);
    }
    
    return stars;
  };

  // Handle play game
  const handlePlayGame = () => {
    if (game) {
      window.open(game.gameUrl, '_blank', 'width=1280,height=720,fullscreen=yes');
      incrementPlayCount(game.id);
    }
  };

  // Close game player - no longer needed but keeping for backward compatibility
  const handleCloseGame = () => {
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pt-32">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-2/3">
                <div className="aspect-video bg-gray-700 rounded-lg mb-6"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-6"></div>
                <div className="h-10 bg-gray-700 rounded w-1/4 mb-6"></div>
              </div>
              <div className="w-full lg:w-1/3">
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video bg-gray-700 rounded-lg"></div>
                  <div className="aspect-video bg-gray-700 rounded-lg"></div>
                  <div className="aspect-video bg-gray-700 rounded-lg"></div>
                  <div className="aspect-video bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pt-32">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-gray-500 text-8xl mb-6">
              <i className="fas fa-ghost"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-4">Game Not Found</h3>
            <p className="text-gray-400 mb-8 max-w-md">
              We couldn't find the game you're looking for. It may have been removed or the ID is incorrect.
            </p>
            <Link to="/" className="vr-button px-6 py-3 rounded-lg">
              <i className="fas fa-home mr-2"></i> Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-32">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 text-sm">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            Home
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link to="/games" className="text-gray-400 hover:text-white transition-colors">
            Games
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-300">{game.title}</span>
        </div>
        
        {/* Game Detail */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <div className="relative rounded-lg shadow-2xl mb-4 lg:mb-6 bg-gray-800 flex items-center justify-center" style={{ height: '360px', overflow: 'hidden' }}>
              <img 
                src={game.thumbnailUrl || game.imageUrl} 
                alt={game.title} 
                className="object-contain w-full h-full"
                style={{ 
                  maxWidth: '90%',
                  maxHeight: '90%',
                  margin: '0 auto'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/640x360?text=Game+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <button 
                onClick={handlePlayGame}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 vr-button w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center"
              >
                <i className="fas fa-play text-2xl md:text-3xl"></i>
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold">{game.title}</h1>
              {game.featured && (
                <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  <i className="fas fa-crown mr-1"></i> FEATURED
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-gradient-to-r from-purple-700 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
              </span>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {renderStars(game.rating)}
                </div>
                <span className="text-gray-300 mr-4">{game.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-400 text-sm"><i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()} plays</span>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">{game.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={handlePlayGame}
                className="vr-button px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center"
              >
                <i className="fas fa-play-circle mr-2"></i> Play Now
              </button>
              
              <button className="px-4 md:px-6 py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center transition-colors">
                <i className="fas fa-share-alt mr-2"></i> Share
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
              <span><i className="far fa-calendar-alt mr-1"></i> Added on {formatDate(game.createdAt)}</span>
              <span><i className="fas fa-vr-cardboard mr-1"></i> WebXR Compatible</span>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
            <h2 className="text-xl font-bold mb-4">Related Games</h2>
            
            {relatedGames.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {relatedGames.map(relatedGame => (
                  <Link 
                    key={relatedGame.id} 
                    to={`/game/${relatedGame.id}`}
                    className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors"
                  >
                    <div className="relative bg-gray-800 flex items-center justify-center" style={{ height: '120px', overflow: 'hidden' }}>
                      <img 
                        src={relatedGame.thumbnailUrl || relatedGame.imageUrl} 
                        alt={relatedGame.title} 
                        className="object-contain w-full h-full"
                        style={{ 
                          maxWidth: '90%',
                          maxHeight: '90%',
                          margin: '0 auto'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x169?text=Game+Thumbnail';
                        }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-full p-2">
                        <h3 className="text-xs font-bold text-white line-clamp-1">{relatedGame.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400">No related games found</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Game Player Modal */}
      {isPlaying && (
        <GamePlayer 
          game={game} 
          onClose={handleCloseGame}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default GameDetail; 