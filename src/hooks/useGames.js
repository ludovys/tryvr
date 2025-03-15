import { useState, useEffect } from 'react';

const useGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    searchTerm: '',
    page: 1,
    itemsPerPage: 12
  });
  const [totalPages, setTotalPages] = useState(1);

  // Fetch games from Cloudflare Worker API
  const fetchGames = async () => {
    setLoading(true);
    setError(null);

    try {
      const { category, searchTerm, page, itemsPerPage } = filters;
      
      // Construct query parameters
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      
      // Get the API base URL from environment variables or use relative path
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const apiUrl = baseUrl ? `${baseUrl}/api/games?${params.toString()}` : `/api/games?${params.toString()}`;
      
      console.log('Fetching games from:', apiUrl); // Debug log
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      
      const data = await response.json();
      
      setGames(data.games);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err.message);
      
      // For development/demo purposes, load mock data if API fails
      loadMockGames();
    } finally {
      setLoading(false);
    }
  };

  // Load mock games for development/demo
  const loadMockGames = () => {
    const mockGames = [
      {
        id: 1,
        title: 'Space Explorer VR',
        description: 'Explore the vastness of space in this immersive VR experience. Discover planets, stars, and cosmic phenomena as you navigate through our solar system and beyond.',
        category: 'adventure',
        imageUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/RqJJ9oU9/',
        featured: true,
        rating: 4.8,
        playCount: 1250,
        createdAt: '2023-01-15T12:00:00Z'
      },
      {
        id: 2,
        title: 'Zombie Survival VR',
        description: 'Survive the zombie apocalypse in this heart-pounding VR game. Scavenge for supplies, craft weapons, and defend yourself against hordes of the undead.',
        category: 'action',
        imageUrl: 'https://images.unsplash.com/photo-1509515837298-2c67a3933321?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509515837298-2c67a3933321?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/44MX6JkR/',
        featured: false,
        rating: 4.5,
        playCount: 980,
        createdAt: '2023-02-20T14:30:00Z'
      },
      {
        id: 3,
        title: 'Ocean Deep VR',
        description: 'Dive into the depths of the ocean and discover marine life in VR. Swim alongside dolphins, whales, and exotic fish in this relaxing underwater adventure.',
        category: 'simulation',
        imageUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/ZV4PW6wr/',
        featured: true,
        rating: 4.7,
        playCount: 1050,
        createdAt: '2023-03-10T09:15:00Z'
      },
      {
        id: 4,
        title: 'VR Puzzle Master',
        description: 'Challenge your mind with intricate 3D puzzles in virtual reality. Manipulate objects, solve riddles, and unlock new levels in this brain-teasing adventure.',
        category: 'puzzle',
        imageUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/JtL2iqIH/',
        featured: false,
        rating: 4.6,
        playCount: 850,
        createdAt: '2023-04-05T16:45:00Z'
      },
      {
        id: 5,
        title: 'Mountain Climb VR',
        description: 'Experience the thrill of mountain climbing without the risk. Scale towering peaks, navigate treacherous paths, and enjoy breathtaking views in this VR adventure.',
        category: 'adventure',
        imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/2zwQpVJt/',
        featured: false,
        rating: 4.4,
        playCount: 720,
        createdAt: '2023-05-12T11:20:00Z'
      },
      {
        id: 6,
        title: 'VR Racing Championship',
        description: 'Feel the speed in this immersive VR racing game. Compete against AI or other players, customize your vehicles, and race on tracks around the world.',
        category: 'racing',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/MflWvdTW/',
        featured: true,
        rating: 4.9,
        playCount: 1500,
        createdAt: '2023-06-18T08:30:00Z'
      },
      {
        id: 7,
        title: 'Archery Master VR',
        description: 'Test your precision and skill in this virtual reality archery game. Hit targets, complete challenges, and become the ultimate archer.',
        category: 'sports',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/JERg21J8/',
        featured: false,
        rating: 4.3,
        playCount: 650,
        createdAt: '2023-07-22T14:15:00Z'
      },
      {
        id: 8,
        title: 'Cosmic Shooter VR',
        description: 'Defend the galaxy from alien invaders in this action-packed VR shooter. Upgrade your weapons, improve your ship, and save humanity from extinction.',
        category: 'shooter',
        imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
        gameUrl: 'https://playcanv.as/p/SA7hVBLt/',
        featured: false,
        rating: 4.5,
        playCount: 920,
        createdAt: '2023-08-30T19:45:00Z'
      }
    ];
    
    // Filter mock games based on current filters
    let filtered = [...mockGames];
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(g => g.category === filters.category);
    }
    
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(search) || 
        g.description.toLowerCase().includes(search)
      );
    }
    
    // Calculate total pages
    const total = Math.ceil(filtered.length / filters.itemsPerPage);
    setTotalPages(total || 1);
    
    // Paginate
    const start = (filters.page - 1) * filters.itemsPerPage;
    const end = start + filters.itemsPerPage;
    filtered = filtered.slice(start, end);
    
    setGames(filtered);
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 if category or search changes
      page: (newFilters.category !== undefined && newFilters.category !== prev.category) || 
            (newFilters.searchTerm !== undefined && newFilters.searchTerm !== prev.searchTerm) 
            ? 1 : (newFilters.page || prev.page)
    }));
  };

  // Increment play count for a game
  const incrementPlayCount = (gameId) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId 
          ? { ...game, playCount: game.playCount + 1 } 
          : game
      )
    );
  };

  // Fetch games when filters change
  useEffect(() => {
    fetchGames();
  }, [filters]);

  return {
    games,
    loading,
    error,
    filters,
    totalPages,
    updateFilters,
    incrementPlayCount,
    refreshGames: fetchGames
  };
};

export default useGames; 