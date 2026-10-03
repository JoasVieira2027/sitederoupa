/**
 * data.js - Camada de Dados para Loja de Roupas
 * Suporte completo a variantes: cor, tamanho e quantidade por SKU.
 * Persistência no Supabase com fallback em localStorage.
 */

const DB_KEYS = {
  PRODUCTS: 'fashion_products',
  ORDERS: 'fashion_orders',
  SETTINGS: 'fashion_settings',
  CATEGORIES: 'fashion_categories',
  CACHE_META: 'fashion_cache_meta'
};

// Cache TTL de 10 minutos para visitantes públicos
const CACHE_TTL_MS = 10 * 60 * 1000;

// ===== DEFAULT PRODUCTS (FITNESS) =====
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_legging_sculpt',
    name: 'Legging Sculpt Sem Costura Cós Alto',
    category: 'Leggings',
    price: 139.90,
    badge: 'Zero Transparência',
    description: 'Legging com tecnologia seamless (sem costura lateral), compressão ideal que modela e empina o bumbum sem apertar. Cós alto duplo anatômico que não enrola durante o agachamento ou corrida. Tecido respirável e 100% à prova de agachamento.',
    image: 'assets/images/legging_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Grafite Mescla', colorHex: '#4A4A4A', image: 'assets/images/legging_fitness.jpg', sizes: [{ size: 'PP', qty: 4 }, { size: 'P', qty: 8 }, { size: 'M', qty: 10 }, { size: 'G', qty: 6 }, { size: 'GG', qty: 3 }] },
      { color: 'Preto Ônix', colorHex: '#1E1E1E', image: 'assets/images/legging_fitness.jpg', sizes: [{ size: 'PP', qty: 5 }, { size: 'P', qty: 12 }, { size: 'M', qty: 14 }, { size: 'G', qty: 8 }, { size: 'GG', qty: 4 }] },
      { color: 'Verde Militar', colorHex: '#3A4D39', image: 'assets/images/legging_fitness.jpg', sizes: [{ size: 'P', qty: 6 }, { size: 'M', qty: 8 }, { size: 'G', qty: 5 }] }
    ],
    promotion: { active: true, discountPercent: 10 }
  },
  {
    id: 'prod_top_cross',
    name: 'Top Fitness Alta Sustentação Alças Cruzadas',
    category: 'Tops & Croppeds',
    price: 79.90,
    badge: 'Alta Sustentação',
    description: 'Top fitness projetado para treinos de médio e alto impacto. Costas com alças cruzadas que distribuem o peso e garantem total mobilidade para membros superiores. Acompanha bojo removível e forro interno antibacteriano.',
    image: 'assets/images/top_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Grafite Mescla', colorHex: '#4A4A4A', image: 'assets/images/top_fitness.jpg', sizes: [{ size: 'PP', qty: 5 }, { size: 'P', qty: 10 }, { size: 'M', qty: 9 }, { size: 'G', qty: 5 }, { size: 'GG', qty: 2 }] },
      { color: 'Preto Ônix', colorHex: '#1E1E1E', image: 'assets/images/top_fitness.jpg', sizes: [{ size: 'P', qty: 8 }, { size: 'M', qty: 10 }, { size: 'G', qty: 6 }] },
      { color: 'Vinho Borgonha', colorHex: '#5A1827', image: 'assets/images/top_fitness.jpg', sizes: [{ size: 'P', qty: 4 }, { size: 'M', qty: 6 }, { size: 'G', qty: 3 }] }
    ],
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_conjunto_active',
    name: 'Conjunto Activewear Seamless Wave (Top + Biker)',
    category: 'Conjuntos',
    price: 189.90,
    badge: 'Mais Vendido',
    description: 'Conjunto fitness completo com top estruturado e short biker de alta compressão. Confeccionado em poliamida premium com elastano, toque gelado, secagem rápida e proteção UV50+. Combinação perfeita de estilo e praticidade para o treino.',
    image: 'assets/images/conjunto_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Verde Oliva', colorHex: '#556B2F', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'P', qty: 6 }, { size: 'M', qty: 9 }, { size: 'G', qty: 5 }, { size: 'GG', qty: 2 }] },
      { color: 'Preto Carbono', colorHex: '#1A1A1A', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'P', qty: 7 }, { size: 'M', qty: 8 }, { size: 'G', qty: 4 }] },
      { color: 'Terracota', colorHex: '#A0522D', image: 'assets/images/conjunto_fitness.jpg', sizes: [{ size: 'P', qty: 3 }, { size: 'M', qty: 5 }, { size: 'G', qty: 2 }] }
    ],
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_short_biker',
    name: 'Short Biker Compressão com Bolso Lateral para Celular',
    category: 'Shorts & Bermudas',
    price: 99.90,
    badge: 'Com Bolso',
    description: 'Bermuda ciclista fitness com bolso lateral profundo perfeito para celular, chave ou documentos. Comprimento meia coxa que não sobe ao caminhar, correr ou pedalar. Costuras reforçadas planas (flatlock) que não marcam a pele.',
    image: 'assets/images/short_fitness.jpg',
    active: true,
    inStock: true,
    featured: true,
    variants: [
      { color: 'Preto Ônix', colorHex: '#1E1E1E', image: 'assets/images/short_fitness.jpg', sizes: [{ size: 'PP', qty: 4 }, { size: 'P', qty: 10 }, { size: 'M', qty: 12 }, { size: 'G', qty: 8 }, { size: 'GG', qty: 4 }] },
      { color: 'Azul Marinho', colorHex: '#1B263B', image: 'assets/images/short_fitness.jpg', sizes: [{ size: 'P', qty: 5 }, { size: 'M', qty: 6 }, { size: 'G', qty: 4 }] },
      { color: 'Chumbo', colorHex: '#3D3D3D', image: 'assets/images/short_fitness.jpg', sizes: [{ size: 'P', qty: 4 }, { size: 'M', qty: 5 }, { size: 'G', qty: 3 }] }
    ],
    promotion: { active: true, discountPercent: 15 }
  }
];

