import { useState, useEffect } from 'react';

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    searchTerm: '',
    page: 1,
    itemsPerPage: 10
  });
  const [totalPages, setTotalPages] = useState(1);

  // Fetch products from Cloudflare Worker API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { category, searchTerm, page, itemsPerPage } = filters;
      
      // Construct query parameters
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());
      
      // Get the API base URL from environment variables or use relative path
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const apiUrl = baseUrl ? `${baseUrl}/api/products?${params.toString()}` : `/api/products?${params.toString()}`;
      
      console.log('Fetching products from:', apiUrl); // Debug log
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      
      // For development/demo purposes, load mock data if API fails
      loadMockProducts();
    } finally {
      setLoading(false);
    }
  };

  // Load mock products for development/demo
  const loadMockProducts = () => {
    const mockProducts = [
      {
        id: 1,
        title: 'Meta Quest 3 VR Headset',
        amazon_url: 'https://www.amazon.com/dp/B0C9VBGFGJ',
        rating: 4.7,
        category: 'headsets',
        image_url: 'https://m.media-amazon.com/images/I/61J5g6hev8L._AC_SL1500_.jpg',
        price: 499.99,
        description: 'The Meta Quest 3 is our most powerful all-in-one VR headset yet. Experience breakthrough mixed reality and immersive VR with 2X the graphics processing power compared to Quest 2.'
      },
      {
        id: 2,
        title: 'Meta Quest 2 VR Headset',
        amazon_url: 'https://www.amazon.com/dp/B099VMT8VZ',
        rating: 4.5,
        category: 'headsets',
        image_url: 'https://m.media-amazon.com/images/I/615YaAiA-ML._SL1500_.jpg',
        price: 299.99,
        description: 'Experience our most advanced all-in-one VR system yet with Meta Quest 2. No PC or console required.'
      },
      {
        id: 3,
        title: 'Meta Quest Touch Pro Controllers',
        amazon_url: 'https://www.amazon.com/dp/B0BGPQFM51',
        rating: 4.3,
        category: 'controllers',
        image_url: 'https://m.media-amazon.com/images/I/61URnzGuv-L._SL1500_.jpg',
        price: 299.99,
        description: 'Meta Quest Touch Pro Controllers feature advanced haptics, precision tracking, and rechargeable batteries for the most immersive VR experience.'
      },
      {
        id: 4,
        title: 'Beat Saber - Meta Quest',
        amazon_url: 'https://www.amazon.com/dp/B07HHVPRRM',
        rating: 4.8,
        category: 'games',
        image_url: 'https://m.media-amazon.com/images/I/71+qNsYZgEL._SL1500_.jpg',
        price: 29.99,
        description: 'Beat Saber is a VR rhythm game where you slash the beats of adrenaline-pumping music as they fly towards you.'
      },
      {
        id: 5,
        title: 'KIWI design VR Stand for Meta Quest 3/2',
        amazon_url: 'https://www.amazon.com/dp/B0BJ6FKDZ1',
        rating: 4.6,
        category: 'accessories',
        image_url: 'https://m.media-amazon.com/images/I/61Lzm+VhYBL._AC_SL1500_.jpg',
        price: 39.99,
        description: 'KIWI design VR Stand is specially designed for Meta Quest 3/2 headset and controllers, providing a perfect display and storage solution.'
      },
      {
        id: 6,
        title: 'VR Lens Protector for Meta Quest 3',
        amazon_url: 'https://www.amazon.com/dp/B0CJXHJXS3',
        rating: 4.4,
        category: 'accessories',
        image_url: 'https://m.media-amazon.com/images/I/61eDx+T0nUL._AC_SL1500_.jpg',
        price: 19.99,
        description: 'Protect your Meta Quest 3 lenses from scratches, dust, and sunlight with these premium lens protectors.'
      }
    ];
    
    // Filter mock products based on current filters
    let filtered = [...mockProducts];
    
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }
    
    // Calculate total pages
    const total = Math.ceil(filtered.length / filters.itemsPerPage);
    setTotalPages(total || 1);
    
    // Paginate
    const start = (filters.page - 1) * filters.itemsPerPage;
    const end = start + filters.itemsPerPage;
    filtered = filtered.slice(start, end);
    
    setProducts(filtered);
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

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  return {
    products,
    loading,
    error,
    filters,
    totalPages,
    updateFilters,
    refreshProducts: fetchProducts
  };
};

export default useProducts; 