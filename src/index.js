/**
 * Cloudflare Worker — CORS proxy for Anthropic API
 * Serves static assets + proxies /api/claude → api.anthropic.com
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }

    // Proxy: POST /api/claude
    if (url.pathname === '/api/claude' && request.method === 'POST') {
      return proxyToAnthropic(request);
    }

    // Serve static files (index.html, _headers, etc.)
    return env.ASSETS.fetch(request);
  },
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
  };
}

async function proxyToAnthropic(request) {
  const apiKey = request.headers.get('x-api-key') || '';

  if (!apiKey.startsWith('sk-ant-')) {
    return new Response(
      JSON.stringify({ error: { type: 'auth_error', message: 'Неверный API ключ. Получи на console.anthropic.com' } }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }

  let body;
  try {
    body = await request.text();
  } catch {
    return new Response(
      JSON.stringify({ error: { type: 'invalid_request', message: 'Не удалось прочитать тело запроса' } }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...cors() } }
    );
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body,
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', ...cors() },
  });
}
