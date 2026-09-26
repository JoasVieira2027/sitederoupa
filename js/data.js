/**
 * data.js - Data Management Layer with Supabase as Primary Database
 * Handles cloud persistence for products, orders, settings, and categories.
 * All changes are saved to Supabase PostgreSQL and synced across all devices.
 */

const DB_KEYS = {
  PRODUCTS: 'dolcearte_products',
  ORDERS: 'dolcearte_orders',
  SETTINGS: 'dolcearte_settings',
  CATEGORIES: 'dolcearte_categories'
};

// ===== DEFAULT DATA (Used for initial database seeding or offline fallback) =====
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_001',
    name: 'Bolo de Chocolate Trufado',
    description: 'Irresistível bolo de chocolate com recheio de trufa e cobertura de ganache belga. Decorado com morangos frescos e raspas de chocolate.',
    price: 89.90,
    image: 'assets/images/cake_chocolate.jpg',
    category: 'Chocolate',
    badge: 'Mais Vendido',
    active: true,
    inStock: true,
    promotion: { active: true, discountPercent: 15 }
  },
  {
    id: 'prod_002',
    name: 'Red Velvet Premium',
    description: 'Elegante bolo red velvet com cream cheese artesanal e cachos de chocolate branco. Perfeito para ocasiões especiais.',
    price: 95.00,
    image: 'assets/images/cake_red_velvet.jpg',
    category: 'Especial',
    badge: 'Destaque',
    active: true,
    inStock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_003',
    name: 'Bolo de Cenoura Gourmet',
    description: 'Tradicional bolo de cenoura com cobertura cremosa e nozes caramelizadas. Receita da vovó com toque gourmet.',
    price: 65.00,
    image: 'assets/images/cake_carrot.jpg',
    category: 'Tradicional',
    badge: 'Receita de Família',
    active: true,
    inStock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_004',
    name: 'Bolo de Limão Siciliano',
    description: 'Delicado bolo de limão siciliano com cobertura de merengue e flores comestíveis. Leveza e sofisticação em cada fatia.',
    price: 78.00,
    image: 'assets/images/cake_lemon.jpg',
    category: 'Especial',
    badge: 'Refrescante',
    active: true,
    inStock: true,
    promotion: { active: true, discountPercent: 10 }
  },
  {
    id: 'prod_005',
    name: 'Bolo de Brigadeiro',
    description: 'Nosso clássico artesanal! Bolo de chocolate com recheio e cobertura de brigadeiro gourmet, decorado com brigadeiros enrolados à mão.',
    price: 85.00,
    image: 'assets/images/cake_brigadeiro.jpg',
    category: 'Chocolate',
    badge: 'Favorito',
    active: true,
    inStock: true,
    promotion: { active: false, discountPercent: 0 }
  },
  {
    id: 'prod_006',
    name: 'Bolo de Coco Tropical',
    description: 'Bolo fofinho de coco com cobertura de coco ralado fresco e flores tropicais. Sabor que remete ao paraíso.',
    price: 72.00,
    image: 'assets/images/cake_coconut.jpg',
    category: 'Tradicional',
    badge: 'Molhadinho',
    active: true,
    inStock: true,
    promotion: { active: false, discountPercent: 0 }
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat_choco', name: 'Chocolate', icon: '🍫' },
  { id: 'cat_especial', name: 'Especial', icon: '⭐' },
  { id: 'cat_tradicional', name: 'Tradicional', icon: '🏠' },
  { id: 'cat_frutas', name: 'Frutas', icon: '🍓' },
  { id: 'cat_festas', name: 'Festas', icon: '🎉' }
];

