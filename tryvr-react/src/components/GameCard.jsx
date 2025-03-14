import { useState } from 'react';

const GameCard = ({ game, onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);
  
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
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={game.imageUrl} 
          alt={game.title} 
          className="w-full h-48 object-cover"
        />
        {game.featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </div>
        )}
        <div className="absolute top-2 right-2 bg-purple-700 text-white text-xs px-2 py-1 rounded">
          {game.category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{game.title}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex mr-2">
            {renderStars(game.rating)}
          </div>
          <span className="text-gray-400 text-sm">{game.rating.toFixed(1)}</span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{game.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span><i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()} plays</span>
          <span><i className="far fa-calendar-alt mr-1"></i> {formatDate(game.createdAt)}</span>
        </div>
        
        <button 
          onClick={() => onPlay(game)}
          className={`w-full vr-button px-4 py-2 rounded ${
            isHovered ? 'bg-purple-600' : 'bg-purple-700'
          } hover:bg-purple-600 text-white transition-colors flex items-center justify-center`}
        >
          <i className="fas fa-play-circle mr-2"></i> Play Now
        </button>
      </div>
    </div>
  );
};

export default GameCard; 