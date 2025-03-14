import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

/**
 * The DEBUG flag will do two things:
 * 1. We will skip caching on the edge, which makes it easier to debug
 * 2. We will return an error message on exception in your Response rather than the default 500 internal server error
 */
const DEBUG = false;

/**
 * Handle incoming requests to your application
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // Get the URL from the request
      const url = new URL(request.url);
      
      // Check if the request is for the API
      if (url.pathname.startsWith('/api/')) {
        // Forward to the appropriate API handler
        return await handleApiRequest(request, env, ctx);
      }
      
      // Otherwise, serve static assets
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
          cacheControl: {
            browserTTL: 60 * 60 * 24 * 365, // 1 year
            edgeTTL: 60 * 60 * 24 * 30, // 30 days
            bypassCache: false,
          },
        }
      );
    } catch (e) {
      if (DEBUG) {
        return new Response(e.message || e.toString(), {
          status: 500,
        });
      }
      return new Response('Internal Error', { status: 500 });
    }
  },
};

/**
 * Handle API requests
 */
async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  try {
    // Route to the appropriate handler based on the path
    if (path === 'games' || path.startsWith('games?')) {
      // Games API
      return await handleGamesApi(request, env, headers);
    } else if (path === 'track-play') {
      // Track play API
      return await handleTrackPlayApi(request, env, headers);
    }
    
    // Return 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers
    });
  }
}

/**
 * Handle games API
 */
async function handleGamesApi(request, env, headers) {
  // Mock games data (in a real app, this would come from a database)
  const mockGames = [
    {
      id: 1,
      title: 'Space Explorer VR',
      description: 'Explore the vastness of space in this immersive VR experience.',
      category: 'adventure',
      imageUrl: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      gameUrl: 'https://playcanv.as/p/RqJJ9oU9/',
      featured: true,
      rating: 4.8,
      playCount: 1250,
      createdAt: '2023-01-15T12:00:00Z'
    },
    // Add more mock games here...
  ];
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }
  
  // Parse query parameters
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'all';
  const search = url.searchParams.get('search') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '12', 10);
  
  // Filter games
  let filteredGames = [...mockGames];
  
  // Apply category filter
  if (category !== 'all') {
    filteredGames = filteredGames.filter(game => game.category === category);
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredGames = filteredGames.filter(game => 
      game.title.toLowerCase().includes(searchLower) || 
      game.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Calculate total pages
  const totalGames = filteredGames.length;
  const totalPages = Math.ceil(totalGames / limit) || 1;
  
  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedGames = filteredGames.slice(startIndex, endIndex);
  
  // Return response
  return new Response(JSON.stringify({
    games: paginatedGames,
    totalGames,
    totalPages,
    currentPage: page
  }), { headers });
}

/**
 * Handle track play API
 */
async function handleTrackPlayApi(request, env, headers) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }
  
  try {
    // Parse request body
    const body = await request.json();
    const { gameId } = body;
    
    if (!gameId) {
      return new Response(JSON.stringify({ error: 'Game ID is required' }), {
        status: 400,
        headers
      });
    }
    
    // In a real application, we would update the play count in a database
    // For this demo, we'll just return a success response
    
    // Get client IP for analytics (in a real app)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Get user agent for analytics (in a real app)
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    
    // Log the play (in a real app, this would go to a database or analytics service)
    console.log(`Game play tracked - Game ID: ${gameId}, IP: ${clientIP}, User Agent: ${userAgent}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Play tracked successfully',
      gameId
    }), { headers });
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers
    });
  }
} 