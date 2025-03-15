export async function onRequest(context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    // Parse request body
    const body = await context.request.json();
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
    const clientIP = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Get user agent for analytics (in a real app)
    const userAgent = context.request.headers.get('User-Agent') || 'unknown';
    
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