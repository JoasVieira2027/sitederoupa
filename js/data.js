/**
 * data.js - Data Management Layer
 * Handles all localStorage CRUD operations for products, orders, settings, categories, and theme
 */

const DB_KEYS = {
  PRODUCTS: 'dolcearte_products',
  ORDERS: 'dolcearte_orders',
  SETTINGS: 'dolcearte_settings',
};

// ===== DEFAULT DATA =====
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

const DEFAULT_SETTINGS = {
  // Store Branding & Visual
  storeName: 'Dolce Arte',
  storeTagline: 'Bolos Artesanais Feitos com Amor',
  storeLogoEmoji: '🎂',
  storeLogoImage: '',
  themeColor: '#8B5E3C', // Warm bakery brown

  // Top Announcement Bar
  announcementBar: {
    active: true,
    text: '🎉 Encomendas abertas! Ingredientes 100% nobres e artesanais. Faça seu pedido!'
  },

  // Hero Section
  hero: {
    emoji: '🎂',
    title: 'Bolos Artesanais Feitos com Amor',
    subtitle: 'Cada bolo é uma obra de arte, preparado com ingredientes selecionados e muito carinho. Descubra sabores que vão encantar seu paladar.',
    ctaText: '✨ Ver Cardápio'
  },

  // About Us Section
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

  // Categories
  categories: [
    { id: 'cat_choco', name: 'Chocolate', icon: '🍫' },
    { id: 'cat_especial', name: 'Especial', icon: '⭐' },
    { id: 'cat_tradicional', name: 'Tradicional', icon: '🏠' },
    { id: 'cat_frutas', name: 'Frutas', icon: '🍓' },
    { id: 'cat_festas', name: 'Festas', icon: '🎉' }
  ],

  // Delivery & Pickup
  delivery: {
    deliveryEnabled: true,
    deliveryFee: 10.00,
    freeDeliveryThreshold: 120.00, // 0 = disabled
    estimatedTime: '40 a 60 min',
    pickupEnabled: true,
    pickupAddress: 'Rua das Flores, 123 - Centro (Confeitaria Dolce Arte)',
    pickupEstimate: 'Pronto em 30 min'
  },

  // Contacts & Social
  whatsappNumber: '5511999999999',
  contactPhone: '(11) 99999-9999',
  instagram: '@dolcearte.bolos',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  footerCopyright: '© 2026 Dolce Arte. Todos os direitos reservados.',

  // Payment Methods
  paymentMethods: [
    { id: 'pix', name: 'Pix', icon: '📱', active: true },
    { id: 'dinheiro', name: 'Dinheiro', icon: '💵', active: true },
    { id: 'credito', name: 'Cartão Crédito', icon: '💳', active: true },
    { id: 'debito', name: 'Cartão Débito', icon: '💳', active: true },
    { id: 'transferencia', name: 'Transferência', icon: '🏦', active: false }
  ],

  // Pix Details
  pixDetails: {
    keyType: 'Celular', // Celular, CPF, CNPJ, E-mail, Aleatória
    key: '(11) 99999-9999',
    receiverName: 'Dolce Arte Confeitaria Ltda',
    instructions: 'Transfira o valor do pedido e anexe o comprovante na conversa do WhatsApp para agilizarmos a produção.'
  },

  // Operating Hours & Schedule
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

  // Security
  adminPassword: 'admin123',
};

// Helper for deep merging default settings with stored settings
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

// ===== DATA ACCESS LAYER =====
const DataStore = {
  // --- Initialize ---
  init() {
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
    }
  },

  // --- Products ---
  getProducts() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PRODUCTS) || '[]');
  },

  getActiveProducts() {
    return this.getProducts().filter(p => p.active && p.inStock);
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  saveProduct(product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...products[index], ...product };
    } else {
      product.id = 'prod_' + Date.now();
      products.push(product);
    }
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    return product;
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
  },

  toggleProductActive(id) {
    const products = this.getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
      product.active = !product.active;
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    }
    return product;
  },

  toggleProductStock(id) {
    const products = this.getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
      product.inStock = !product.inStock;
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    }
    return product;
  },

  // --- Categories ---
  getCategories() {
    const settings = this.getSettings();
    if (settings.categories && settings.categories.length > 0) {
      return settings.categories;
    }
    return DEFAULT_SETTINGS.categories;
  },

  saveCategory(category) {
    const settings = this.getSettings();
    if (!settings.categories) settings.categories = [...DEFAULT_SETTINGS.categories];

    const index = settings.categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      settings.categories[index] = category;
    } else {
      category.id = category.id || 'cat_' + Date.now().toString(36);
      settings.categories.push(category);
    }
    this.saveSettings(settings);
    return category;
  },

  deleteCategory(id) {
    const settings = this.getSettings();
    if (settings.categories) {
      settings.categories = settings.categories.filter(c => c.id !== id);
      this.saveSettings(settings);
    }
  },

  // --- Settings ---
  getSettings() {
    const raw = localStorage.getItem(DB_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(raw);
      // Merge with default settings to ensure new keys always exist
      return deepMerge(DEFAULT_SETTINGS, parsed);
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    this.applyTheme(settings.themeColor);
  },

  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
    return settings;
  },

  applyTheme(color) {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    // calculate a slightly darker and lighter variant
    try {
      const col = color.replace('#', '');
      const num = parseInt(col, 16);
      const r = Math.max(0, Math.min(255, (num >> 16) - 30));
      const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) - 20));
      const b = Math.max(0, Math.min(255, (num & 0x0000FF) - 15));
      const darkColor = `rgb(${r}, ${g}, ${b})`;
      document.documentElement.style.setProperty('--primary-dark', darkColor);
      document.documentElement.style.setProperty('--primary-50', `rgba(${r}, ${g}, ${b}, 0.06)`);
      document.documentElement.style.setProperty('--primary-100', `rgba(${r}, ${g}, ${b}, 0.12)`);
    } catch(e) {}
  },

  // --- Orders ---
  getOrders() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
  },

  saveOrder(order) {
    const orders = this.getOrders();
    order.id = 'PED-' + Date.now().toString(36).toUpperCase();
    order.date = new Date().toISOString();
    order.status = order.status || 'novo'; // 'novo', 'preparo', 'entrega', 'concluido', 'cancelado'
    orders.unshift(order);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return order;
  },

  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    }
    return order;
  },

  deleteOrder(id) {
    const orders = this.getOrders().filter(o => o.id !== id);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  },

  clearAllOrders() {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
  },

  // --- Store Status Check ---
  isStoreOpen() {
    const settings = this.getSettings();

    // Manual override
    if (!settings.storeOpen) return false;

    const now = new Date();
    const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const today = dayNames[now.getDay()];
    const hours = settings.operatingHours ? settings.operatingHours[today] : null;

    // Check if day is active
    if (!hours || !hours.active) return false;

    // Check closures
    const todayStr = now.toISOString().split('T')[0];
    for (const closure of settings.closures || []) {
      if (closure.type === 'date' && closure.date === todayStr) return false;
      if (closure.type === 'range') {
        if (todayStr >= closure.start && todayStr <= closure.end) return false;
      }
    }

    // Check hours
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
      settings: this.getSettings(),
      orders: this.getOrders(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(data.products));
      }
      if (data.settings && typeof data.settings === 'object') {
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      if (data.orders && Array.isArray(data.orders)) {
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(data.orders));
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  resetToDefaults() {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
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

  // Convert image file to base64 data URL
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Toast notification
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
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '✅'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Build WhatsApp message
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

// Initialize on load
DataStore.init();
DataStore.applyTheme(DataStore.getSettings().themeColor);
