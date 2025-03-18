import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameGrid from '../components/GameGrid';
import GamePlayer from '../components/GamePlayer';
import Notification from '../components/Notification';
import useGames from '../hooks/useGames';
import { useTheme } from '../context/ThemeContext';

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notification, setNotification] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const { isDarkMode } = useTheme();
  
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
        {Array(12).fill().map((_, index) => (
          <div key={index} className={`game-card ${isDarkMode ? 'bg-gray-800/90' : 'bg-gray-100'}`}>
            <div className="game-card-image">
              <div className={`w-full h-0 pb-[100%] relative ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`game-card-content ${isDarkMode ? 'bg-[var(--theme-card-bg)]' : 'bg-white'}`}>
              <div className={`h-5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-3`}></div>
              <div className="flex justify-between mb-3">
                <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4`}></div>
                <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4`}></div>
              </div>
              <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3 mb-3`}></div>
              <div className={`h-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-full mb-4`}></div>
              <div className={`h-10 bg-white rounded-full w-full`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => updateFilters({ page })}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              page === filters.page
                ? `${isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`
                : `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };

  // Main component render
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[var(--theme-bg-primary)]' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Game Player (if a game is selected) */}
      {currentGame && (
        <GamePlayer
          game={currentGame}
          onClose={handleCloseGame}
        />
      )}
      
      {/* Main Content */}
      <main className={`flex-grow container mx-auto px-4 py-8`}>
        <section className="mb-12">
          {/* Page heading */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Browse Games
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Discover and play the best virtual reality games
            </p>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search form */}
            <form onSubmit={handleSearch} className="flex-grow">
              <div className={`relative rounded-full overflow-hidden ${isDarkMode ? 'bg-[var(--theme-input-bg)]' : 'bg-white'}`}>
                <input
                  type="search"
                  name="search"
                  placeholder="Search games..."
                  className={`w-full py-3 pl-5 pr-12 outline-none ${isDarkMode ? 'bg-[var(--theme-input-bg)] text-white' : 'bg-white text-gray-900'}`}
                  defaultValue={filters.searchTerm}
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
            
            {/* Category filters */}
            <div className="category-nav flex items-center space-x-2 pb-2 overflow-x-auto">
              {['all', 'action', 'adventure', 'puzzle', 'racing', 'sports', 'simulation'].map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`category-nav-item ${activeCategory === category ? 'active' : ''}`}
                >
                  {category === 'all' ? 'All Games' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Games grid */}
          <div className="games-container">
            {loading ? renderSkeleton() : (
              games.length > 0 ? (
                <GameGrid 
                  games={games} 
                  onPlay={handlePlayGame} 
                />
              ) : (
                <div className={`text-center py-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <i className="fas fa-search text-4xl mb-3"></i>
                  <h3 className="text-xl font-medium mb-2">No games found</h3>
                  <p>Try a different search term or category</p>
                </div>
              )
            )}
          </div>
          
          {/* Pagination */}
          {!loading && renderPagination()}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Games; 