/**
 * supabase-client.js - Supabase Client Initialization & Authentication Service
 * Seamlessly connects to Supabase via Vercel Environment Variables (/api/config)
 * or local fallback configuration.
 */

(function() {
  'use strict';

  let clientInstance = null;
  let clientConfig = null;
  let isInitializing = false;
  const initCallbacks = [];

  const SupabaseService = {
    /**
     * Fetch configuration from /api/config or localStorage fallback
     */
    async fetchConfig() {
      // 1. Try Vercel Serverless Function /api/config
      try {
        const res = await fetch('/api/config', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.supabaseUrl && data.supabaseAnonKey) {
            return {
              url: data.supabaseUrl,
              anonKey: data.supabaseAnonKey,
              source: 'vercel_env'
            };
          }
        }
      } catch (err) {
        // Not running on web server with /api/config or running locally via file://
      }

      // 2. Check localStorage override (useful for local development or admin panel config)
      try {
        const stored = localStorage.getItem('dolcearte_supabase_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.url && parsed.anonKey) {
            return {
              url: parsed.url,
              anonKey: parsed.anonKey,
              source: 'local_storage'
            };
          }
        }
      } catch (e) {}

      // 3. Check window global override if defined
      if (window.__SUPABASE_CONFIG__ && window.__SUPABASE_CONFIG__.url && window.__SUPABASE_CONFIG__.anonKey) {
        return {
          url: window.__SUPABASE_CONFIG__.url,
          anonKey: window.__SUPABASE_CONFIG__.anonKey,
          source: 'window_global'
        };
      }

      // 4. Default project credentials
      return {
        url: 'https://nhcpeuwrfljlcujxnlmp.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oY3BldXdyZmxqbGN1anhubG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzQ0OTIsImV4cCI6MjEwNjAxMDQ5Mn0.UvonxRI8rjOihlyuqCWqbtHFWpFlKE_0Qynjg5-4JyQ',
        source: 'default_project'
      };

    /**
     * Initialize Supabase client
     */
    async init() {
      if (clientInstance) return clientInstance;
      if (isInitializing) {
        return new Promise(resolve => initCallbacks.push(resolve));
      }

      isInitializing = true;

      try {
        clientConfig = await this.fetchConfig();

        if (clientConfig && clientConfig.url && clientConfig.anonKey) {
          if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            clientInstance = window.supabase.createClient(clientConfig.url, clientConfig.anonKey, {
              auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey: 'dolcearte_sb_auth'
              },
              realtime: {
                params: {
                  eventsPerSecond: 10
                }
              }
            });
            console.log(`[Supabase] Conectado com sucesso via ${clientConfig.source}`);
          } else {
            console.warn('[Supabase] Biblioteca @supabase/supabase-js não carregada');
          }
        } else {
          console.warn('[Supabase] Credenciais não configuradas. Acesse /api/config ou defina as variáveis na Vercel.');
        }
      } catch (err) {
        console.error('[Supabase] Erro ao inicializar:', err);
      } finally {
        isInitializing = false;
        initCallbacks.forEach(cb => cb(clientInstance));
        initCallbacks.length = 0;
      }

      return clientInstance;
    },

    getClient() {
      return clientInstance;
    },

    isConfigured() {
      return Boolean(clientInstance && clientConfig && clientConfig.url && clientConfig.anonKey);
    },

    getConfig() {
      return clientConfig;
    },

    /**
     * Save manual configuration (e.g. from Admin settings tab for testing)
     */
    saveManualConfig(url, anonKey) {
      if (!url || !anonKey) return false;
      const config = { url: url.trim(), anonKey: anonKey.trim() };
      localStorage.setItem('dolcearte_supabase_config', JSON.stringify(config));
      clientInstance = null;
      return this.init();
    },

    clearManualConfig() {
      localStorage.removeItem('dolcearte_supabase_config');
      clientInstance = null;
    },

    /**
     * Authentication helpers
     */
    async signIn(email, password) {
      const client = await this.init();
      if (!client) {
        return { error: { message: 'Supabase não está conectado. Configure as variáveis de ambiente.' } };
      }
      return client.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
    },

    async signOut() {
      if (clientInstance) {
        try {
          await clientInstance.auth.signOut();
        } catch (e) {}
      }
      sessionStorage.removeItem('dolcearte_admin_logged');
    },

    async getSession() {
      const client = await this.init();
      if (!client) return null;
      try {
        const { data } = await client.auth.getSession();
        return data.session;
      } catch (e) {
        return null;
      }
    },

    async isAuthenticated() {
      const session = await this.getSession();
      return Boolean(session && session.user);
    },

    async getCurrentUser() {
      const session = await this.getSession();
      return session ? session.user : null;
    },

    /**
     * Upload image to Supabase Storage bucket
     */
    async uploadImage(file, bucket = 'products') {
      const client = await this.init();
      if (!client) throw new Error('Supabase não está conectado.');
      
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = cleanFileName;

      const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) throw error;

      const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    }
  };

  // Expose to window
  window.SupabaseService = SupabaseService;

})();
