import { useState } from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ game, onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
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
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    
    return stars;
  };

  // Play the game in a new window
  const playGame = () => {
    window.open(game.gameUrl, '_blank', 'width=1280,height=720,fullscreen=yes');
    // If there's a function to increment play count passed as prop
    if (typeof onPlay === 'function') {
      onPlay(game);
    }
  };

  return (
    <div 
      className="game-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="game-card-image">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <i className="fas fa-gamepad text-4xl text-gray-400"></i>
          </div>
        ) : (
          <img 
            src={game.thumbnailUrl || game.imageUrl} 
            alt={game.title} 
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
        
        {game.featured && (
          <div className="featured-badge">
            <i className="fas fa-crown mr-1"></i> FEATURED
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
          {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
        </div>
      </div>
      
      <div className="game-card-content">
        <Link to={`/game/${game.id}`}>
          <h3 className="game-card-title">{game.title}</h3>
        </Link>
        
        <div className="game-card-meta">
          <div className="star-rating">
            {renderStars(game.rating)}
            <span className="ml-1">{game.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs">
            {formatDate(game.createdAt)}
          </span>
        </div>
        
        <p className="game-card-description">{game.description}</p>
        
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500 mb-3">
          <span>
            <i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()} plays
          </span>
          <span>
            <i className="far fa-calendar-alt mr-1"></i> {formatDate(game.createdAt)}
          </span>
        </div>
        
        <button 
          onClick={playGame}
          className="btn btn-primary game-card-button"
        >
          <i className="fas fa-play-circle mr-2"></i> Play Now
        </button>
      </div>
    </div>
  );
};

export default GameCard; 