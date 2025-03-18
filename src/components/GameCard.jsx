import React from 'react';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

const GameCard = React.memo(({ game, onPlay }) => {
  const { isDarkMode } = useTheme();
  
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
    <div className={`game-card transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? 'shadow-dark' : 'shadow-light'}`}>
      {/* Card Image with Play Button Overlay */}
      <div className="relative game-card-image-container">
        {/* Featured Badge */}
        {game.featured && (
          <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full z-10">
            Featured
          </span>
        )}
        
        {/* Game Image */}
        <img 
          src={game.imageUrl} 
          alt={game.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Play Button Overlay */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 cursor-pointer"
          onClick={handlePlay}
        >
          <button className="play-button opacity-0 transform scale-75 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-white text-indigo-600 rounded-full p-3 shadow-lg hover:bg-indigo-600 hover:text-white">
            <i className="fas fa-play"></i>
          </button>
        </div>
      </div>
      
      {/* Card Content */}
      <div className={`p-4 ${isDarkMode ? 'bg-[var(--theme-card-bg)] text-[var(--theme-text-primary)]' : 'bg-white text-gray-800'}`}>
        <h3 className={`text-base font-semibold mb-2 line-clamp-1 ${isDarkMode ? 'text-[var(--theme-text-primary)]' : 'text-gray-800'}`}>
          {game.title}
        </h3>
        
        <div className="flex items-center text-xs mb-2">
          <span className={`rounded px-2 py-0.5 ${isDarkMode ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-tertiary)]' : 'bg-gray-100 text-gray-600'}`}>
            {game.category}
          </span>
          <span className="ml-2 flex items-center">
            <i className="fas fa-star text-yellow-400 mr-1"></i>
            {game.rating.toFixed(1)}
          </span>
        </div>
        
        <p className={`text-xs line-clamp-2 mb-3 ${isDarkMode ? 'text-[var(--theme-text-secondary)]' : 'text-gray-600'}`}>
          {game.description}
        </p>
        
        {/* Action Button */}
        <button 
          onClick={handlePlay}
          className="w-full bg-white hover:bg-gray-100 text-gray-800 text-sm font-medium py-3 rounded-full transition-colors duration-200"
        >
          Play Now
        </button>
      </div>
    </div>
  );
});

export default GameCard; 