// ===== DEFAULT CATEGORIES (FITNESS) =====
const DEFAULT_CATEGORIES = [
  { id: 'cat_leggings', name: 'Leggings', icon: '👖' },
  { id: 'cat_tops', name: 'Tops & Croppeds', icon: '🎽' },
  { id: 'cat_conjuntos', name: 'Conjuntos', icon: '⚡' },
  { id: 'cat_shorts', name: 'Shorts & Bermudas', icon: '🩳' },
  { id: 'cat_macacoes', name: 'Macacões', icon: '🧘‍♀️' },
  { id: 'cat_acessorios', name: 'Acessórios', icon: '🎒' }
];

// ===== DEFAULT SETTINGS (FITNESS) =====
const DEFAULT_SETTINGS = {
  storeName: 'Fit Vibe Activewear',
  storeTagline: 'Roupas Fitness de Alta Performance',
  storeLogoEmoji: '⚡',
  storeLogoImage: '',
  themeColor: '#059669',
  announcementBar: { active: true, text: '⚡ FRETE GRÁTIS nas compras acima de R$ 199 | Peças Zero Transparência!' },
  featuredCollection: {
    active: true,
    title: 'Nova Coleção 2026',
    subtitle: 'Lançamentos e peças exclusivas com tecnologia seamless e alta compressão'
  },
  hero: {
    emoji: '⚡',
    title: 'Treine com Estilo, <em>Supere Limites</em>',
    subtitle: 'Activewear premium com modelagem anatômica, alta compressão e zero transparência para seu melhor desempenho.',
    ctaText: '⚡ Ver Coleção Fitness',
    badgeText: 'Alta Performance'
  },
  about: {
    active: true,
    title: 'Tecnologia, Conforto & Performance',
    subtitle: 'Criado para mover o seu melhor',
    text: 'A Fit Vibe desenvolve peças esportivas com tecidos nobres e tecnologia têxtil de ponta. Modelagens exclusivas que valorizam a silhueta, oferecem sustentação máxima e acompanham cada movimento do seu dia com total segurança.',
    features: [
      { icon: '🛡️', title: 'Zero Transparência', desc: 'Gramatura reforçada para agachamentos sem medo' },
      { icon: '💨', title: 'Tecnologia Dry-Fit', desc: 'Respirabilidade máxima que evapora o suor rapidamente' },
      { icon: '⚡', title: 'Alta Compressão', desc: 'Cós anatômico duplo que não enrola durante o treino' },
      { icon: '🔄', title: 'Troca Fácil', desc: 'Primeira troca 100% grátis e sem burocracia' }
    ]
  },
  delivery: {
    deliveryEnabled: true,
    deliveryFee: 15.00,
    freeDeliveryThreshold: 199.00,
    estimatedTime: '2 a 5 dias úteis',
    pickupEnabled: true,
    pickupAddress: 'Consulte o ponto de retirada pelo WhatsApp',
    pickupEstimate: 'Pronto em até 2 horas'
  },
  instagramFeed: {
    active: true,
    title: 'Siga nosso Instagram',
    subtitle: 'Confira nossos treinos, novidades e bastidores exclusivos',
    handle: '@fitvibe.activewear',
    profileUrl: 'https://instagram.com/fitvibe.activewear',
    bio: 'Activewear premium com modelagem anatômica e zero transparência',
    posts: [
      {
        id: 'ig_post_1',
        image: 'assets/images/legging_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Legging Seamless Compressão Máxima. Zero transparência no agachamento.',
        featured: true
      },
      {
        id: 'ig_post_2',
        image: 'assets/images/top_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Top Nadador com sustentação reforçada e tecido tecnológico dry-fit.',
        featured: false
      },
      {
        id: 'ig_post_3',
        image: 'assets/images/conjunto_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Conjunto Verde Oliva: conforto e elegância em cada treino.',
        featured: false
      },
      {
        id: 'ig_post_4',
        image: 'assets/images/short_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Short Runner com cós duplo anatômico que não enrola.',
        featured: false
      },
      {
        id: 'ig_post_5',
        image: 'assets/images/hero_fitness.jpg',
        postUrl: 'https://instagram.com',
        caption: 'Nova Coleção: tecnologia têxtil para acompanhar sua melhor performance.',
        featured: false
      }
    ]
  },
  whatsappNumber: '5511999999999',
  contactPhone: '(11) 99999-9999',
  instagram: '@fitvibe.activewear',
  address: 'Rua do Fitness, 120 - São Paulo, SP',
  footerCopyright: '© 2026 Fit Vibe Activewear. Todos os direitos reservados.',
  paymentMethods: [
    { id: 'pix', name: 'Pix (Aprovação Imediata)', icon: '📱', active: true },
    { id: 'credito', name: 'Cartão de Crédito', icon: '💳', active: true },
    { id: 'debito', name: 'Cartão de Débito', icon: '💳', active: true },
    { id: 'dinheiro', name: 'Dinheiro na Entrega', icon: '💵', active: true }
  ],
  pixDetails: { key: '', keyType: 'Celular', receiverName: 'Fit Vibe Moda Fitness', instructions: 'Faça o Pix e envie o comprovante pelo WhatsApp para envio imediato!' },
  storeOpen: true,
  closedCustomMessage: 'Estamos fora do horário de atendimento. Deixe sua mensagem no WhatsApp que responderemos rapidinho!',
  operatingHours: {
    segunda: { active: true, open: '08:00', close: '20:00' },
    terca: { active: true, open: '08:00', close: '20:00' },
    quarta: { active: true, open: '08:00', close: '20:00' },
    quinta: { active: true, open: '08:00', close: '20:00' },
    sexta: { active: true, open: '08:00', close: '20:00' },
    sabado: { active: true, open: '08:00', close: '18:00' },
    domingo: { active: false, open: '00:00', close: '00:00' }
  },
  closures: [],
  availableSizes: ['PP', 'P', 'M', 'G', 'GG'],
  adminPassword: 'admin123'
};

