import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    updateFilters({ category });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    updateFilters({ searchTerm: searchInput });
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
        className="px-4 py-2 bg-gray-800 rounded-lg mr-2 disabled:opacity-50 hover:bg-gray-700 transition-colors"
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
              ? 'bg-purple-700 text-white pulse' 
              : 'bg-gray-800 hover:bg-gray-700'
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
        className="px-4 py-2 bg-gray-800 rounded-lg ml-2 disabled:opacity-50 hover:bg-gray-700 transition-colors"
      >
        Next <i className="fas fa-chevron-right ml-1"></i>
      </button>
    );
    
    return (
      <div className="flex justify-center mt-12 mb-8">
        {pages}
      </div>
    );
  };

  // Render featured games section
  const renderFeaturedGames = () => {
    const featuredGames = games.filter(game => game.featured);
    
    if (featuredGames.length === 0) return null;
    
    return (
      <section className="mb-16">
        <div className="flex items-center mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Featured Games</h2>
          <div className="ml-4 h-1 flex-grow bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featuredGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onPlay={handlePlayGame}
            />
          ))}
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
            Play VR Games in Your Browser
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Explore our collection of browser-based VR games. No downloads required - just click and play!
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              className="vr-button px-6 py-3 rounded-full text-lg"
            >
              <i className="fas fa-vr-cardboard mr-2"></i> Explore Games
            </button>
          </div>
        </section>
        
        {/* Search and Filter */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'all' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                All Games
              </button>
              <button
                onClick={() => handleCategoryChange('action')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'action' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className="fas fa-fist-raised mr-1"></i> Action
              </button>
              <button
                onClick={() => handleCategoryChange('adventure')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'adventure' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className="fas fa-mountain mr-1"></i> Adventure
              </button>
              <button
                onClick={() => handleCategoryChange('simulation')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'simulation' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className="fas fa-rocket mr-1"></i> Simulation
              </button>
              <button
                onClick={() => handleCategoryChange('puzzle')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'puzzle' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className="fas fa-puzzle-piece mr-1"></i> Puzzle
              </button>
              <button
                onClick={() => handleCategoryChange('racing')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'racing' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className="fas fa-flag-checkered mr-1"></i> Racing
              </button>
              <button
                onClick={() => handleCategoryChange('sports')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'sports' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className="fas fa-basketball-ball mr-1"></i> Sports
              </button>
              <button
                onClick={() => handleCategoryChange('shooter')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.category === 'shooter' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <i className="fas fa-crosshairs mr-1"></i> Shooter
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <input
                type="text"
                name="search"
                placeholder="Search games..."
                defaultValue={filters.searchTerm}
                className="flex-grow md:w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-r-lg transition-colors"
              >
                <i className="fas fa-search"></i>
              </button>
            </form>
          </div>
        </section>
        
        {/* Featured Games */}
        {filters.category === 'all' && filters.page === 1 && !filters.searchTerm && renderFeaturedGames()}
        
        {/* All Games */}
        <section>
          <div className="flex items-center mb-8">
            <h2 className="text-3xl font-bold">
              {filters.category === 'all' ? 'All Games' : `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Games`}
              {filters.searchTerm && ` matching "${filters.searchTerm}"`}
            </h2>
            <div className="ml-4 h-1 flex-grow bg-gray-700 rounded-full"></div>
          </div>
          
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
              <p className="text-gray-400 text-lg">Loading amazing VR games...</p>
            </div>
          ) : games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {games.filter(game => !game.featured || filters.category !== 'all' || filters.page !== 1 || filters.searchTerm).map(game => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onPlay={handlePlayGame}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-xl">
              <div className="text-6xl text-gray-600 mb-4">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No games found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Try adjusting your search or filter to find what you're looking for, or check out our featured games.
              </p>
              <button
                onClick={() => updateFilters({ category: 'all', searchTerm: '' })}
                className="mt-6 px-6 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
              >
                View All Games
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {renderPagination()}
        </section>
      </main>
      
      <Footer />
      
      {/* Game Player */}
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

export default Home; 