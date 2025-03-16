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

  // Blog categories
  const categories = [
    { id: 'technology', name: 'Technology', icon: 'microchip' },
    { id: 'lifestyle', name: 'Lifestyle', icon: 'coffee' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'travel', name: 'Travel', icon: 'plane' },
    { id: 'sports', name: 'Sports', icon: 'futbol' },
    { id: 'economy', name: 'Economy', icon: 'chart-line' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#181A2A] text-white">
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
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-[#181A2A] rounded-xl overflow-hidden shadow-xl relative">
              <div className="flex flex-col md:flex-row">
                {/* Featured Image */}
                <div className="w-full md:w-2/3 h-[400px] relative">
                  <img 
                    src={games[0]?.image || 'https://via.placeholder.com/800x400'} 
                    alt={games[0]?.title || 'Featured Post'} 
                    className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                  />
                </div>
                
                {/* Content */}
                <div className="w-full md:w-1/3 p-8 bg-[#181A2A] border border-[#242535] shadow-lg rounded-b-xl md:rounded-r-xl md:rounded-bl-none">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-[#4B6BFB] text-white text-sm font-medium rounded-md">
                      Technology
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-6 text-white">
                    The Impact of Technology on the Workplace: How Technology is Changing
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <img 
                        src="https://via.placeholder.com/40" 
                        alt="Author" 
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-[#97989F]">Jason Francisco</span>
                    </div>
                    <span className="text-[#97989F]">August 20, 2022</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Advertisement Section */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="bg-[#242535] rounded-xl p-8 flex flex-col items-center justify-center h-[100px]">
              <p className="text-xs text-[#696A75]">Advertisement</p>
              <p className="text-lg text-[#696A75]">You can place ads</p>
              <p className="text-sm text-[#696A75]">750x100</p>
            </div>
          </div>
        </section>
        
        {/* Latest Posts Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Latest Post</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                renderGameCardSkeleton()
              ) : (
                getNewGames().map((game) => (
                  <div key={game.id} className="bg-[#181A2A] border border-[#242535] rounded-xl overflow-hidden shadow-lg">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={game.image || 'https://via.placeholder.com/400x200'} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <span className="inline-block px-2 py-1 bg-[rgba(75,107,251,0.05)] text-[#4B6BFB] text-xs font-medium rounded-md">
                          Technology
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-white">
                        {game.title}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <img 
                            src="https://via.placeholder.com/30" 
                            alt="Author" 
                            className="w-7 h-7 rounded-full mr-2"
                          />
                          <span className="text-sm text-[#97989F]">Tracey Wilson</span>
                        </div>
                        <span className="text-sm text-[#97989F]">August 20, 2022</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              <Link 
                to="/games" 
                className="px-5 py-3 border border-[rgba(105,106,117,0.3)] text-[#696A75] rounded-lg hover:bg-[#242535] transition-colors"
              >
                View All Post
              </Link>
            </div>
          </div>
        </section>
        
        {/* Second Advertisement Section */}
        <section className="py-4 mb-8">
          <div className="container mx-auto px-4">
            <div className="bg-[#242535] rounded-xl p-8 flex flex-col items-center justify-center h-[100px]">
              <p className="text-xs text-[#696A75]">Advertisement</p>
              <p className="text-lg text-[#696A75]">You can place ads</p>
              <p className="text-sm text-[#696A75]">750x100</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home; 