/**
 * Vercel Serverless Function: /api/health
 * Simple diagnostic endpoint to test Vercel API and Supabase connectivity
 */

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache');
  let hasUrl = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  let hasKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasUrl || !hasKey) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        if (/SUPABASE_URL\s*=\s*https?:\/\//i.test(content)) hasUrl = true;
        if (/SUPABASE_ANON_KEY\s*=\s*ey/i.test(content)) hasKey = true;
      }
    } catch (e) {}
  }

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
