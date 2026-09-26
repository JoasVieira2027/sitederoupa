/**
 * Vercel Serverless Function: /api/config
 * Exposes public environment variables to the frontend securely.
 * Private keys (such as SUPABASE_SERVICE_ROLE_KEY) are NEVER returned here.
 */

module.exports = (req, res) => {
  // Prevent any browser or CDN caching of configuration
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Type', 'application/json');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  res.status(200).json({
    supabaseUrl: supabaseUrl.trim(),
    supabaseAnonKey: supabaseAnonKey.trim(),
    configured: Boolean(supabaseUrl && supabaseAnonKey)
  });
};
