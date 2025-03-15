import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameGrid from '../components/GameGrid';
import GamePlayer from '../components/GamePlayer';
import Notification from '../components/Notification';
import useGames from '../hooks/useGames';

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
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
    setCurrentGame(game);
    incrementPlayCount(game.id);
  };

  // Close game player
  const handleCloseGame = () => {
    setCurrentGame(null);
  };

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <div className="games-grid">
        {Array(15).fill().map((_, index) => (
          <div key={index} className="bg-gray-800/90 rounded-lg overflow-hidden shadow-lg h-full">
            <div className="aspect-video bg-gray-700"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="flex justify-between mb-3">
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-32">
        {/* Hero Section */}
        <section className="mb-12 text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 vr-text-3d">
            VR Games Collection
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Browse our collection of browser-based VR games. Filter by category or search for your favorite games.
          </p>
        </section>
        
        {/* Search and Filter */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg">
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
              <button
                onClick={() => handleCategoryChange('racing')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === 'racing' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={loading}
              >
                <i className="fas fa-flag-checkered mr-1"></i> Racing
              </button>
              <button
                onClick={() => handleCategoryChange('sports')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === 'sports' ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                disabled={loading}
              >
                <i className="fas fa-basketball-ball mr-1"></i> Sports
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
        
        {/* Games Grid */}
        <section>
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
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
            <GameGrid games={games} onPlay={handlePlayGame} />
          )}
          
          {/* Load More Button */}
          {!loading && games.length > 0 && filters.page < totalPages && (
            <div className="flex justify-center mt-8">
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

export default Games; 