const DEFAULT_SETTINGS = {
  storeName: 'Dolce Arte',
  storeTagline: 'Bolos Artesanais Feitos com Amor',
  storeLogoEmoji: '🎂',
  storeLogoImage: '',
  themeColor: '#8B5E3C',

  announcementBar: {
    active: true,
    text: '🎉 Encomendas abertas! Ingredientes 100% nobres e artesanais. Faça seu pedido!'
  },

  hero: {
    emoji: '🎂',
    title: 'Bolos Artesanais Feitos com Amor',
    subtitle: 'Cada bolo é uma obra de arte, preparado com ingredientes selecionados e muito carinho. Descubra sabores que vão encantar seu paladar.',
    ctaText: '✨ Ver Cardápio'
  },

  about: {
    active: true,
    title: 'Nossa Paixão por Confeitaria Artesanal',
    subtitle: 'Doces memórias e sabores inesquecíveis',
    text: 'Na Dolce Arte, acreditamos que todo momento especial merece ser celebrado com um bolo único. Cada receita nasce do amor pela confeitaria tradicional, combinada com técnicas modernas e ingredientes nobres como chocolates belgas, baunilhas puras e frutas frescas selecionadas diariamente.',
    features: [
      { icon: '🌿', title: '100% Artesanal', desc: 'Produção fresca e sem conservantes artificiais' },
      { icon: '🍫', title: 'Ingredientes Nobres', desc: 'Chocolates belgas e matéria-prima selecionada' },
      { icon: '👩‍🍳', title: 'Receitas Autorais', desc: 'Sabor caseiro com apresentação refinada' },
      { icon: '🛵', title: 'Entrega Cuidadosa', desc: 'Seu bolo chega impecável e protegido' }
    ]
  },

  categories: DEFAULT_CATEGORIES,

  delivery: {
    deliveryEnabled: true,
    deliveryFee: 10.00,
    freeDeliveryThreshold: 120.00,
    estimatedTime: '40 a 60 min',
    pickupEnabled: true,
    pickupAddress: 'Rua das Flores, 123 - Centro (Confeitaria Dolce Arte)',
    pickupEstimate: 'Pronto em 30 min'
  },

  whatsappNumber: '5511999999999',
  contactPhone: '(11) 99999-9999',
  instagram: '@dolcearte.bolos',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  footerCopyright: '© 2026 Dolce Arte. Todos os direitos reservados.',

  paymentMethods: [
    { id: 'pix', name: 'Pix', icon: '📱', active: true },
    { id: 'dinheiro', name: 'Dinheiro', icon: '💵', active: true },
    { id: 'credito', name: 'Cartão Crédito', icon: '💳', active: true },
    { id: 'debito', name: 'Cartão Débito', icon: '💳', active: true },
    { id: 'transferencia', name: 'Transferência', icon: '🏦', active: false }
  ],

  pixDetails: {
    keyType: 'Celular',
    key: '(11) 99999-9999',
    receiverName: 'Dolce Arte Confeitaria Ltda',
    instructions: 'Transfira o valor do pedido e anexe o comprovante na conversa do WhatsApp para agilizarmos a produção.'
  },

  storeOpen: true,
  closedCustomMessage: 'Estamos fechados no momento. Nossos confeiteiros estão preparando novas delícias para você!',
  operatingHours: {
    segunda: { open: '08:00', close: '18:00', active: true },
    terca: { open: '08:00', close: '18:00', active: true },
    quarta: { open: '08:00', close: '18:00', active: true },
    quinta: { open: '08:00', close: '18:00', active: true },
    sexta: { open: '08:00', close: '18:00', active: true },
    sabado: { open: '09:00', close: '14:00', active: true },
    domingo: { open: '00:00', close: '00:00', active: false },
  },
  closures: [],

  adminPassword: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
};

