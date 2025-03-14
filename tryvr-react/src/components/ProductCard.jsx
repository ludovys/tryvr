import { useState } from 'react';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Add affiliate tag to Amazon URL
  const getAffiliateUrl = (url) => {
    try {
      if (!url) return '#';
      
      // Parse URL
      const parsedUrl = new URL(url);
      
      // Remove existing tag if present
      let search = parsedUrl.search;
      if (search) {
        const params = new URLSearchParams(search);
        params.delete('tag');
        parsedUrl.search = params.toString();
      }
      
      // Add our affiliate tag
      const params = new URLSearchParams(parsedUrl.search);
      params.append('tag', 'tryvr-20');
      parsedUrl.search = params.toString();
      
      return parsedUrl.toString();
    } catch (error) {
      console.error('Error adding affiliate tag:', error);
      return url || '#';
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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
          src={product.image_url} 
          alt={product.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-purple-700 text-white text-sm px-2 py-1 rounded">
          {product.category}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.title}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex mr-2">
            {renderStars(product.rating)}
          </div>
          <span className="text-gray-400 text-sm">{product.rating.toFixed(1)}</span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-white">{formatPrice(product.price)}</span>
          
          <a 
            href={getAffiliateUrl(product.amazon_url)} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`vr-button px-4 py-2 rounded ${
              isHovered ? 'bg-purple-600' : 'bg-purple-700'
            } hover:bg-purple-600 text-white transition-colors`}
          >
            View on Amazon
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 