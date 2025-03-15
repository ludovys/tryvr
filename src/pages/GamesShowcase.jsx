import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GamePlayer from '../components/GamePlayer';
import Notification from '../components/Notification';
import useGames from '../hooks/useGames';

const GamesShowcase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredGame, setHoveredGame] = useState(null);
  const showcaseRef = useRef(null);
  
  const { 
    games, 
    loading, 
    error, 
    filters, 
    totalPages, 
    updateFilters,
    incrementPlayCount 
  } = useGames();

  // Get category from URL params
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    setActiveCategory(category);
    updateFilters({
      category,
      searchTerm: search,
      page
    });
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.category !== 'all') newParams.set('category', filters.category);
    if (filters.searchTerm) newParams.set('search', filters.searchTerm);
    if (filters.page > 1) newParams.set('page', filters.page.toString());
    
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // Show error notification if API fails
  useEffect(() => {
    if (error) {
      setNotification({
        message: 'Failed to load games. Showing demo data instead.',
        type: 'error'
      });
    }
  }, [error]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    updateFilters({ category, page: 1 });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    updateFilters({ searchTerm: searchInput, page: 1 });
  };

  // Handle game play
  const handlePlayGame = (game) => {
    if (game) {
      window.open(game.gameUrl, '_blank', 'width=1280,height=720,fullscreen=yes');
      incrementPlayCount(game.id);
    }
  };

  // Close game player - no longer needed but keeping for backward compatibility
  const handleCloseGame = () => {
    setCurrentGame(null);
  };

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

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <div className="grid grid-cols-1 gap-12 animate-pulse">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-col md:flex-row gap-8 bg-gray-800/60 rounded-xl p-6">
            <div className="w-full md:w-2/5 aspect-video bg-gray-700 rounded-lg"></div>
            <div className="w-full md:w-3/5">
              <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6 mb-6"></div>
              <div className="flex gap-4 mb-6">
                <div className="h-10 bg-gray-700 rounded w-32"></div>
                <div className="h-10 bg-gray-700 rounded w-32"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render featured game
  const renderFeaturedGame = () => {
    const featuredGames = games.filter(game => game.featured);
    if (featuredGames.length === 0) return null;
    
    const featured = featuredGames[0];
    
    return (
      <section className="mb-16">
        <div className="flex items-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Featured Game</h2>
          <div className="ml-4 h-1 flex-grow bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${featured.thumbnailUrl || featured.imageUrl})` }}></div>
          <div className="relative z-10 flex flex-col md:flex-row p-4 md:p-8 gap-4 md:gap-8">
            <div className="w-full md:w-1/2 aspect-video overflow-hidden rounded-lg shadow-2xl bg-gray-800 flex items-center justify-center" style={{ height: '280px' }}>
              <img 
                src={featured.thumbnailUrl || featured.imageUrl} 
                alt={featured.title} 
                className="object-contain hover:scale-105 transition-transform duration-500"
                style={{ 
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/640x360?text=Game+Image';
                }}
              />
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  <i className="fas fa-crown mr-1"></i> FEATURED
                </span>
                <span className="bg-gradient-to-r from-purple-700 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                  {featured.category.charAt(0).toUpperCase() + featured.category.slice(1)}
                </span>
              </div>
              
              <h3 className="text-xl md:text-3xl font-bold text-white mb-2">{featured.title}</h3>
              
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {renderStars(featured.rating)}
                </div>
                <span className="text-gray-300">{featured.rating.toFixed(1)}</span>
              </div>
              
              <p className="text-gray-300 mb-6 text-sm md:text-base">{featured.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <button 
                  onClick={() => handlePlayGame(featured)}
                  className="vr-button px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center"
                >
                  <i className="fas fa-play-circle mr-2"></i> Play Now
                </button>
                
                <button className="px-4 md:px-6 py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center transition-colors">
                  <i className="fas fa-info-circle mr-2"></i> Details
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mt-auto">
                <span><i className="fas fa-gamepad mr-1"></i> {featured.playCount.toLocaleString()} plays</span>
                <span><i className="far fa-calendar-alt mr-1"></i> {formatDate(featured.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-32">
        {/* Hero Section */}
        <section className="mb-16 text-center py-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 vr-text-3d">
            VR Games Showcase
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover our handpicked collection of immersive VR experiences. No downloads required - just click and play!
          </p>
        </section>
        
        {/* Search and Filter */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === 'all' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={loading}
              >
                All Games
              </button>
              <button
                onClick={() => handleCategoryChange('action')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === 'action' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={loading}
              >
                <i className="fas fa-fist-raised mr-1"></i> Action
              </button>
              <button
                onClick={() => handleCategoryChange('adventure')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === 'adventure' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={loading}
              >
                <i className="fas fa-mountain mr-1"></i> Adventure
              </button>
              <button
                onClick={() => handleCategoryChange('simulation')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === 'simulation' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={loading}
              >
                <i className="fas fa-rocket mr-1"></i> Simulation
              </button>
              <button
                onClick={() => handleCategoryChange('puzzle')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === 'puzzle' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={loading}
              >
                <i className="fas fa-puzzle-piece mr-1"></i> Puzzle
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search games..."
                  className="w-full md:w-64 bg-gray-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  defaultValue={filters.searchTerm}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  disabled={loading}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>
        </section>
        
        {/* Featured Game */}
        {!loading && games.some(game => game.featured) && renderFeaturedGame()}
        
        {/* Games Showcase */}
        <section ref={showcaseRef}>
          <div className="flex items-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {activeCategory === 'all' 
                ? 'All Games' 
                : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Games`}
            </h2>
            <div className="ml-4 h-1 flex-grow bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
          </div>
          
          {loading ? (
            renderSkeleton()
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-gray-500 text-8xl mb-6">
                <i className="fas fa-ghost"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-4">No Games Found</h3>
              <p className="text-gray-400 mb-8 max-w-md">
                We couldn't find any games matching your search criteria. Try adjusting your filters or search query.
              </p>
              <button
                onClick={() => updateFilters({ category: 'all', searchTerm: '', page: 1 })}
                className="vr-button px-6 py-3 rounded-lg"
              >
                <i className="fas fa-redo mr-2"></i> Show All Games
              </button>
            </div>
          ) : (
            <div className="games-grid">
              {games.filter(game => !game.featured || activeCategory !== 'all').map((game) => (
                <div 
                  key={game.id}
                  className="game-card bg-gray-800/90 rounded-lg overflow-hidden shadow-lg h-full flex flex-col"
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  <div className="relative bg-gray-800 flex items-center justify-center" style={{ height: '180px', overflow: 'hidden' }}>
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
                  
                  <div className="p-3 flex flex-col flex-grow">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="bg-gray-700 px-2 py-1 rounded-full">
                        {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
                      </span>
                      <span><i className="fas fa-gamepad mr-1"></i> {game.playCount.toLocaleString()}</span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 h-10 overflow-hidden">{game.description}</p>
                    
                    <button 
                      onClick={() => handlePlayGame(game)}
                      className="w-full vr-button px-3 py-2 rounded-lg text-sm text-white transition-colors flex items-center justify-center mt-auto"
                    >
                      <i className="fas fa-play-circle mr-2"></i> Play Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Load More Button */}
          {!loading && games.length > 0 && filters.page < totalPages && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => updateFilters({ page: filters.page + 1 })}
                className="vr-button px-6 py-3 rounded-lg"
              >
                <i className="fas fa-spinner mr-2"></i> Load More Games
              </button>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
      
      {/* Game Player Modal */}
      {currentGame && (
        <GamePlayer 
          game={currentGame} 
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

export default GamesShowcase; 