import React from 'react';
import { format } from 'date-fns';

const GameCard = React.memo(({ game, onPlay }) => {
  // Format the date with error handling
  const formatDate = (dateString) => {
    try {
      // Check if date is valid
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.warn(`Error formatting date: ${dateString}`, error);
      return 'Date unavailable';
    }
  };
  
  // Safely get formatted date
  const formattedDate = game.releaseDate ? formatDate(game.releaseDate) : 'Date unavailable';
  
  // Render stars for the rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
      }
    }
    
    return stars;
  };
  
  // Handle playing the game
  const handlePlay = () => {
    if (onPlay) {
      onPlay(game);
    } else {
      window.open(game.playUrl, '_blank');
    }
  };

  return (
    <div className="game-card">
      <div className="game-card-inner">
        {/* Card Header with Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          {game.featured && (
            <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-purple-600 text-white text-xs uppercase font-bold py-1 px-3 rounded-bl-lg shadow-md z-10 m-2">
              Featured
            </div>
          )}
          
          <img 
            src={game.imageUrl} 
            alt={game.title}
            className="game-card-image w-full h-48 object-cover transition-transform"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg"
              aria-label={`Play ${game.title}`}
            >
              <i className="fas fa-play text-xl"></i>
            </button>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{game.title}</h3>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
              {game.category}
            </span>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="flex mr-2">
              {renderStars(game.rating)}
            </div>
            <span className="text-sm text-gray-500">
              ({game.rating.toFixed(1)})
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {game.description}
          </p>
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span><i className="far fa-calendar-alt mr-1"></i> {formattedDate}</span>
            <span><i className="fas fa-users mr-1"></i> {game.players || 0} players</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GameCard; 