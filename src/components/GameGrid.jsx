import { useState } from 'react';
import { Link } from 'react-router-dom';

const GameGrid = ({ games, onPlay }) => {
  const [hoveredGame, setHoveredGame] = useState(null);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {games.map(game => (
        <div 
          key={game.id}
          className="game-thumbnail bg-gray-800/90 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2"
          onMouseEnter={() => setHoveredGame(game.id)}
          onMouseLeave={() => setHoveredGame(null)}
        >
          <Link to={`/game/${game.id}`} className="block">
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={game.thumbnailUrl || game.imageUrl} 
                alt={game.title} 
                className="w-full object-cover transition-transform duration-500"
                style={{ maxHeight: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x169?text=Game+Thumbnail';
                }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80"></div>
              
              {game.featured && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  <i className="fas fa-crown mr-1"></i>
                </div>
              )}
              
              <div className="absolute bottom-0 left-0 w-full p-3">
                <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 drop-shadow-lg">{game.title}</h3>
                <div className="flex items-center">
                  <div className="flex mr-2 drop-shadow-lg scale-75 origin-left">
                    {renderStars(game.rating)}
                  </div>
                  <span className="text-gray-200 text-xs drop-shadow-lg">{game.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Link>
          
          <div className="p-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span className="bg-gray-700 px-2 py-1 rounded-full">
                {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
              </span>
              <span><i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={() => onPlay(game)}
              className={`w-full vr-button px-3 py-2 rounded-lg text-sm ${
                hoveredGame === game.id ? 'pulse' : ''
              } text-white transition-colors flex items-center justify-center`}
            >
              <i className="fas fa-play-circle mr-2"></i> Play Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameGrid; 