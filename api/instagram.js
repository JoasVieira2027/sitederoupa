/**
 * Vercel Serverless Function: /api/instagram
 *
 * Integração oficial com a Instagram Graph API (Meta).
 * - Executa 100% no servidor / serverless, NUNCA expondo o ACCESS_TOKEN no navegador.
 * - Utiliza cache em memória e headers de cache Edge (stale-while-revalidate)
 *   para evitar requisições repetitivas à Meta e garantir ZERO consumo desnecessário.
 * - Trata expiração de token, limites da API e ausência de configuração de forma segura.
 */

// Cache em memória para o runtime serverless
let memoryCache = {
  key: '',
  posts: null,
  cachedAt: 0,
  expiresAt: 0
};

module.exports = async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Obter variáveis de ambiente
  let accessToken = (process.env.INSTAGRAM_ACCESS_TOKEN || '').trim();
  let userId = (process.env.INSTAGRAM_USER_ID || process.env.INSTAGRAM_ACCOUNT_ID || '').trim();

  // Fallback local: ler .env se process.env não estiver populado localmente
  if (!accessToken) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = (match[2] || '').trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (key === 'INSTAGRAM_ACCESS_TOKEN' && !accessToken) accessToken = value.trim();
            if ((key === 'INSTAGRAM_USER_ID' || key === 'INSTAGRAM_ACCOUNT_ID') && !userId) userId = value.trim();
          }
        });
      }
    } catch (e) {
      // Ignorar falha de leitura em produção na Vercel
    }
  }

  // Parâmetros de consulta
  const limitParam = parseInt(req.query.limit, 10);
  const limit = !isNaN(limitParam) && limitParam > 0 ? Math.min(limitParam, 12) : 6;

  const cacheMinParam = parseInt(req.query.cacheMinutes, 10);
  const cacheMinutes = !isNaN(cacheMinParam) && cacheMinParam >= 15 ? Math.min(cacheMinParam, 1440) : 60; // Padrão: 60 minutos
  const cacheSeconds = cacheMinutes * 60;

  // Se o token da Meta não estiver configurado nas variáveis de ambiente:
  if (!accessToken) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
    return res.status(200).json({
      ok: true,
      configured: false,
      message: 'INSTAGRAM_ACCESS_TOKEN não configurado nas variáveis de ambiente.',
      posts: []
    });
  }

  // Verificar cache em memória
  const cacheKey = `${userId || 'me'}_${limit}`;
  const now = Date.now();
  if (memoryCache.key === cacheKey && memoryCache.posts && now < memoryCache.expiresAt) {
    res.setHeader('Cache-Control', `public, max-age=${Math.min(cacheSeconds, 3600)}, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`);
    return res.status(200).json({
      ok: true,
      configured: true,
      source: 'cache',
      cachedAt: new Date(memoryCache.cachedAt).toISOString(),
      expiresAt: new Date(memoryCache.expiresAt).toISOString(),
      posts: memoryCache.posts
    });
  }

  try {
    // Campos oficiais permitidos pela Meta Instagram Graph API
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';

    // Determina o endpoint oficial:
    // Se userId for especificado (Instagram Business / Creator vinculado a página do Facebook):
    // https://graph.facebook.com/v21.0/{userId}/media
    // Caso contrário (Instagram User Token padrão):
    // https://graph.instagram.com/v21.0/me/media
    const baseUrl = userId
      ? `https://graph.facebook.com/v21.0/${encodeURIComponent(userId)}/media`
      : `https://graph.instagram.com/v21.0/me/media`;

    const apiUrl = `${baseUrl}?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FitVibe-Store/1.0'
      }
    });

    const data = await response.json();

    // Tratamento de erros oficiais da Meta
    if (data.error) {
      console.warn('[Instagram API] Erro retornado pela Meta:', data.error);
      const isTokenExpired = data.error.code === 190 || (data.error.message && data.error.message.toLowerCase().includes('token'));
      const isRateLimit = data.error.code === 4 || data.error.code === 17 || data.error.code === 32;

      // Se temos cache antigo, servimos stale em vez de quebrar a página
      if (memoryCache.posts && memoryCache.posts.length > 0) {
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).json({
          ok: true,
          configured: true,
          source: 'stale_cache_on_error',
          error: data.error.message,
          posts: memoryCache.posts
        });
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.status(200).json({
        ok: false,
        configured: true,
        error: isTokenExpired
          ? 'Token de acesso do Instagram expirado ou inválido. Renove o token no painel.'
          : (isRateLimit ? 'Limite de requisições da Meta atingido temporariamente.' : data.error.message),
        code: data.error.code,
        posts: []
      });
    }

    // Filtrar e formatar apenas os dados estritamente necessários para exibição
    const rawList = Array.isArray(data.data) ? data.data : [];
    const formattedPosts = rawList.map(item => {
      // Para vídeos, usar thumbnail_url se disponível
      const isVideo = item.media_type === 'VIDEO';
      const imageUrl = isVideo && item.thumbnail_url ? item.thumbnail_url : item.media_url;

      return {
        id: item.id,
        caption: item.caption ? item.caption.substring(0, 160) : '',
        mediaType: item.media_type || 'IMAGE',
        mediaUrl: imageUrl || '',
        videoUrl: isVideo ? item.media_url : '',
        permalink: item.permalink || 'https://instagram.com',
        timestamp: item.timestamp || ''
      };
    }).filter(p => Boolean(p.mediaUrl && p.permalink));

    // Salvar no cache em memória
    memoryCache = {
      key: cacheKey,
      posts: formattedPosts,
      cachedAt: now,
      expiresAt: now + (cacheSeconds * 1000)
    };

    // Resposta com cabeçalhos HTTP de CDN Vercel (Edge Caching)
    res.setHeader('Cache-Control', `public, max-age=${Math.min(cacheSeconds, 3600)}, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`);
    return res.status(200).json({
      ok: true,
      configured: true,
      source: 'meta_api',
      cachedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + (cacheSeconds * 1000)).toISOString(),
      posts: formattedPosts
    });
  } catch (err) {
    console.error('[Instagram API] Erro interno:', err);

    // Fallback gracioso com cache se houver
    if (memoryCache.posts && memoryCache.posts.length > 0) {
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json({
        ok: true,
        configured: true,
        source: 'stale_cache_on_exception',
        posts: memoryCache.posts
      });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({
      ok: false,
      configured: true,
      error: 'Não foi possível conectar aos servidores da Meta no momento.',
      posts: []
    });
  }
};
