import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch games from the API
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - Games data and filter functions
 */
const useGamesApi = (initialFilters = {}) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    page: 1,
    limit: 12,
    ...initialFilters
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  // Function to update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Function to fetch games from the API
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      // Determine the base URL based on environment
      const baseUrl = import.meta.env.PROD 
        ? 'https://tryvr.pages.dev/api/games' 
        : '/api/games';

      // Fetch games from the API
      const response = await fetch(`${baseUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      setGames(data.games || []);
      setTotalPages(data.totalPages || 1);
      setTotalGames(data.totalGames || 0);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err.message);
      
      // Fallback to mock data in case of error
      setGames([]);
      setTotalPages(1);
      setTotalGames(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch games when filters change
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Function to increment play count (would call API in a real app)
  const incrementPlayCount = useCallback((gameId) => {
    console.log(`Incrementing play count for game ${gameId}`);
    // In a real app, this would make an API call
  }, []);

  return {
    games,
    loading,
    error,
    filters,
    totalPages,
    totalGames,
    updateFilters,
    incrementPlayCount,
    refetch: fetchGames
  };
};

export default useGamesApi; 