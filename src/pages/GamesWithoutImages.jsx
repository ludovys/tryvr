import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Notification from '../components/Notification';

const GamesWithoutImages = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('missing');

  useEffect(() => {
    const fetchGamesWithoutImages = async () => {
      try {
        setLoading(true);
        
        // Get the API base URL from environment variables or use relative path
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const apiUrl = baseUrl ? `${baseUrl}/api/games-without-images` : `/api/games-without-images`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch games without images');
        }
        
        const data = await response.json();
        setGames(data.gamesWithoutImages || []);
      } catch (err) {
        console.error('Error fetching games without images:', err);
        setError(err.message);
        setNotification({
          message: 'Failed to load games without images.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGamesWithoutImages();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter games based on active tab
  const filteredGames = games.filter(game => {
    if (activeTab === 'all') return true;
    return game.imageStatus === activeTab;
  });

  // Get counts for dashboard stats
  const missingCount = games.filter(game => game.imageStatus === 'missing').length;
  const invalidCount = games.filter(game => game.imageStatus === 'invalid').length;
  const totalCount = games.length;
  
  // Calculate percentages for donut chart
  const missingPercentage = totalCount ? Math.round((missingCount / totalCount) * 100) : 0;
  const invalidPercentage = totalCount ? Math.round((invalidCount / totalCount) * 100) : 0;

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <div className="animate-pulse">
        {/* Dashboard Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="bg-gray-800/80 rounded-xl overflow-hidden shadow-lg p-6">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-10 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        {/* Table Skeleton */}
        <div className="bg-gray-800/80 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="p-6">
            {Array(5).fill().map((_, index) => (
              <div key={index} className="border-b border-gray-700/50 pb-4 mb-4">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="page-container py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Image Management Dashboard</h1>
            <p className="text-gray-400">
              Monitor and manage games with missing or invalid image URLs
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center">
              <i className="fas fa-sync-alt mr-2"></i> Refresh Data
            </button>
          </div>
        </div>
        
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
        
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 text-white p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
              <i className="fas fa-exclamation-circle mr-2 text-red-400"></i>
              Error Occurred
            </h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Games Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Total Games</p>
                    <h3 className="text-3xl font-bold text-white mb-1">{totalCount}</h3>
                    <p className="text-gray-400 text-sm">Requiring attention</p>
                  </div>
                  <div className="bg-indigo-600/20 p-4 rounded-lg">
                    <i className="fas fa-gamepad text-2xl text-indigo-400"></i>
                  </div>
                </div>
              </div>
              
              {/* Missing Images Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg p-6 border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Missing Images</p>
                    <h3 className="text-3xl font-bold text-white mb-1">{missingCount}</h3>
                    <p className="text-gray-400 text-sm">{missingPercentage}% of total</p>
                  </div>
                  <div className="bg-red-600/20 p-4 rounded-lg">
                    <i className="fas fa-times-circle text-2xl text-red-400"></i>
                  </div>
                </div>
              </div>
              
              {/* Invalid Images Card */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Invalid Images</p>
                    <h3 className="text-3xl font-bold text-white mb-1">{invalidCount}</h3>
                    <p className="text-gray-400 text-sm">{invalidPercentage}% of total</p>
                  </div>
                  <div className="bg-orange-600/20 p-4 rounded-lg">
                    <i className="fas fa-exclamation-circle text-2xl text-orange-400"></i>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Visualization */}
            {totalCount > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Donut Chart */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg p-6 border border-gray-700/50 col-span-1">
                  <h3 className="text-lg font-semibold mb-4 text-white">Image Status Distribution</h3>
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48">
                      {/* SVG Donut Chart */}
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        {/* Background Circle */}
                        <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#374151" strokeWidth="3"></circle>
                        
                        {/* Missing Segment */}
                        {missingCount > 0 && (
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="15.91549430918954" 
                            fill="transparent" 
                            stroke="#EF4444" 
                            strokeWidth="3"
                            strokeDasharray={`${missingPercentage} ${100 - missingPercentage}`}
                            strokeDashoffset="25"
                          ></circle>
                        )}
                        
                        {/* Invalid Segment */}
                        {invalidCount > 0 && (
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="15.91549430918954" 
                            fill="transparent" 
                            stroke="#F97316" 
                            strokeWidth="3"
                            strokeDasharray={`${invalidPercentage} ${100 - invalidPercentage}`}
                            strokeDashoffset={`${100 - missingPercentage + 25}`}
                          ></circle>
                        )}
                        
                        {/* Center Text */}
                        <text x="18" y="17" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">
                          {totalCount}
                        </text>
                        <text x="18" y="22" textAnchor="middle" fontSize="3" fill="#9CA3AF">
                          Total Games
                        </text>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="flex justify-center mt-6 space-x-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-300">Missing</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-300">Invalid</span>
                    </div>
                  </div>
                </div>
                
                {/* Status Breakdown */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg p-6 border border-gray-700/50 col-span-2">
                  <h3 className="text-lg font-semibold mb-4 text-white">Status Breakdown</h3>
                  
                  <div className="space-y-4">
                    {/* Missing Images Progress */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">Missing Images</span>
                        <span className="text-sm font-medium text-gray-300">{missingCount} games</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-red-500 h-2.5 rounded-full" 
                          style={{ width: `${missingPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Invalid Images Progress */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-300">Invalid Images</span>
                        <span className="text-sm font-medium text-gray-300">{invalidCount} games</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-orange-500 h-2.5 rounded-full" 
                          style={{ width: `${invalidPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-800/80 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Featured Games with Issues</p>
                        <p className="text-2xl font-bold text-white">
                          {games.filter(game => game.featured).length}
                        </p>
                      </div>
                      <div className="bg-gray-800/80 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Avg. Rating of Affected Games</p>
                        <p className="text-2xl font-bold text-white">
                          {games.length ? (games.reduce((acc, game) => acc + game.rating, 0) / games.length).toFixed(1) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Games Table */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700/50">
              {/* Table Header with Tabs */}
              <div className="border-b border-gray-700">
                <div className="flex">
                  <button 
                    className={`px-6 py-4 text-sm font-medium ${activeTab === 'all' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All Issues ({totalCount})
                  </button>
                  <button 
                    className={`px-6 py-4 text-sm font-medium ${activeTab === 'missing' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('missing')}
                  >
                    Missing ({missingCount})
                  </button>
                  <button 
                    className={`px-6 py-4 text-sm font-medium ${activeTab === 'invalid' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('invalid')}
                  >
                    Invalid ({invalidCount})
                  </button>
                </div>
              </div>
              
              {/* Table Content */}
              {filteredGames.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                    <i className="fas fa-check text-2xl text-green-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No issues found</h3>
                  <p className="text-gray-400">All games in this category have valid images.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-800/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Game</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Added</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {filteredGames.map(game => (
                        <tr key={game.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                <i className="fas fa-gamepad text-gray-500"></i>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{game.title}</div>
                                <div className="text-sm text-gray-400 line-clamp-1">{game.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-300">
                              {game.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center w-fit ${
                              game.imageStatus === 'missing' 
                                ? 'bg-red-900/50 text-red-300' 
                                : 'bg-orange-900/50 text-orange-300'
                            }`}>
                              <i className={`fas ${game.imageStatus === 'missing' ? 'fa-times-circle' : 'fa-exclamation-circle'} mr-1`}></i>
                              {game.imageStatus === 'missing' ? 'Missing' : 'Invalid'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-sm text-white mr-2">{game.rating}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i 
                                    key={star}
                                    className={`text-xs fas ${star <= Math.round(game.rating) ? 'fa-star text-yellow-400' : 'fa-star text-gray-600'}`}
                                  ></i>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {formatDate(game.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="text-red-400 hover:text-red-300 transition-colors">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Table Footer */}
              <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">{filteredGames.length}</span> of <span className="font-medium text-white">{totalCount}</span> games
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default GamesWithoutImages; 