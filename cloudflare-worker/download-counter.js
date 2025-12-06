/**
 * Cloudflare Worker - Download Counter API
 * 
 * Endpoints:
 *   GET  /count/:projectId       - Retorna o contador atual
 *   POST /count/:projectId/up    - Incrementa e retorna o novo valor
 *   GET  /counts                 - Retorna todos os contadores
 * 
 * Setup:
 *   1. Crie um KV namespace chamado "DOWNLOADS" no Cloudflare Dashboard
 *   2. Vincule o KV ao Worker com o binding name "DOWNLOADS"
 *   3. Deploy este código como Worker
 */

const ALLOWED_ORIGINS = [
  'https://felipifernandes.com.br',
  'https://www.felipifernandes.com.br',
  'https://felipifernandes.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(request),
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request),
      });
    }

    // Route: GET /count/:projectId - Get current count
    const getMatch = path.match(/^\/count\/([a-zA-Z0-9_-]+)$/);
    if (getMatch && request.method === 'GET') {
      const projectId = getMatch[1];
      const count = await env.DOWNLOADS.get(projectId);
      return jsonResponse({ 
        projectId, 
        count: parseInt(count) || 0 
      }, 200, request);
    }

    // Route: POST /count/:projectId/up - Increment count
    const upMatch = path.match(/^\/count\/([a-zA-Z0-9_-]+)\/up$/);
    if (upMatch && request.method === 'POST') {
      const projectId = upMatch[1];
      const currentCount = parseInt(await env.DOWNLOADS.get(projectId)) || 0;
      const newCount = currentCount + 1;
      await env.DOWNLOADS.put(projectId, newCount.toString());
      return jsonResponse({ 
        projectId, 
        count: newCount 
      }, 200, request);
    }

    // Route: GET /counts - Get all counts
    if (path === '/counts' && request.method === 'GET') {
      const list = await env.DOWNLOADS.list();
      const counts = {};
      for (const key of list.keys) {
        counts[key.name] = parseInt(await env.DOWNLOADS.get(key.name)) || 0;
      }
      return jsonResponse({ counts }, 200, request);
    }

    // 404 for unknown routes
    return jsonResponse({ error: 'Not found' }, 404, request);
  },
};
