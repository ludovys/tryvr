import { onRequest as gamesHandler } from './games.js';
import { onRequest as trackPlayHandler } from './track-play.js';

export async function onRequest(context) {
  // Extract the path from the URL
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/api/', '');

  // Route to the appropriate handler based on the path
  if (path === 'games' || path.startsWith('games?')) {
    return gamesHandler(context);
  } else if (path === 'track-play') {
    return trackPlayHandler(context);
  }

  // Return 404 for unknown routes
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
} 