// ============================================================
//  DataStore — Singleton
// ============================================================
const DataStore = (function () {
  'use strict';

  let _products = [];
  let _categories = [];
  let _orders = [];
  let _settings = { ...DEFAULT_SETTINGS };
  let _initialized = false;
  let _supabase = null;
  let _isAdmin = false;
  let _realtimeChannel = null;

  // ===== CACHE HELPERS =====
  function _getCacheMeta() {
    try { return JSON.parse(localStorage.getItem(DB_KEYS.CACHE_META) || '{}'); } catch { return {}; }
  }

  function _setCacheMeta(key, ts) {
    const meta = _getCacheMeta();
    meta[key] = ts;
    try { localStorage.setItem(DB_KEYS.CACHE_META, JSON.stringify(meta)); } catch {}
  }

  function _isCacheValid(key) {
    if (_isAdmin) return false;
    const meta = _getCacheMeta();
    return meta[key] && (Date.now() - meta[key]) < CACHE_TTL_MS;
  }

  function _saveLocal(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); _setCacheMeta(key, Date.now()); } catch {}
  }

  function _loadLocal(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
  }

  // ===== MAPPERS: Supabase → JS (snake_case → camelCase) =====
  function _mapProduct(row) {
    const v = row.variants || row.variants === null ? (row.variants || []) : [];
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: parseFloat(row.price) || 0,
      image: row.image || '',
      category: row.category,
      badge: row.badge || '',
      active: row.active !== false,
      inStock: row.in_stock !== false,
      featured: row.featured === true || Boolean(row.badge && row.badge.toLowerCase().includes('destaque')),
      variants: Array.isArray(v) ? v.map(item => ({
        color: item.color || '',
        colorHex: item.colorHex || '#059669',
        image: item.image || '',
        sizes: Array.isArray(item.sizes) ? item.sizes : []
      })) : [],
      promotion: row.promotion || { active: false, discountPercent: 0 },
      displayOrder: row.display_order || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  function _mapSettings(row) {
    if (!row) return { ...DEFAULT_SETTINGS };
    const parseJsonField = (val, def) => {
      if (val && typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : def; } catch { return def; }
    };
    return {
      storeName: row.store_name || DEFAULT_SETTINGS.storeName,
      storeTagline: row.store_tagline || DEFAULT_SETTINGS.storeTagline,
      storeLogoEmoji: row.store_logo_emoji || DEFAULT_SETTINGS.storeLogoEmoji,
      storeLogoImage: row.store_logo_image || '',
      themeColor: row.theme_color || DEFAULT_SETTINGS.themeColor,
      announcementBar: parseJsonField(row.announcement_bar, DEFAULT_SETTINGS.announcementBar),
      featuredCollection: parseJsonField(row.featured_collection, DEFAULT_SETTINGS.featuredCollection),
      hero: parseJsonField(row.hero, DEFAULT_SETTINGS.hero),
      about: parseJsonField(row.about, DEFAULT_SETTINGS.about),
      delivery: parseJsonField(row.delivery, DEFAULT_SETTINGS.delivery),
      instagramFeed: (function () {
        const parsed = parseJsonField(row.instagram_feed, DEFAULT_SETTINGS.instagramFeed);
        if (!parsed || !Array.isArray(parsed.posts)) {
          return { ...DEFAULT_SETTINGS.instagramFeed, ...(parsed || {}), posts: DEFAULT_SETTINGS.instagramFeed.posts };
        }
        return parsed;
      })(),
      whatsappNumber: row.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
      contactPhone: row.contact_phone || DEFAULT_SETTINGS.contactPhone,
      instagram: row.instagram || '',
      address: row.address || DEFAULT_SETTINGS.address,
      footerCopyright: row.footer_copyright || DEFAULT_SETTINGS.footerCopyright,
      paymentMethods: parseJsonField(row.payment_methods, DEFAULT_SETTINGS.paymentMethods),
      pixDetails: parseJsonField(row.pix_details, DEFAULT_SETTINGS.pixDetails),
      storeOpen: row.store_open !== false,
      closedCustomMessage: row.closed_custom_message || DEFAULT_SETTINGS.closedCustomMessage,
      operatingHours: parseJsonField(row.operating_hours, DEFAULT_SETTINGS.operatingHours),
      closures: parseJsonField(row.closures, []),
      availableSizes: parseJsonField(row.available_sizes, DEFAULT_SETTINGS.availableSizes),
      adminPassword: DEFAULT_SETTINGS.adminPassword
    };
  }

  function _mapOrder(row) {
    return {
      id: row.id,
      customer: row.customer || {},
      deliveryType: row.delivery_type || 'delivery',
      deliveryFee: parseFloat(row.delivery_fee) || 0,
      items: row.items || [],
      subtotal: parseFloat(row.subtotal) || 0,
      total: parseFloat(row.total) || 0,
      paymentMethod: row.payment_method || '',
      status: row.status || 'novo',
      createdAt: row.created_at
    };
  }

  // ===== INIT =====
  async function init({ enableRealtime = false, isAdmin = false } = {}) {
    if (_initialized && !isAdmin) return;
    _isAdmin = isAdmin;

    // Init Supabase
    if (window.SupabaseService) {
      _supabase = await window.SupabaseService.init();
    }

    // Load all data in parallel
    await Promise.all([
      _loadCategories(),
      _loadProducts(),
      _loadSettings()
    ]);

    if (isAdmin) {
      await _loadOrders();
    }

    if (enableRealtime && _supabase) {
      _setupRealtime();
    }

    _initialized = true;
    console.log('[DataStore] Initialized. Products:', _products.length, '| Settings:', _settings.storeName);
  }

  // ===== LOAD FUNCTIONS =====
  async function _loadCategories() {
    // 1. Initial fast local load
    const local = _loadLocal(DB_KEYS.CATEGORIES);
    if (local && local.length) {
      _categories = local;
    } else {
      _categories = [...DEFAULT_CATEGORIES];
    }

    // 2. Fresh sync from Supabase
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('categories').select('*').order('name');
        if (!error && data && data.length) {
          _categories = data;
          _saveLocal(DB_KEYS.CATEGORIES, _categories);
          return;
        }
      } catch (e) { console.warn('[DataStore] categories fetch error:', e); }
    }
  }

  async function _loadProducts() {
    // 1. Initial fast local load
    const local = _loadLocal(DB_KEYS.PRODUCTS);
    if (local && local.length) {
      _products = local;
    } else {
      _products = [...DEFAULT_PRODUCTS];
    }
    _products.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // 2. Fresh sync from Supabase
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('products').select('*');
        if (!error && data) {
          _products = data.map(_mapProduct).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          _saveLocal(DB_KEYS.PRODUCTS, _products);
          return;
        }
      } catch (e) { console.warn('[DataStore] products fetch error:', e); }
    }
  }

  async function _loadSettings() {
    // 1. Initial fast local load
    const local = _loadLocal(DB_KEYS.SETTINGS);
    if (local && local.storeName) {
      _settings = local;
    } else {
      _settings = { ...DEFAULT_SETTINGS };
    }

    // 2. Fresh sync from Supabase
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('settings').select('*').eq('id', 'main').single();
        if (!error && data) {
          _settings = _mapSettings(data);
          _saveLocal(DB_KEYS.SETTINGS, _settings);
          return;
        }
      } catch (e) { console.warn('[DataStore] settings fetch error:', e); }
    }
  }

  async function _loadOrders() {
    if (_supabase) {
      try {
        const { data, error } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) { _orders = data.map(_mapOrder); return; }
      } catch (e) { console.warn('[DataStore] orders fetch error:', e); }
    }
    _orders = _loadLocal(DB_KEYS.ORDERS) || [];
  }

  // ===== REALTIME =====
  function _setupRealtime() {
    if (!_supabase) return;
    if (_realtimeChannel) { _supabase.removeChannel(_realtimeChannel); }
    _realtimeChannel = _supabase
      .channel('fashion-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        await _loadProducts();
        document.dispatchEvent(new CustomEvent('products-updated'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        await _loadCategories();
        document.dispatchEvent(new CustomEvent('categories-updated'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
        await _loadSettings();
        document.dispatchEvent(new CustomEvent('settings-updated'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        await _loadOrders();
        document.dispatchEvent(new CustomEvent('orders-updated'));
      })
      .subscribe();
  }

  // ===== GETTERS =====
  function getProducts({ includeInactive = false } = {}) {
    if (includeInactive) return [..._products];
    return _products.filter(p => p.active);
  }

  function getProductById(id) {
    return _products.find(p => p.id === id) || null;
  }

  function getCategories() {
    return [..._categories];
  }

  function getSettings() {
    return { ..._settings };
  }

  function getOrders() {
    return [..._orders];
  }

  // ===== STOCK HELPERS =====
  /**
   * Retorna o total de unidades em estoque de um produto (todas as cores + tamanhos)
   */
  function getProductTotalStock(productId) {
    const p = getProductById(productId);
    if (!p || !p.variants || !p.variants.length) return 0;
    return p.variants.reduce((total, variant) => {
      return total + (variant.sizes || []).reduce((s, sz) => s + (sz.qty || 0), 0);
    }, 0);
  }

  /**
   * Retorna o estoque de uma variante específica (cor + tamanho)
   */
  function getVariantStock(productId, color, size) {
    const p = getProductById(productId);
    if (!p || !p.variants) return 0;
    const variant = p.variants.find(v => v.color === color);
    if (!variant) return 0;
    const sizeEntry = (variant.sizes || []).find(s => s.size === size);
    return sizeEntry ? (sizeEntry.qty || 0) : 0;
  }

  /**
   * Retorna todos os tamanhos disponíveis para uma cor específica (qty > 0)
   */
  function getAvailableSizesForColor(productId, color) {
    const p = getProductById(productId);
    if (!p || !p.variants) return [];
    const variant = p.variants.find(v => v.color === color);
    if (!variant) return [];
    return (variant.sizes || []).filter(s => s.qty > 0).map(s => s.size);
  }

  /**
   * Todas as cores disponíveis (com pelo menos 1 item em estoque)
   */
  function getAvailableColors(productId) {
    const p = getProductById(productId);
    if (!p || !p.variants) return [];
    return p.variants.filter(v =>
      (v.sizes || []).some(s => s.qty > 0)
    );
  }

  // ===== PRODUCT MUTATIONS =====
  async function saveProduct(product) {
    const isNew = !product.id;
    if (isNew) {
      product.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    product.updatedAt = new Date().toISOString();
    if (!product.createdAt) product.createdAt = product.updatedAt;

    if (_supabase) {
      const row = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || '',
        category: product.category,
        badge: product.badge || '',
        active: product.active !== false,
        in_stock: product.inStock !== false,
        variants: product.variants || [],
        promotion: product.promotion || { active: false, discountPercent: 0 },
        updated_at: product.updatedAt
      };
      if (isNew) row.created_at = product.createdAt;

      // Try saving with extra fields first, fallback if column doesn't exist
      try {
        const rowWithExtra = { ...row, featured: product.featured === true, display_order: product.displayOrder || 0 };
        const { error: fErr } = isNew
          ? await _supabase.from('products').insert([rowWithExtra])
          : await _supabase.from('products').update(rowWithExtra).eq('id', product.id);
        if (fErr) {
          const { error } = isNew
            ? await _supabase.from('products').insert([row])
            : await _supabase.from('products').update(row).eq('id', product.id);
          if (error) throw error;
        }
      } catch (err) {
        const { error } = isNew
          ? await _supabase.from('products').insert([row])
          : await _supabase.from('products').update(row).eq('id', product.id);
        if (error) throw error;
      }
    }

    const idx = _products.findIndex(p => p.id === product.id);
    if (idx >= 0) _products[idx] = { ..._products[idx], ...product };
    else _products.unshift(product);

    _saveLocal(DB_KEYS.PRODUCTS, _products);
    return product;
  }

  function getFeaturedProducts() {
    const s = getSettings();
    const f = s.featuredCollection || {};
    if (f.active === false) return [];

    let featured = _products.filter(p => p.active && (p.featured || (p.badge && p.badge.toLowerCase().includes('destaque'))));
    if (!featured.length) {
      featured = _products.filter(p => p.active).slice(0, 4);
    }
    return featured;
  }

  async function toggleProductFeatured(id) {
    const p = getProductById(id);
    if (!p) return false;
    p.featured = !p.featured;
    await saveProduct(p);
    return p.featured;
  }

  async function deleteProduct(id) {
    if (_supabase) {
      const { error } = await _supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    }
    _products = _products.filter(p => p.id !== id);
    _saveLocal(DB_KEYS.PRODUCTS, _products);
  }

  /**
   * Decrement stock for a given product/color/size after order
   */
  async function decrementStock(productId, color, size, qty = 1) {
    const product = getProductById(productId);
    if (!product || !product.variants) return;

    const variants = JSON.parse(JSON.stringify(product.variants));
    const variant = variants.find(v => v.color === color);
    if (!variant) return;
    const sizeEntry = (variant.sizes || []).find(s => s.size === size);
    if (!sizeEntry) return;
    sizeEntry.qty = Math.max(0, (sizeEntry.qty || 0) - qty);

    product.variants = variants;
    // Check if any size has stock
    const totalStock = variants.reduce((t, v) => t + (v.sizes || []).reduce((s, sz) => s + sz.qty, 0), 0);
    product.inStock = totalStock > 0;

    await saveProduct(product);
  }

  // ===== CATEGORY MUTATIONS =====
  async function saveCategory(cat) {
    const isNew = !cat.id;
    if (isNew) cat.id = 'cat_' + Date.now();

    if (_supabase) {
      const { error } = isNew
        ? await _supabase.from('categories').insert([{ id: cat.id, name: cat.name, icon: cat.icon }])
        : await _supabase.from('categories').update({ name: cat.name, icon: cat.icon }).eq('id', cat.id);
      if (error) {
        console.error('[DataStore] Erro ao salvar categoria no Supabase:', error);
        throw error;
      }
    }

    const idx = _categories.findIndex(c => c.id === cat.id);
    if (idx >= 0) _categories[idx] = cat;
    else _categories.push(cat);
    _saveLocal(DB_KEYS.CATEGORIES, _categories);
    document.dispatchEvent(new CustomEvent('categories-updated'));
    return cat;
  }

  async function deleteCategory(id) {
    if (_supabase) {
      const { error } = await _supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('[DataStore] Erro ao deletar categoria no Supabase:', error);
        throw error;
      }
    }
    _categories = _categories.filter(c => c.id !== id);
    _saveLocal(DB_KEYS.CATEGORIES, _categories);
    document.dispatchEvent(new CustomEvent('categories-updated'));
  }

  // ===== SETTINGS MUTATIONS =====
  async function updateSettings(newSettings) {
    _settings = { ..._settings, ...newSettings };

    if (_supabase) {
      const row = {
        id: 'main',
        store_name: _settings.storeName,
        store_tagline: _settings.storeTagline,
        store_logo_emoji: _settings.storeLogoEmoji,
        store_logo_image: _settings.storeLogoImage || '',
        theme_color: _settings.themeColor,
        announcement_bar: _settings.announcementBar,
        hero: _settings.hero,
        about: _settings.about,
        delivery: _settings.delivery,
        whatsapp_number: _settings.whatsappNumber,
        contact_phone: _settings.contactPhone,
        instagram: _settings.instagram || '',
        address: _settings.address,
        footer_copyright: _settings.footerCopyright,
        payment_methods: _settings.paymentMethods,
        pix_details: _settings.pixDetails,
        store_open: _settings.storeOpen !== false,
        closed_custom_message: _settings.closedCustomMessage,
        operating_hours: _settings.operatingHours,
        closures: _settings.closures || [],
        available_sizes: _settings.availableSizes || ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
        updated_at: new Date().toISOString()
      };

      try {
        const rowWithExtras = {
          ...row,
          featured_collection: _settings.featuredCollection,
          instagram_feed: _settings.instagramFeed
        };
        const { error: fErr } = await _supabase.from('settings').upsert([rowWithExtras]);
        if (fErr) {
          const { error } = await _supabase.from('settings').upsert([row]);
          if (error) throw error;
        }
      } catch (err) {
        const { error } = await _supabase.from('settings').upsert([row]);
        if (error) throw error;
      }
    }

    _saveLocal(DB_KEYS.SETTINGS, _settings);
    document.dispatchEvent(new CustomEvent('settings-updated'));
  }

  async function updateSetting(key, value) {
    await updateSettings({ [key]: value });
  }

  // ===== ORDERS =====
  async function saveOrder(order) {
    if (!order.id) order.id = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    if (!order.createdAt) order.createdAt = new Date().toISOString();
    order.status = order.status || 'novo';

    if (_supabase) {
      const row = {
        id: order.id,
        customer: order.customer,
        delivery_type: order.deliveryType || 'delivery',
        delivery_fee: order.deliveryFee || 0,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        payment_method: order.paymentMethod,
        status: order.status,
        created_at: order.createdAt
      };
      const { error } = await _supabase.from('orders').insert([row]);
      if (error) throw error;
    }

    _orders.unshift(order);
    _saveLocal(DB_KEYS.ORDERS, _orders);
    return order;
  }

  async function updateOrderStatus(id, status) {
    if (_supabase) {
      const { error } = await _supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    }
    const order = _orders.find(o => o.id === id);
    if (order) order.status = status;
    _saveLocal(DB_KEYS.ORDERS, _orders);
  }

  async function deleteOrder(id) {
    if (_supabase) {
      const { error } = await _supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    }
    _orders = _orders.filter(o => o.id !== id);
    _saveLocal(DB_KEYS.ORDERS, _orders);
  }

  // ===== STORE STATUS (open/closed) =====
  function isStoreOpen() {
    const s = _settings;
    // Se o switch da loja estiver desligado (fechada manualmente), a loja está fechada
    if (s.storeOpen === false) return false;

    // Se o controle de horário não estiver explicitamente ativo, o switch manual storeOpen mantém a loja aberta!
    if (!s.autoScheduleEnabled) return true;

    const now = new Date();
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayKey = dayNames[now.getDay()];
    const hours = s.operatingHours ? s.operatingHours[dayKey] : null;
    if (!hours || !hours.active) return false;

    // Check for manual closures
    const closures = s.closures || [];
    const todayStr = now.toISOString().slice(0, 10);
    if (closures.some(c => c.date === todayStr)) return false;

    const [openH, openM] = (hours.open || '00:00').split(':').map(Number);
    const [closeH, closeM] = (hours.close || '00:00').split(':').map(Number);
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return nowMin >= openMin && nowMin < closeMin;
  }

  // ===== FORCE REFRESH (Admin) =====
  async function forceRefresh() {
    try { localStorage.removeItem(DB_KEYS.CACHE_META); } catch {}
    await Promise.all([_loadCategories(), _loadProducts(), _loadSettings(), _loadOrders()]);
  }

  // ===== EXPORT =====
  return {
    init,
    getProducts,
    getProductById,
    getCategories,
    getSettings,
    getOrders,
    getProductTotalStock,
    getVariantStock,
    getAvailableSizesForColor,
    getAvailableColors,
    saveProduct,
    deleteProduct,
    decrementStock,
    saveCategory,
    deleteCategory,
    getFeaturedProducts,
    toggleProductFeatured,
    updateSettings,
    updateSetting,
    saveOrder,
    updateOrderStatus,
    deleteOrder,
    isStoreOpen,
    forceRefresh
  };
})();

// ===== UTILS (shared) =====
const Utils = {
  formatCurrency(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  },

  formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  },

  sanitize(str) {
    if (!str) return '';
    return String(str).replace(/[<>\"']/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${Utils.sanitize(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
  },

  async hashPassword(password) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  },

  /**
   * Calcula o preço com desconto
   */
  calcDiscountedPrice(price, promotion) {
    if (!promotion || !promotion.active || !promotion.discountPercent) return price;
    return price * (1 - promotion.discountPercent / 100);
  }
};