// Deep merge helper
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// ===== DATA ACCESS LAYER (SUPABASE PRIMARY) =====
const DataStore = {
  // In-memory active cache
  _products: [],
  _categories: [],
  _settings: null,
  _orders: [],
  _initialized: false,
  _listeners: [],
  _realtimeChannel: null,

  // --- Initialize & Load from Supabase ---
  async init() {
    // If Supabase service is available, initialize it first
    if (window.SupabaseService) {
      await window.SupabaseService.init();
    }

    const sb = this.getSb();

    if (sb) {
      try {
        console.log('[DataStore] Carregando dados do Supabase...');

        // 1. Fetch Categories
        const { data: catData, error: catErr } = await sb
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!catErr && catData && catData.length > 0) {
          this._categories = catData.map(c => ({ id: c.id, name: c.name, icon: c.icon }));
        } else if (!catErr && (!catData || catData.length === 0)) {
          // Empty table, auto-seed default categories
          console.log('[DataStore] Semeando categorias iniciais no Supabase...');
          await this.seedCategories(sb);
        }

        // 2. Fetch Products
        const { data: prodData, error: prodErr } = await sb
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (!prodErr && prodData && prodData.length > 0) {
          this._products = prodData.map(p => this.productFromDb(p));
        } else if (!prodErr && (!prodData || prodData.length === 0)) {
          // Empty table, auto-seed default products
          console.log('[DataStore] Semeando produtos iniciais no Supabase...');
          await this.seedProducts(sb);
        }

        // 3. Fetch Settings
        const { data: setData, error: setErr } = await sb
          .from('settings')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();

        if (!setErr && setData) {
          this._settings = this.settingsFromDb(setData);
        } else if (!setErr && !setData) {
          console.log('[DataStore] Semeando configurações iniciais no Supabase...');
          await this.seedSettings(sb);
        }

        // 4. Fetch Orders (if authenticated admin)
        const isAuth = window.SupabaseService ? await window.SupabaseService.isAuthenticated() : false;
        if (isAuth) {
          const { data: orderData, error: orderErr } = await sb
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!orderErr && orderData) {
            this._orders = orderData.map(o => this.orderFromDb(o));
          }
        }

        // Setup Realtime Subscription for instant sync
        this.setupRealtimeSubscription(sb);

        this._initialized = true;
        this.applyTheme(this.getSettings().themeColor);
        console.log('[DataStore] Dados sincronizados com Supabase com sucesso!');
        return;
      } catch (err) {
        console.warn('[DataStore] Erro ao consultar Supabase, utilizando fallback local:', err);
      }
    }

    // --- FALLBACK (Offline or Supabase not yet configured) ---
    console.warn('[DataStore] Supabase não conectado. Carregando dados locais de demonstração.');
    this._products = JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || JSON.stringify(DEFAULT_PRODUCTS));
    this._categories = JSON.parse(localStorage.getItem(DB_KEYS.CATEGORIES) || JSON.stringify(DEFAULT_CATEGORIES));
    this._settings = JSON.parse(localStorage.getItem(DB_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
    this._orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    this._initialized = true;
    this.applyTheme(this.getSettings().themeColor);
  },

  getSb() {
    return window.SupabaseService ? window.SupabaseService.getClient() : null;
  },

  // Setup Realtime Sync
  setupRealtimeSubscription(sb) {
    if (!sb || this._realtimeChannel) return;

    try {
      this._realtimeChannel = sb.channel('dolcearte_realtime_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
          console.log('[Realtime] Produtos atualizados no Supabase. Atualizando tela...');
          await this.refreshProducts();
          this.notifyListeners('products');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
          console.log('[Realtime] Categorias atualizadas no Supabase. Atualizando tela...');
          await this.refreshCategories();
          this.notifyListeners('categories');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
          console.log('[Realtime] Configurações da loja atualizadas no Supabase. Atualizando tela...');
          await this.refreshSettings();
          this.notifyListeners('settings');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
          console.log('[Realtime] Pedidos atualizados no Supabase. Atualizando tela...');
          await this.refreshOrders();
          this.notifyListeners('orders');
        })
        .subscribe();
    } catch (e) {
      console.warn('[Realtime] Erro ao conectar realtime:', e);
    }
  },

  subscribeToChanges(callback) {
    if (typeof callback === 'function') {
      this._listeners.push(callback);
    }
  },

  notifyListeners(type) {
    this._listeners.forEach(cb => {
      try { cb(type); } catch (e) {}
    });
  },

  // Database Mapping Helpers
  productFromDb(p) {
    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: parseFloat(p.price) || 0,
      image: p.image || 'assets/images/cake_chocolate.jpg',
      category: p.category,
      badge: p.badge || '',
      active: p.active !== false,
      inStock: p.in_stock !== false,
      promotion: p.promotion || { active: false, discountPercent: 0 }
    };
  },

  productToDb(p) {
    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      image: p.image || '',
      category: p.category,
      badge: p.badge || '',
      active: p.active !== false,
      in_stock: p.inStock !== false,
      promotion: p.promotion || { active: false, discountPercent: 0 },
      updated_at: new Date().toISOString()
    };
  },

  settingsFromDb(s) {
    const merged = deepMerge(DEFAULT_SETTINGS, {
      storeName: s.store_name,
      storeTagline: s.store_tagline,
      storeLogoEmoji: s.store_logo_emoji,
      storeLogoImage: s.store_logo_image,
      themeColor: s.theme_color,
      announcementBar: s.announcement_bar,
      hero: s.hero,
      about: s.about,
      delivery: s.delivery,
      whatsappNumber: s.whatsapp_number,
      contactPhone: s.contact_phone,
      instagram: s.instagram,
      address: s.address,
      footerCopyright: s.footer_copyright,
      paymentMethods: s.payment_methods,
      pixDetails: s.pix_details,
      storeOpen: s.store_open !== false,
      closedCustomMessage: s.closed_custom_message,
      operatingHours: s.operating_hours,
      closures: s.closures
    });
    return merged;
  },

  settingsToDb(settings) {
    return {
      id: 'main',
      store_name: settings.storeName,
      store_tagline: settings.storeTagline,
      store_logo_emoji: settings.storeLogoEmoji,
      store_logo_image: settings.storeLogoImage || '',
      theme_color: settings.themeColor || '#8B5E3C',
      announcement_bar: settings.announcementBar,
      hero: settings.hero,
      about: settings.about,
      delivery: settings.delivery,
      whatsapp_number: settings.whatsappNumber,
      contact_phone: settings.contactPhone,
      instagram: settings.instagram,
      address: settings.address,
      footer_copyright: settings.footerCopyright,
      payment_methods: settings.paymentMethods,
      pix_details: settings.pixDetails,
      store_open: settings.storeOpen !== false,
      closed_custom_message: settings.closedCustomMessage,
      operating_hours: settings.operatingHours,
      closures: settings.closures,
      updated_at: new Date().toISOString()
    };
  },

  orderFromDb(o) {
    return {
      id: o.id,
      customer: o.customer || {},
      deliveryType: o.delivery_type || 'delivery',
      deliveryFee: parseFloat(o.delivery_fee) || 0,
      items: o.items || [],
      subtotal: parseFloat(o.subtotal) || 0,
      total: parseFloat(o.total) || 0,
      paymentMethod: o.payment_method || '',
      status: o.status || 'novo',
      date: o.created_at || new Date().toISOString()
    };
  },

  orderToDb(o) {
    return {
      id: o.id,
      customer: o.customer,
      delivery_type: o.deliveryType || 'delivery',
      delivery_fee: o.deliveryFee || 0,
      items: o.items,
      subtotal: o.subtotal,
      total: o.total,
      payment_method: o.paymentMethod,
      status: o.status || 'novo'
    };
  },

  // --- Seeding Helpers ---
  async seedCategories(sb) {
    try {
      const records = DEFAULT_CATEGORIES.map(c => ({ id: c.id, name: c.name, icon: c.icon }));
      await sb.from('categories').upsert(records);
      this._categories = [...DEFAULT_CATEGORIES];
    } catch (e) {
      console.warn('Erro ao semear categorias:', e);
    }
  },

  async seedProducts(sb) {
    try {
      const records = DEFAULT_PRODUCTS.map(p => this.productToDb(p));
      await sb.from('products').upsert(records);
      this._products = [...DEFAULT_PRODUCTS];
    } catch (e) {
      console.warn('Erro ao semear produtos:', e);
    }
  },

  async seedSettings(sb) {
    try {
      const record = this.settingsToDb(DEFAULT_SETTINGS);
      await sb.from('settings').upsert(record);
      this._settings = { ...DEFAULT_SETTINGS };
    } catch (e) {
      console.warn('Erro ao semear configurações:', e);
    }
  },

  // Refresh methods
  async refreshProducts() {
    const sb = this.getSb();
    if (!sb) return;
    const { data } = await sb.from('products').select('*').order('created_at', { ascending: true });
    if (data) this._products = data.map(p => this.productFromDb(p));
  },

  async refreshCategories() {
    const sb = this.getSb();
    if (!sb) return;
    const { data } = await sb.from('categories').select('*').order('name', { ascending: true });
    if (data) this._categories = data.map(c => ({ id: c.id, name: c.name, icon: c.icon }));
  },

  async refreshSettings() {
    const sb = this.getSb();
    if (!sb) return;
    const { data } = await sb.from('settings').select('*').eq('id', 'main').maybeSingle();
    if (data) {
      this._settings = this.settingsFromDb(data);
      this.applyTheme(this._settings.themeColor);
    }
  },

  async refreshOrders() {
    const sb = this.getSb();
    if (!sb) return;
    const isAuth = window.SupabaseService ? await window.SupabaseService.isAuthenticated() : false;
    if (isAuth) {
      const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false });
      if (data) this._orders = data.map(o => this.orderFromDb(o));
    }
  },

  // --- Products API ---
  getProducts() {
    return this._products && this._products.length > 0 ? this._products : DEFAULT_PRODUCTS;
  },

  getActiveProducts() {
    return this.getProducts().filter(p => p.active && p.inStock);
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  async saveProduct(product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);

    if (index >= 0) {
      product = { ...products[index], ...product };
      products[index] = product;
    } else {
      product.id = product.id || 'prod_' + Date.now();
      products.push(product);
    }
    this._products = [...products];

    // Persist to Supabase
    const sb = this.getSb();
    if (sb) {
      const dbRecord = this.productToDb(product);
      const { error } = await sb.from('products').upsert(dbRecord);
      if (error) {
        console.error('[Supabase] Erro ao salvar produto:', error);
        throw error;
      }
    }

    // Backup to local storage
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(this._products));
    return product;
  },

  async deleteProduct(id) {
    this._products = this.getProducts().filter(p => p.id !== id);

    // Persist to Supabase
    const sb = this.getSb();
    if (sb) {
      const { error } = await sb.from('products').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Erro ao excluir produto:', error);
        throw error;
      }
    }

    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(this._products));
  },

  async toggleProductActive(id) {
    const product = this.getProductById(id);
    if (product) {
      product.active = !product.active;
      return this.saveProduct(product);
    }
    return null;
  },

  async toggleProductStock(id) {
    const product = this.getProductById(id);
    if (product) {
      product.inStock = !product.inStock;
      return this.saveProduct(product);
    }
    return null;
  },

  // --- Categories API ---
  getCategories() {
    if (this._categories && this._categories.length > 0) {
      return this._categories;
    }
    return DEFAULT_CATEGORIES;
  },

  async saveCategory(category) {
    const categories = [...this.getCategories()];
    const index = categories.findIndex(c => c.id === category.id || c.name === category.name);

    if (index >= 0) {
      categories[index] = { ...categories[index], ...category };
      category = categories[index];
    } else {
      category.id = category.id || 'cat_' + Date.now().toString(36);
      categories.push(category);
    }
    this._categories = categories;

    // Persist to Supabase
    const sb = this.getSb();
    if (sb) {
      const { error } = await sb.from('categories').upsert({
        id: category.id,
        name: category.name,
        icon: category.icon || '🎂'
      });
      if (error) {
        console.error('[Supabase] Erro ao salvar categoria:', error);
        throw error;
      }
    }

    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(this._categories));
    return category;
  },

  async deleteCategory(id) {
    this._categories = this.getCategories().filter(c => (c.id || c.name) !== id);

    // Persist to Supabase
    const sb = this.getSb();
    if (sb) {
      const { error } = await sb.from('categories').delete().or(`id.eq.${id},name.eq.${id}`);
      if (error) {
        console.error('[Supabase] Erro ao excluir categoria:', error);
        throw error;
      }
    }

    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(this._categories));
  },

  // --- Settings API ---
  getSettings() {
    if (this._settings) return this._settings;
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings) {
    this._settings = deepMerge(DEFAULT_SETTINGS, settings);
    this.applyTheme(this._settings.themeColor);

    // Persist to Supabase
    const sb = this.getSb();
    if (sb) {
      const dbRecord = this.settingsToDb(this._settings);
      const { error } = await sb.from('settings').upsert(dbRecord);
      if (error) {
        console.error('[Supabase] Erro ao salvar configurações:', error);
        throw error;
      }
    }

    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(this._settings));
    return this._settings;
  },

  async updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  },

  applyTheme(color) {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    try {
      const col = color.replace('#', '');
      const num = parseInt(col, 16);
      const r = Math.max(0, Math.min(255, (num >> 16) - 30));
      const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - 20));
      const b = Math.max(0, Math.min(255, (num & 0x0000FF) - 15));
      document.documentElement.style.setProperty('--primary-dark', `rgb(${r}, ${g}, ${b})`);
      document.documentElement.style.setProperty('--primary-50', `rgba(${r}, ${g}, ${b}, 0.06)`);
      document.documentElement.style.setProperty('--primary-100', `rgba(${r}, ${g}, ${b}, 0.12)`);
    } catch(e) {}
  },

  // --- Orders API ---
  getOrders() {
    return this._orders || [];
  },

  async saveOrder(order) {
    order.id = order.id || 'PED-' + Date.now().toString(36).toUpperCase();
    order.date = order.date || new Date().toISOString();
    order.status = order.status || 'novo';

    this._orders.unshift(order);

    // Persist to Supabase
    const sb = this.getSb();
    if (sb) {
      const dbRecord = this.orderToDb(order);
      const { error } = await sb.from('orders').insert(dbRecord);
      if (error) {
        console.error('[Supabase] Erro ao salvar pedido:', error);
        // We still return order so WhatsApp message is generated
      }
    }

    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(this._orders));
    return order;
  },

  async updateOrderStatus(id, status) {
    const order = this._orders.find(o => o.id === id);
    if (order) {
      order.status = status;

      const sb = this.getSb();
      if (sb) {
        const { error } = await sb.from('orders').update({ status }).eq('id', id);
        if (error) {
          console.error('[Supabase] Erro ao atualizar status do pedido:', error);
          throw error;
        }
      }

      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(this._orders));
    }
    return order;
  },

  async deleteOrder(id) {
    this._orders = this._orders.filter(o => o.id !== id);

    const sb = this.getSb();
    if (sb) {
      const { error } = await sb.from('orders').delete().eq('id', id);
      if (error) {
        console.error('[Supabase] Erro ao excluir pedido:', error);
        throw error;
      }
    }

    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(this._orders));
  },

  async clearAllOrders() {
    this._orders = [];

    const sb = this.getSb();
    if (sb) {
      const { error } = await sb.from('orders').delete().neq('id', '');
      if (error) {
        console.error('[Supabase] Erro ao limpar pedidos:', error);
        throw error;
      }
    }

    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
  },

  // --- Store Status ---
  isStoreOpen() {
    const settings = this.getSettings();
    if (!settings.storeOpen) return false;

    const now = new Date();
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const today = dayNames[now.getDay()];
    const hours = settings.operatingHours ? settings.operatingHours[today] : null;

    if (!hours || !hours.active) return false;

    const todayStr = now.toISOString().split('T')[0];
    for (const closure of settings.closures || []) {
      if (closure.type === 'date' && closure.date === todayStr) return false;
      if (closure.type === 'range') {
        if (todayStr >= closure.start && todayStr <= closure.end) return false;
      }
    }

    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    if (currentTime < hours.open || currentTime > hours.close) return false;

    return true;
  },

  getStoreStatusMessage() {
    const settings = this.getSettings();
    if (!settings.storeOpen) {
      return settings.closedCustomMessage || 'Loja fechada no momento pelo administrador.';
    }

    const now = new Date();
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const today = dayNames[now.getDay()];
    const hours = settings.operatingHours ? settings.operatingHours[today] : null;

    if (!hours || !hours.active) {
      return `Não abrimos aos ${dayLabels[now.getDay()]}s.`;
    }

    const todayStr = now.toISOString().split('T')[0];
    for (const closure of settings.closures || []) {
      if (closure.type === 'date' && closure.date === todayStr) {
        return `Fechado hoje: ${closure.reason || 'Fechamento programado'}`;
      }
      if (closure.type === 'range' && todayStr >= closure.start && todayStr <= closure.end) {
        return `Fechado: ${closure.reason || 'Período de recesso/férias'}`;
      }
    }

    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    if (currentTime < hours.open) {
      return `Abrimos hoje às ${hours.open}`;
    }
    if (currentTime > hours.close) {
      return `Fechamos às ${hours.close}. Volte amanhã!`;
    }

    return `Aberto hoje até as ${hours.close}`;
  },

  // --- Backup & Restore ---
  exportBackup() {
    const data = {
      exportDate: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      settings: this.getSettings(),
      orders: this.getOrders(),
    };
    return JSON.stringify(data, null, 2);
  },

  async importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.categories && Array.isArray(data.categories)) {
        for (const cat of data.categories) {
          await this.saveCategory(cat);
        }
      }
      if (data.products && Array.isArray(data.products)) {
        for (const prod of data.products) {
          await this.saveProduct(prod);
        }
      }
      if (data.settings && typeof data.settings === 'object') {
        await this.saveSettings(data.settings);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async resetToDefaults() {
    this._products = [...DEFAULT_PRODUCTS];
    this._categories = [...DEFAULT_CATEGORIES];
    this._settings = { ...DEFAULT_SETTINGS };
    this._orders = [];

    const sb = this.getSb();
    if (sb) {
      await this.seedCategories(sb);
      await this.seedProducts(sb);
      await this.seedSettings(sb);
      await this.clearAllOrders();
    }

    localStorage.removeItem(DB_KEYS.PRODUCTS);
    localStorage.removeItem(DB_KEYS.SETTINGS);
    localStorage.removeItem(DB_KEYS.CATEGORIES);
    localStorage.removeItem(DB_KEYS.ORDERS);
  }
};

