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

  let supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  let supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  // Local development fallback: parse .env if process.env is not yet populated
  if (!supabaseUrl || !supabaseAnonKey) {
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
            if (key === 'SUPABASE_URL' && !supabaseUrl) supabaseUrl = value.trim();
            if (key === 'SUPABASE_ANON_KEY' && !supabaseAnonKey) supabaseAnonKey = value.trim();
          }
        });
      }
    } catch (e) {}
  }

  res.status(200).json({
    supabaseUrl: supabaseUrl,
    supabaseAnonKey: supabaseAnonKey,
    configured: Boolean(supabaseUrl && supabaseAnonKey)
  });
};
