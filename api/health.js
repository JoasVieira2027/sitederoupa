/**
 * Vercel Serverless Function: /api/health
 * Simple diagnostic endpoint to test Vercel API and Supabase connectivity
 */

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache');
  const hasUrl = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: hasUrl,
      hasSupabaseAnonKey: hasKey,
      ready: hasUrl && hasKey
    }
  });
};
