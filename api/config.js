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

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nhcpeuwrfljlcujxnlmp.supabase.co';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oY3BldXdyZmxqbGN1anhubG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzQ0OTIsImV4cCI6MjEwNjAxMDQ5Mn0.UvonxRI8rjOihlyuqCWqbtHFWpFlKE_0Qynjg5-4JyQ';

  res.status(200).json({
    supabaseUrl: supabaseUrl.trim(),
    supabaseAnonKey: supabaseAnonKey.trim(),
    configured: Boolean(supabaseUrl && supabaseAnonKey)
  });
};
