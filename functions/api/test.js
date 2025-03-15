export async function onRequest(context) {
  return new Response(JSON.stringify({ 
    message: 'Hello from TryVR API!', 
    success: true 
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 