// ===== CART MANAGER =====
const Cart = {
  KEY: 'dolcearte_cart',

  getItems() {
    return JSON.parse(localStorage.getItem(this.KEY) || '[]');
  },

  addItem(productId) {
    const items = this.getItems();
    const existing = items.find(i => i.productId === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ productId, qty: 1 });
    }
    localStorage.setItem(this.KEY, JSON.stringify(items));
    return items;
  },

  removeItem(productId) {
    const items = this.getItems().filter(i => i.productId !== productId);
    localStorage.setItem(this.KEY, JSON.stringify(items));
    return items;
  },

  updateQty(productId, qty) {
    const items = this.getItems();
    const item = items.find(i => i.productId === productId);
    if (item) {
      item.qty = Math.max(1, qty);
    }
    localStorage.setItem(this.KEY, JSON.stringify(items));
    return items;
  },

  clear() {
    localStorage.setItem(this.KEY, JSON.stringify([]));
  },

  getSubtotal() {
    const items = this.getItems();
    let total = 0;
    items.forEach(item => {
      const product = DataStore.getProductById(item.productId);
      if (product) {
        const price = product.promotion && product.promotion.active
          ? product.price * (1 - product.promotion.discountPercent / 100)
          : product.price;
        total += price * item.qty;
      }
    });
    return total;
  },

  getTotal() {
    return this.getSubtotal();
  },

  getDeliveryFee(deliveryType) {
    if (deliveryType === 'pickup') return 0;
    const settings = DataStore.getSettings();
    const delivery = settings.delivery || DEFAULT_SETTINGS.delivery;
    if (delivery.deliveryEnabled === false) return 0;
    const subtotal = this.getSubtotal();
    if (delivery.freeDeliveryThreshold > 0 && subtotal >= delivery.freeDeliveryThreshold) {
      return 0; // Free delivery
    }
    return delivery.deliveryFee || 0;
  },

  getGrandTotal(deliveryType) {
    return this.getSubtotal() + this.getDeliveryFee(deliveryType);
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  getDetailedItems() {
    const items = this.getItems();
    return items.map(item => {
      const product = DataStore.getProductById(item.productId);
      if (!product) return null;
      const finalPrice = product.promotion && product.promotion.active
        ? product.price * (1 - product.promotion.discountPercent / 100)
        : product.price;
      return {
        ...item,
        product,
        finalPrice,
        subtotal: finalPrice * item.qty
      };
    }).filter(Boolean);
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  sanitizeUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (/^(https?:\/\/|\/|assets\/|data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,)/i.test(trimmed)) {
      return trimmed;
    }
    return '';
  },

  async hashPassword(password) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        // Fallback if subtle.digest fails in context
      }
    }
    return Utils._sha256Fallback(password);
  },

  _sha256Fallback(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i, j;
    const words = [];
    const asciiBitLength = ascii.length * 8;
    const hash = [];
    const k = [];
    let primeCounter = 0;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = candidate * candidate; i < 313; i += candidate) {
          isComposite[i] = true;
        }
        if (primeCounter < 8) {
          hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        }
        k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        primeCounter++;
      }
    }
    ascii += '\x80';
    while ((ascii.length % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - (i % 4)) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;
    for (j = 0; j < words.length; ) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash.slice(0);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15], w2 = w[i - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i]) | 0;
        const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;
        hash[7] = hash[6];
        hash[6] = hash[5];
        hash[5] = hash[4];
        hash[4] = (hash[3] + temp1) | 0;
        hash[3] = hash[2];
        hash[2] = hash[1];
        hash[1] = hash[0];
        hash[0] = (temp1 + temp2) | 0;
      }
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    let hex = '';
    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        const b = (hash[i] >> (8 * j)) & 255;
        hex += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return hex;
  },

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  },

  formatDate(isoString) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString));
  },

  formatDateShort(isoString) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(isoString));
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon';
    iconSpan.textContent = icons[type] || '✅';
    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;
    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  buildWhatsAppMessage(order) {
    const settings = DataStore.getSettings();
    let msg = `🎂 *NOVO PEDIDO - ${settings.storeName}*\n\n`;
    msg += `📋 *Pedido:* ${order.id}\n`;
    msg += `📅 *Data:* ${Utils.formatDate(order.date)}\n\n`;

    msg += `👤 *Cliente:*\n`;
    msg += `• Nome: ${order.customer.name}\n`;
    msg += `• Telefone: ${order.customer.phone}\n`;

    if (order.deliveryType === 'pickup') {
      msg += `• Modo: 🏬 *RETIRADA NO LOCAL*\n`;
      msg += `• Local: ${settings.delivery.pickupAddress}\n`;
    } else {
      msg += `• Modo: 🛵 *ENTREGA A DOMICÍLIO*\n`;
      msg += `• Endereço: ${order.customer.address}\n`;
    }

    if (order.customer.observations) {
      msg += `• Observações: ${order.customer.observations}\n`;
    }

    msg += `\n🛒 *Itens do Pedido:*\n`;
    order.items.forEach(item => {
      msg += `• ${item.qty}x ${item.name} - ${Utils.formatCurrency(item.subtotal)}\n`;
    });

    msg += `\n💵 *Subtotal:* ${Utils.formatCurrency(order.subtotal)}`;
    if (order.deliveryType === 'delivery') {
      msg += `\n🛵 *Taxa de Entrega:* ${order.deliveryFee === 0 ? 'GRÁTIS' : Utils.formatCurrency(order.deliveryFee)}`;
    }
    msg += `\n💰 *VALOR TOTAL: ${Utils.formatCurrency(order.total)}*\n`;
    msg += `💳 *Forma de Pagamento:* ${order.paymentMethod}\n`;

    if (order.paymentMethod.toLowerCase().includes('dinheiro') && order.customer.trocoPara) {
      msg += `💵 *Troco para:* ${order.customer.trocoPara}\n`;
    }

    if (order.paymentMethod.toLowerCase().includes('pix') && settings.pixDetails && settings.pixDetails.key) {
      msg += `\n📱 *Chave Pix:* ${settings.pixDetails.key} (${settings.pixDetails.keyType})\n`;
      msg += `👤 *Titular:* ${settings.pixDetails.receiverName}\n`;
    }

    msg += `\n_Mensagem gerada pelo site ${settings.storeName}_`;
    return msg;
  },

  sendToWhatsApp(message) {
    const settings = DataStore.getSettings();
    const phone = (settings.whatsappNumber || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  },

  sendWhatsAppToCustomer(customerPhone, message) {
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.length <= 11 ? '55' + cleanPhone : cleanPhone;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneWithDDI}?text=${encoded}`, '_blank');
  }
};
