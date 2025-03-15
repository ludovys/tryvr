// API endpoint to find games without valid images
import { mockGames } from './games.js';

export async function onRequest(context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow GET requests
  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    // Function to check if an image URL is valid
    async function isImageValid(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok && response.headers.get('content-type')?.startsWith('image/');
      } catch (error) {
        return false;
      }
    }

    // Find games with missing or invalid image URLs
    const gamesWithoutImages = [];
    
    for (const game of mockGames) {
      // Check if imageUrl is missing or empty
      if (!game.imageUrl || game.imageUrl.trim() === '') {
        gamesWithoutImages.push({
          ...game,
          imageStatus: 'missing'
        });
        continue;
      }
      
      // Check if the image URL is valid
      const isValid = await isImageValid(game.imageUrl);
      if (!isValid) {
        gamesWithoutImages.push({
          ...game,
          imageStatus: 'invalid'
        });
      }
    }
    
    // Return response
    return new Response(JSON.stringify({
      gamesWithoutImages,
      count: gamesWithoutImages.length,
      totalGames: mockGames.length
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