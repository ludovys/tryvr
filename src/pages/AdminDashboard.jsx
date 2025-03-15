import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import vrLogo from '../assets/vr-logo.svg';

const AdminDashboard = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    searchTerm: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin-login');
    } else if (!isLoading && isAuthenticated) {
      fetchGames();
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch games from API
  const fetchGames = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to Cloudflare Worker
      // For now, we'll use mock data
      const mockGames = [
        {
          id: 1,
          title: 'Space Explorer VR',
          description: 'Explore the vastness of space in this immersive VR experience.',
          category: 'adventure',
          imageUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          gameUrl: 'https://example.com/games/space-explorer',
          featured: true,
          rating: 4.8,
          playCount: 1250,
          createdAt: '2023-01-15T12:00:00Z'
        },
        {
          id: 2,
          title: 'Zombie Survival VR',
          description: 'Survive the zombie apocalypse in this heart-pounding VR game.',
          category: 'action',
          imageUrl: 'https://images.unsplash.com/photo-1509515837298-2c67a3933321?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          gameUrl: 'https://example.com/games/zombie-survival',
          featured: false,
          rating: 4.5,
          playCount: 980,
          createdAt: '2023-02-20T14:30:00Z'
        },
        {
          id: 3,
          title: 'Ocean Deep VR',
          description: 'Dive into the depths of the ocean and discover marine life in VR.',
          category: 'simulation',
          imageUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          gameUrl: 'https://example.com/games/ocean-deep',
          featured: true,
          rating: 4.7,
          playCount: 1050,
          createdAt: '2023-03-10T09:15:00Z'
        }
      ];
      
      setGames(mockGames);
      setTotalPages(Math.ceil(mockGames.length / 10));
    } catch (error) {
      console.error('Error fetching games:', error);
      setNotification({
        message: 'Failed to load games. Please try again later.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  // Open game form modal
  const openGameForm = (game = null) => {
    setCurrentGame(game);
    setShowModal(true);
  };

  // Close game form modal
  const closeGameForm = () => {
    setCurrentGame(null);
    setShowModal(false);
  };

  // Handle game form submission
  const handleGameSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const gameData = {
      id: currentGame?.id || Date.now(),
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      imageUrl: formData.get('imageUrl'),
      thumbnailUrl: formData.get('thumbnailUrl'),
      gameUrl: formData.get('gameUrl'),
      featured: formData.get('featured') === 'on',
      rating: parseFloat(formData.get('rating')),
      playCount: parseInt(formData.get('playCount') || 0),
      createdAt: currentGame?.createdAt || new Date().toISOString()
    };
    
    if (currentGame) {
      // Update existing game
      setGames(prevGames => 
        prevGames.map(game => game.id === currentGame.id ? gameData : game)
      );
      setNotification({
        message: `Game "${gameData.title}" updated successfully!`,
        type: 'success'
      });
    } else {
      // Add new game
      setGames(prevGames => [...prevGames, gameData]);
      setNotification({
        message: `Game "${gameData.title}" added successfully!`,
        type: 'success'
      });
    }
    
    closeGameForm();
  };

  // Open delete confirmation modal
  const openDeleteModal = (game) => {
    setGameToDelete(game);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setGameToDelete(null);
    setShowDeleteModal(false);
  };

  // Handle game deletion
  const handleDeleteGame = () => {
    if (!gameToDelete) return;
    
    setGames(prevGames => prevGames.filter(game => game.id !== gameToDelete.id));
    setNotification({
      message: `Game "${gameToDelete.title}" deleted successfully!`,
      type: 'success'
    });
    
    closeDeleteModal();
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value;
    setFilters(prev => ({ ...prev, searchTerm, page: 1 }));
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Filter games based on current filters
  const filteredGames = games.filter(game => {
    // Filter by category
    if (filters.category !== 'all' && game.category !== filters.category) {
      return false;
    }
    
    // Filter by search term
    if (filters.searchTerm && !game.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
        !game.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Paginate games
  const paginatedGames = filteredGames.slice(
    (filters.page - 1) * 10,
    filters.page * 10
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={vrLogo} alt="TryVR Logo" className="h-10 w-10 mr-3" />
              <h1 className="text-xl font-bold">TryVR Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:text-white transition">
                <i className="fas fa-home mr-2"></i>View Site
              </Link>
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:text-white transition"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage VR Games</h2>
          <button
            onClick={() => openGameForm()}
            className="vr-button bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>Add New Game
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-2 mb-4 md:mb-0">
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`px-3 py-1 rounded ${
                  filters.category === 'all' ? 'bg-purple-700' : 'bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleCategoryFilter('action')}
                className={`px-3 py-1 rounded ${
                  filters.category === 'action' ? 'bg-purple-700' : 'bg-gray-700'
                }`}
              >
                Action
              </button>
              <button
                onClick={() => handleCategoryFilter('adventure')}
                className={`px-3 py-1 rounded ${
                  filters.category === 'adventure' ? 'bg-purple-700' : 'bg-gray-700'
                }`}
              >
                Adventure
              </button>
              <button
                onClick={() => handleCategoryFilter('simulation')}
                className={`px-3 py-1 rounded ${
                  filters.category === 'simulation' ? 'bg-purple-700' : 'bg-gray-700'
                }`}
              >
                Simulation
              </button>
              <button
                onClick={() => handleCategoryFilter('puzzle')}
                className={`px-3 py-1 rounded ${
                  filters.category === 'puzzle' ? 'bg-purple-700' : 'bg-gray-700'
                }`}
              >
                Puzzle
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <input
                type="text"
                name="search"
                placeholder="Search games..."
                defaultValue={filters.searchTerm}
                className="flex-grow md:w-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-r"
              >
                <i className="fas fa-search"></i>
              </button>
            </form>
          </div>
        </div>

        {/* Games Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Plays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    Loading games...
                  </td>
                </tr>
              ) : paginatedGames.length > 0 ? (
                paginatedGames.map(game => (
                  <tr key={game.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded object-contain" 
                            src={game.thumbnailUrl || game.imageUrl} 
                            alt={game.title}
                            style={{
                              imageRendering: 'auto',
                              maxWidth: '100%',
                              maxHeight: '100%'
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{game.title}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">{game.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-800 text-purple-100">
                        {game.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-300">{game.rating.toFixed(1)}</span>
                        <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {game.playCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {game.featured ? (
                        <span className="text-green-500">
                          <i className="fas fa-check"></i>
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          <i className="fas fa-times"></i>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openGameForm(game)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(game)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No games found. Add some games to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredGames.length > 0 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-3 py-1 bg-gray-700 rounded mr-2 disabled:opacity-50"
              >
                &laquo; Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded mx-1 ${
                    page === filters.page ? 'bg-purple-700' : 'bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                className="px-3 py-1 bg-gray-700 rounded ml-2 disabled:opacity-50"
              >
                Next &raquo;
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Game Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {currentGame ? 'Edit Game' : 'Add New Game'}
            </h2>
            
            <form onSubmit={handleGameSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={currentGame?.title || ''}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={currentGame?.description || ''}
                    rows="3"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={currentGame?.category || 'action'}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="action">Action</option>
                    <option value="adventure">Adventure</option>
                    <option value="simulation">Simulation</option>
                    <option value="puzzle">Puzzle</option>
                    <option value="racing">Racing</option>
                    <option value="sports">Sports</option>
                    <option value="shooter">Shooter</option>
                    <option value="strategy">Strategy</option>
                    <option value="rpg">RPG</option>
                    <option value="educational">Educational</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    step="0.1"
                    defaultValue={currentGame?.rating || 4.5}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    defaultValue={currentGame?.imageUrl || ''}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    defaultValue={currentGame?.thumbnailUrl || ''}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    placeholder="Leave empty to use Image URL as thumbnail"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Game URL</label>
                  <input
                    type="url"
                    name="gameUrl"
                    defaultValue={currentGame?.gameUrl || ''}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-1">Play Count</label>
                  <input
                    type="number"
                    name="playCount"
                    min="0"
                    defaultValue={currentGame?.playCount || 0}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    defaultChecked={currentGame?.featured || false}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-gray-300">
                    Featured Game
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeGameForm}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded"
                >
                  {currentGame ? 'Update Game' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete the game "{gameToDelete?.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGame}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Delete Game
              </button>
            </div>
          </div>
        </div>
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

export default AdminDashboard; 