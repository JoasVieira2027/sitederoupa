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
      // 1. Try sessionStorage cache first to avoid multiple /api/config calls during navigation
      try {
        const cached = sessionStorage.getItem('fashion_api_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
            return {
              url: parsed.supabaseUrl,
              anonKey: parsed.supabaseAnonKey,
              source: 'vercel_env_cached'
            };
          }
        }
      } catch (e) {}

      // 2. Try Vercel Serverless Function /api/config com timeout rápido (1200ms)
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 1200) : null;
        const res = await fetch('/api/config', controller ? { signal: controller.signal } : {});
        if (timeoutId) clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.supabaseUrl && data.supabaseAnonKey) {
            try {
              sessionStorage.setItem('fashion_api_config', JSON.stringify(data));
            } catch (e) {}
            return {
              url: data.supabaseUrl,
              anonKey: data.supabaseAnonKey,
              source: 'vercel_env'
            };
          }
        }
      } catch (err) {
        // Not running on web server with /api/config, timeout or running locally
      }

      // 3. Check localStorage override (useful for local development or admin panel config)
      try {
        const stored = localStorage.getItem('fashion_supabase_config');
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

      // 4. Check window global override if defined
      if (window.__SUPABASE_CONFIG__ && window.__SUPABASE_CONFIG__.url && window.__SUPABASE_CONFIG__.anonKey) {
        return {
          url: window.__SUPABASE_CONFIG__.url,
          anonKey: window.__SUPABASE_CONFIG__.anonKey,
          source: 'window_global'
        };
      }

      // 5. Built-in project configuration fallback (guarantees connectivity across all hosts and devices)
      const DEFAULT_URL = 'https://vsetnxbjzwimipofibhw.supabase.co';
      const DEFAULT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZXRueGJqendpbWlwb2ZpYmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NjAzMTMsImV4cCI6MjEwNjUzNjMxM30.9vdcciYa7jh1unUkF4GR6dOBBXHXpk1ATybdmiQUUmU';

      return {
        url: DEFAULT_URL,
        anonKey: DEFAULT_ANON,
        source: 'project_default'
      };
    },

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
                storageKey: 'fashion_sb_auth'
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
          console.info('[Supabase] Credenciais não detectadas no servidor. O site continuará operando com persistência local de alta velocidade.');
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
      localStorage.setItem('fashion_supabase_config', JSON.stringify(config));
      clientInstance = null;
      return this.init();
    },

    clearManualConfig() {
      localStorage.removeItem('fashion_supabase_config');
      clientInstance = null;
    },

    /**
     * Customer & Admin Authentication helpers
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

    async signUp(name, email, password) {
      const client = await this.init();
      if (!client) {
        return { error: { message: 'Supabase não está conectado.' } };
      }
      const cleanName = (name || '').trim();
      const res = await client.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: cleanName,
            full_name: cleanName
          }
        }
      });

      // Se o usuário foi criado imediatamente (sem confirmação de e-mail obrigatória)
      if (res.data && res.data.user && !res.error) {
        try {
          await this.saveProfile(res.data.user.id, { name: cleanName });
        } catch (e) {
          console.warn('[Supabase] Perfil será sincronizado no primeiro login:', e);
        }
      }

      return res;
    },

    /**
     * Login oficial com Google via Supabase OAuth
     */
    async signInWithGoogle() {
      const client = await this.init();
      if (!client) {
        return { error: { message: 'Supabase não está conectado.' } };
      }
      const redirectUrl = window.location.origin + window.location.pathname;
      return client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
    },

    /**
     * Recuperação de senha por e-mail oficial
     */
    async resetPassword(email) {
      const client = await this.init();
      if (!client) {
        return { error: { message: 'Supabase não está conectado.' } };
      }
      const redirectUrl = window.location.origin + window.location.pathname;
      return client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });
    },

    /**
     * Atualização de senha pelo usuário logado
     */
    async updatePassword(newPassword) {
      const client = await this.init();
      if (!client) {
        return { error: { message: 'Supabase não está conectado.' } };
      }
      return client.auth.updateUser({
        password: newPassword.trim()
      });
    },

    /**
     * Escuta alterações de estado de autenticação (LOGIN, LOGOUT, RECOVERY, etc.)
     */
    onAuthStateChange(callback) {
      if (!clientInstance) {
        this.init().then(client => {
          if (client && client.auth) {
            client.auth.onAuthStateChange(callback);
          }
        });
        return;
      }
      return clientInstance.auth.onAuthStateChange(callback);
    },

    async signOut() {
      if (clientInstance) {
        try {
          await clientInstance.auth.signOut();
        } catch (e) {}
      }
      sessionStorage.removeItem('fashion_admin_logged');
      try {
        localStorage.removeItem('fashion_customer_profile_cache');
      } catch (e) {}
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
     * Customer Profile Management
     */
    async getProfile(userId) {
      const client = await this.init();
      if (!client || !userId) return null;
      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          // Fallback gracioso se a tabela ainda não tiver sido criada no Supabase
          console.warn('[Supabase] Consulta ao perfil:', error.message);
          return null;
        }
        return data;
      } catch (err) {
        console.warn('[Supabase] Erro ao carregar perfil:', err);
        return null;
      }
    },

    async saveProfile(userId, profileData) {
      const client = await this.init();
      if (!client || !userId) return null;
      try {
        const payload = {
          user_id: userId,
          name: (profileData.name || '').trim(),
          phone: (profileData.phone || '').trim(),
          default_address: profileData.default_address || {},
          updated_at: new Date().toISOString()
        };

        const { data, error } = await client
          .from('profiles')
          .upsert(payload, { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        if (error) {
          console.warn('[Supabase] Falha ao persistir perfil na tabela profiles:', error.message);
          return null;
        }
        return data;
      } catch (err) {
        console.warn('[Supabase] Erro ao salvar perfil:', err);
        return null;
      }
    },

    /**
     * Buscar pedidos exclusivos do cliente autenticado
     */
    async getCustomerOrders(userId) {
      const client = await this.init();
      if (!client || !userId) return [];
      try {
        const { data, error } = await client
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Supabase] Erro ao buscar pedidos do cliente:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[Supabase] Exceção ao carregar pedidos do cliente:', err);
        return [];
      }
    },

    /**
     * ============================================================
     * PROGRAMA DE FIDELIDADE (SUPABASE AUTH & RPC ATÔMICOS)
     * ============================================================
     */

    /**
     * Buscar conta de fidelidade do cliente autenticado
     */
    async getLoyaltyAccount(userId) {
      const client = await this.init();
      if (!client || !userId) return null;
      try {
        const { data, error } = await client
          .from('loyalty_accounts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.warn('[Supabase Loyalty] Consulta à conta:', error.message);
          return null;
        }
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] Erro ao carregar conta:', err);
        return null;
      }
    },

    /**
     * Buscar histórico de transações de pontos do cliente
     */
    async getLoyaltyTransactions(userId) {
      const client = await this.init();
      if (!client || !userId) return [];
      try {
        const { data, error } = await client
          .from('loyalty_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Supabase Loyalty] Erro ao buscar extrato:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[Supabase Loyalty] Erro no extrato:', err);
        return [];
      }
    },

    /**
     * Buscar catálogo de recompensas disponíveis
     */
    async getLoyaltyRewards() {
      const client = await this.init();
      if (!client) return [];
      try {
        const { data, error } = await client
          .from('loyalty_rewards')
          .select('*')
          .eq('active', true)
          .order('order_num', { ascending: true });

        if (error) {
          console.warn('[Supabase Loyalty] Erro ao listar recompensas:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[Supabase Loyalty] Erro ao buscar recompensas:', err);
        return [];
      }
    },

    /**
     * Buscar cupons ativos do cliente autenticado
     */
    async getLoyaltyCoupons(userId) {
      const client = await this.init();
      if (!client || !userId) return [];
      try {
        const { data, error } = await client
          .from('loyalty_coupons')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Supabase Loyalty] Erro ao listar cupons:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[Supabase Loyalty] Erro ao carregar cupons:', err);
        return [];
      }
    },

    /**
     * Buscar missões ativas e progresso do cliente
     */
    async getLoyaltyMissions(userId) {
      const client = await this.init();
      if (!client) return { missions: [], userMissions: [] };
      try {
        const { data: missions, error: mErr } = await client
          .from('loyalty_missions')
          .select('*')
          .eq('active', true)
          .order('order_num', { ascending: true });

        if (mErr) throw mErr;

        let userMissions = [];
        if (userId) {
          const { data: uMissions } = await client
            .from('loyalty_user_missions')
            .select('*')
            .eq('user_id', userId);
          userMissions = uMissions || [];
        }

        return { missions: missions || [], userMissions };
      } catch (err) {
        console.warn('[Supabase Loyalty] Erro ao buscar missões:', err);
        return { missions: [], userMissions: [] };
      }
    },

    /**
     * Realizar Check-in diário no servidor via RPC atômica
     */
    async claimDailyCheckin() {
      const client = await this.init();
      if (!client) throw new Error('Supabase não conectado.');
      try {
        const { data, error } = await client.rpc('loyalty_claim_daily_checkin');
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] RPC claimDailyCheckin falhou:', err.message);
        throw err;
      }
    },

    /**
     * Seguir a loja no servidor via RPC atômica
     */
    async followStore() {
      const client = await this.init();
      if (!client) throw new Error('Supabase não conectado.');
      try {
        const { data, error } = await client.rpc('loyalty_follow_store');
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] RPC followStore falhou:', err.message);
        throw err;
      }
    },

    /**
     * Resgatar recompensa gerando cupom atômico no servidor
     */
    async redeemReward(rewardId) {
      const client = await this.init();
      if (!client) throw new Error('Supabase não conectado.');
      try {
        const { data, error } = await client.rpc('loyalty_redeem_reward', { p_reward_id: rewardId });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] RPC redeemReward falhou:', err.message);
        throw err;
      }
    },

    /**
     * Validar cupom no checkout no servidor
     */
    async validateCoupon(code, subtotal) {
      const client = await this.init();
      if (!client) throw new Error('Supabase não conectado.');
      try {
        const { data, error } = await client.rpc('loyalty_validate_coupon', {
          p_code: code,
          p_subtotal: parseFloat(subtotal) || 0
        });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] RPC validateCoupon falhou:', err.message);
        throw err;
      }
    },

    /**
     * Enviar avaliação de produto com pontos atômicos
     */
    async submitProductReview(productId, rating, comment, hasPhoto = false, photoUrl = '') {
      const client = await this.init();
      if (!client) throw new Error('Supabase não conectado.');
      try {
        const { data, error } = await client.rpc('loyalty_submit_review', {
          p_product_id: productId,
          p_rating: rating,
          p_comment: comment,
          p_has_photo: Boolean(hasPhoto),
          p_photo_url: photoUrl || ''
        });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] RPC submitProductReview falhou:', err.message);
        throw err;
      }
    },

    /**
     * Buscar avaliações aprovadas de um produto
     */
    async getProductReviews(productId) {
      const client = await this.init();
      if (!client || !productId) return [];
      try {
        const { data, error } = await client
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Supabase Reviews] Erro ao buscar avaliações:', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[Supabase Reviews] Exceção ao carregar avaliações:', err);
        return [];
      }
    },

    /**
     * Creditar pontos por pedido aprovado via RPC
     */
    async processOrderPoints(orderId, userId, orderTotal, orderStatus = 'novo') {
      const client = await this.init();
      if (!client || !userId) return null;
      try {
        const { data, error } = await client.rpc('loyalty_process_order_points', {
          p_order_id: orderId,
          p_user_id: userId,
          p_order_total: parseFloat(orderTotal) || 0,
          p_order_status: orderStatus
        });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] RPC processOrderPoints falhou:', err.message);
        return null;
      }
    },

    /**
     * Ajuste manual de pontos pelo administrador (com auditoria)
     */
    async adminAdjustPoints(targetUserId, points, reason) {
      const client = await this.init();
      if (!client) throw new Error('Supabase não conectado.');
      try {
        const { data, error } = await client.rpc('loyalty_admin_adjust_points', {
          p_target_user_id: targetUserId,
          p_points: parseInt(points, 10),
          p_reason: reason
        });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[Supabase Loyalty] RPC adminAdjustPoints falhou:', err.message);
        throw err;
      }
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
        .upload(filePath, file, { cacheControl: '604800', upsert: true });

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
