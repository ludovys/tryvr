import { useState } from 'react';

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

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className="game-card bg-gray-100 rounded-lg overflow-hidden shadow-md h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height: '400px' }}
    >
      <div className="relative bg-gray-200 flex items-center justify-center" style={{ height: '180px', overflow: 'hidden' }}>
        {imageError ? (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <i className="fas fa-gamepad text-4xl text-gray-500"></i>
          </div>
        ) : (
          <img 
            src={game.thumbnailUrl || game.imageUrl} 
            alt={game.title} 
            className="object-contain w-full h-full"
            style={{ 
              maxWidth: '90%',
              maxHeight: '90%',
              margin: '0 auto'
            }}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-400/70 to-transparent opacity-50"></div>
        {game.featured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            <i className="fas fa-crown mr-1"></i> FEATURED
          </div>
        )}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-400 to-purple-300 text-gray-800 text-xs px-3 py-1 rounded-full shadow-md">
          {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
        </div>
        <div className="absolute bottom-0 left-0 w-full p-3">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 drop-shadow-md">{game.title}</h3>
          <div className="flex items-center">
            <div className="flex mr-2 drop-shadow-md">
              {renderStars(game.rating)}
            </div>
            <span className="text-gray-700 text-sm drop-shadow-md">{game.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow bg-white">
        <p className="text-gray-700 text-sm mb-4 line-clamp-2 h-10 overflow-hidden">{game.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span><i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()} plays</span>
          <span><i className="far fa-calendar-alt mr-1"></i> {formatDate(game.createdAt)}</span>
        </div>
        
        <button 
          onClick={() => {
            window.open(game.gameUrl, '_blank', 'width=1280,height=720,fullscreen=yes');
            // If there's a function to increment play count passed as prop
            if (typeof onPlay === 'function') {
              onPlay(game);
            }
          }}
          className="w-full vr-button px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center mt-auto"
        >
          <i className="fas fa-play-circle mr-2"></i> Play Now
        </button>
      </div>
    </div>
  );
};

export default GameCard; 