import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const GameGrid = ({ games, onPlay }) => {
  const [hoveredGame, setHoveredGame] = useState(null);
  const { isDarkMode } = useTheme();

  // Format date with error handling
  const formatDate = (dateString) => {
    try {
      // Check if date is valid
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.warn(`Error formatting date: ${dateString}`, error);
      return 'Date unavailable';
    }
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

  // Function to handle playing game in new window
  const playGame = (game) => {
    window.open(game.gameUrl, '_blank', 'width=1280,height=720,fullscreen=yes');
    if (typeof onPlay === 'function') {
      onPlay(game);
    }
  };

  return (
    <div className="games-grid">
      {games.map(game => (
        <div 
          key={game.id}
          className="game-card"
          onMouseEnter={() => setHoveredGame(game.id)}
          onMouseLeave={() => setHoveredGame(null)}
        >
          <Link to={`/game/${game.id}`} className="block">
            <div className="game-card-image">
              <img 
                src={game.thumbnailUrl || game.imageUrl} 
                alt={game.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x169?text=Game+Thumbnail';
                }}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              
              {/* Render badges */}
              <div className="absolute top-0 left-0 p-2 flex gap-2">
                {game.featured && (
                  <div className="featured-badge">
                    <i className="fas fa-crown mr-1"></i>
                    Featured
                  </div>
                )}
              </div>
            </div>
          </Link>
          
          <div className={`game-card-content ${isDarkMode ? 'bg-[var(--theme-card-bg)] text-[var(--theme-text-primary)]' : ''}`}>
            <Link to={`/game/${game.id}`}>
              <h3 className={`game-card-title line-clamp-1 ${isDarkMode ? 'text-[var(--theme-text-primary)]' : ''}`}>{game.title}</h3>
            </Link>
            
            <div className="game-card-meta">
              <div className="star-rating">
                {renderStars(game.rating)}
                <span className="ml-1">{game.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs flex items-center">
                <i className="fas fa-gamepad mr-1"></i> {(game.playCount || 0).toLocaleString()}
              </span>
            </div>
            
            <div className={`game-card-category ${isDarkMode ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-tertiary)]' : ''}`}>
              {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
            </div>
            
            <p className={`game-card-description line-clamp-2 ${isDarkMode ? 'text-[var(--theme-text-secondary)]' : ''}`}>{game.description}</p>
            
            <button 
              onClick={() => playGame(game)}
              className="btn-play-now"
              aria-label={`Play ${game.title}`}
            >
              Play Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameGrid; 