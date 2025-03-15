import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameCard from '../components/GameCard';
import GamePlayer from '../components/GamePlayer';
import Notification from '../components/Notification';
import useGames from '../hooks/useGames';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
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
    updateFilters({ category, page: 1 });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    updateFilters({ searchTerm: searchInput, page: 1 });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle game play
  const handlePlayGame = (game) => {
    setCurrentGame(game);
    incrementPlayCount(game.id);
    
    // Track play in analytics (in a real app)
    console.log(`Playing game: ${game.title}`);
  };

  // Close game player
  const handleCloseGame = () => {
    setCurrentGame(null);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const currentPage = filters.page;
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg mr-2 disabled:opacity-50 hover:bg-gray-200 transition-colors"
      >
        <i className="fas fa-chevron-left mr-1"></i> Prev
      </button>
    );
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg mx-1 transition-colors ${
            i === currentPage 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg ml-2 disabled:opacity-50 hover:bg-gray-200 transition-colors"
      >
        Next <i className="fas fa-chevron-right ml-1"></i>
      </button>
    );
    
    return (
      <div className="flex justify-center mt-8 mb-8">
        {pages}
      </div>
    );
  };

  // Render loading skeleton for GameCard
  const renderGameCardSkeleton = () => {
    return Array(filters.itemsPerPage || 8).fill().map((_, index) => (
      <div key={`skeleton-${index}`} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
        <div className="aspect-[16/9] bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="flex items-center mb-3">
            <div className="h-4 bg-gray-200 rounded w-1/4 mr-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    ));
  };

  // Filter games by category
  const getFeaturedGames = () => {
    return games.filter(game => game.featured).slice(0, 6);
  };

  const getNewGames = () => {
    return [...games].sort((a, b) => {
      return new Date(b.releaseDate) - new Date(a.releaseDate);
    }).slice(0, 8);
  };

  const getTrendingGames = () => {
    return [...games].sort((a, b) => b.players - a.players).slice(0, 8);
  };

  // CrazyGames style categories
  const categories = [
    { id: 'action', name: 'Action', icon: 'bolt' },
    { id: 'adventure', name: 'Adventure', icon: 'mountain' },
    { id: 'puzzle', name: 'Puzzle', icon: 'puzzle-piece' },
    { id: 'simulation', name: 'Simulation', icon: 'desktop' },
    { id: 'sports', name: 'Sports', icon: 'futbol' },
    { id: 'racing', name: 'Racing', icon: 'car' },
    { id: 'casual', name: 'Casual', icon: 'smile' },
    { id: 'card', name: 'Card', icon: 'cards' },
    { id: 'fps', name: 'FPS', icon: 'crosshairs' },
    { id: 'horror', name: 'Horror', icon: 'ghost' },
    { id: 'io', name: '.io', icon: 'globe' },
    { id: 'multiplayer', name: 'Multiplayer', icon: 'users' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {currentGame && (
        <GamePlayer 
          game={currentGame} 
          onClose={handleCloseGame} 
        />
      )}
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <main>
        {/* Search Bar - CrazyGames style */}
        <section className="py-4 bg-white border-b border-gray-200">
          <div className="page-container">
            <form onSubmit={handleSearch} className="max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search games..."
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  defaultValue={filters.searchTerm}
                />
                <button 
                  type="submit" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <i className="fas fa-search text-lg"></i>
                </button>
              </div>
            </form>
          </div>
        </section>
        
        {/* Featured Games Section */}
        <section className="py-8">
          <div className="page-container">
            <div className="section-heading mb-6">
              <h2>Featured Games</h2>
              <Link to="/games?featured=true" className="hover:underline">
                View more <i className="fas fa-chevron-right text-xs ml-1"></i>
              </Link>
            </div>
            
            <div className="games-grid">
              {loading ? renderGameCardSkeleton() : 
                getFeaturedGames().map(game => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onPlay={handlePlayGame} 
                  />
                ))
              }
            </div>
          </div>
        </section>
        
        {/* New Games Section */}
        <section className="py-8 bg-gray-50">
          <div className="page-container">
            <div className="section-heading mb-6">
              <h2>New Games</h2>
              <Link to="/new" className="hover:underline">
                View more <i className="fas fa-chevron-right text-xs ml-1"></i>
              </Link>
            </div>
            
            <div className="games-grid">
              {loading ? renderGameCardSkeleton() : 
                getNewGames().map(game => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onPlay={handlePlayGame} 
                  />
                ))
              }
            </div>
          </div>
        </section>
        
        {/* Popular Categories */}
        <section className="py-8">
          <div className="page-container">
            <div className="section-heading mb-6">
              <h2>Popular Categories</h2>
            </div>
            
            <div className="category-grid">
              {categories.map(category => (
                <Link 
                  key={category.id}
                  to={`/games?category=${category.id}`}
                  className="category-card hover:no-underline"
                >
                  <div className="category-icon">
                    <i className={`fas fa-${category.icon}`}></i>
                  </div>
                  <div className="category-name">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Trending Games Section */}
        <section className="py-8 bg-gray-50">
          <div className="page-container">
            <div className="section-heading mb-6">
              <h2>Trending Now</h2>
              <Link to="/trending" className="hover:underline">
                View more <i className="fas fa-chevron-right text-xs ml-1"></i>
              </Link>
            </div>
            
            <div className="games-grid">
              {loading ? renderGameCardSkeleton() : 
                getTrendingGames().map(game => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onPlay={handlePlayGame} 
                  />
                ))
              }
            </div>
          </div>
        </section>
        
        {/* Multiplayer Section */}
        <section className="py-8">
          <div className="page-container">
            <div className="section-heading mb-6">
              <h2>Play with friends!</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="text-indigo-600 text-2xl mr-3">
                    <i className="fas fa-users"></i>
                  </div>
                  <h3 className="text-lg font-semibold">Local multiplayer</h3>
                </div>
                <p className="text-gray-600 mb-4">Play on the same device</p>
                <Link to="/games?type=local-multiplayer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                  Explore games
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="text-indigo-600 text-2xl mr-3">
                    <i className="fas fa-globe"></i>
                  </div>
                  <h3 className="text-lg font-semibold">Online multiplayer</h3>
                </div>
                <p className="text-gray-600 mb-4">Play on separate devices</p>
                <Link to="/games?type=online-multiplayer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                  Explore games
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Games Section - if filters active */}
        {(filters.category !== 'all' || filters.searchTerm) && (
          <section className="py-8 bg-gray-50">
            <div className="page-container">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">
                  {filters.searchTerm ? `Search results for "${filters.searchTerm}"` : 
                   filters.category !== 'all' ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Games` : 
                   'All Games'}
                </h2>
                
                {/* Category Pills */}
                {!filters.searchTerm && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`category-pill ${filters.category === 'all' ? 'active' : ''}`}
                    >
                      <i className="fas fa-gamepad"></i> All
                    </button>
                    
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`category-pill ${filters.category === category.id ? 'active' : ''}`}
                      >
                        <i className={`fas fa-${category.icon}`}></i> {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Games Grid */}
              {loading ? (
                <div className="games-grid">
                  {renderGameCardSkeleton()}
                </div>
              ) : games.length > 0 ? (
                <>
                  <div className="games-grid">
                    {games.map(game => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        onPlay={handlePlayGame} 
                      />
                    ))}
                  </div>
                  {renderPagination()}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-5xl mb-4">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No games found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any games matching your search criteria.
                  </p>
                  <button
                    onClick={() => updateFilters({ category: 'all', searchTerm: '', page: 1 })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    View all games
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
        
        {/* SEO Text Section - Similar to CrazyGames */}
        <section className="py-8 bg-white">
          <div className="page-container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Online Games at TryVR</h2>
              <p className="text-gray-600 mb-4">
                TryVR features the latest and best free virtual reality games. You can enjoy playing 
                fun VR games without interruptions from downloads, intrusive ads, or pop-ups. Just load 
                up your favorite games instantly in your web browser and enjoy the experience.
              </p>
              <p className="text-gray-600 mb-4">
                You can play our games on desktop and on mobile devices. That includes everything from 
                desktop PCs, laptops, and Chromebooks, to the latest smartphones and tablets from 
                Apple and Android.
              </p>
              <h3 className="text-xl font-bold mt-6 mb-3">About TryVR</h3>
              <p className="text-gray-600">
                There are plenty of online multiplayer games with active communities on TryVR. 
                You can find many of the best free multiplayer titles on our multiplayer games page. 
                In these games, you can play with your friends online and with other people from 
                around the world, no matter where you are.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home; 