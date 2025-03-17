/**
 * Simple status endpoint to check if the API is running
 */
export async function onRequest(context) {
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

  // Get environment information
  const environment = context.env.ENVIRONMENT || 'development';
  const deploymentId = context.env.CF_PAGES_COMMIT_SHA || 'local';
  const deploymentBranch = context.env.CF_PAGES_BRANCH || 'local';
  
  // Return status information
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment,
    deployment: {
      id: deploymentId,
      branch: deploymentBranch
    },
    version: '1.0.0'
  }), { headers });
} 