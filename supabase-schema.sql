-- ============================================================
-- SUPABASE POSTGRESQL SCHEMA FOR DOLCE ARTE CONFEITARIA
-- ============================================================
-- Execute todo este script no SQL Editor do Supabase.
-- Ele cria todas as tabelas, relacionamentos, políticas de segurança
-- abertas (para permitir gravação imediata do painel admin),
-- replicação Realtime e os dados iniciais.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE: CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '🎂',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABLE: PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image TEXT,
    category TEXT NOT NULL,
    badge TEXT,
    active BOOLEAN DEFAULT true,
    in_stock BOOLEAN DEFAULT true,
    promotion JSONB DEFAULT '{"active": false, "discountPercent": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Foreign Key: Product Category to Categories(name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_category'
    ) THEN
        ALTER TABLE public.products
        ADD CONSTRAINT fk_products_category
        FOREIGN KEY (category)
        REFERENCES public.categories(name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT;
    END IF;
END $$;

-- 4. TABLE: SETTINGS (Single-row configuration)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    store_name TEXT DEFAULT 'Dolce Arte',
    store_tagline TEXT DEFAULT 'Bolos Artesanais Feitos com Amor',
    store_logo_emoji TEXT DEFAULT '🎂',
    store_logo_image TEXT DEFAULT '',
    theme_color TEXT DEFAULT '#8B5E3C',
    announcement_bar JSONB DEFAULT '{"active": true, "text": "🎉 Encomendas abertas! Ingredientes 100% nobres e artesanais. Faça seu pedido!"}'::jsonb,
    hero JSONB DEFAULT '{"emoji": "🎂", "title": "Bolos Artesanais Feitos com Amor", "subtitle": "Cada bolo é uma obra de arte, preparado com ingredientes selecionados e muito carinho. Descubra sabores que vão encantar seu paladar.", "ctaText": "✨ Ver Cardápio"}'::jsonb,
    about JSONB DEFAULT '{"active": true, "title": "Nossa Paixão por Confeitaria Artesanal", "subtitle": "Doces memórias e sabores inesquecíveis", "text": "Na Dolce Arte, acreditamos que todo momento especial merece ser celebrado com um bolo único. Cada receita nasce do amor pela confeitaria tradicional, combinada com técnicas modernas e ingredientes nobres como chocolates belgas, baunilhas puras e frutas frescas selecionadas diariamente.", "features": [{"desc": "Produção fresca e sem conservantes artificiais", "icon": "🌿", "title": "100% Artesanal"}, {"desc": "Chocolates belgas e matéria-prima selecionada", "icon": "🍫", "title": "Ingredientes Nobres"}, {"desc": "Sabor caseiro com apresentação refinada", "icon": "👩‍🍳", "title": "Receitas Autorais"}, {"desc": "Seu bolo chega impecável e protegido", "icon": "🛵", "title": "Entrega Cuidadosa"}]}'::jsonb,
    delivery JSONB DEFAULT '{"deliveryEnabled": true, "deliveryFee": 10.00, "freeDeliveryThreshold": 120.00, "estimatedTime": "40 a 60 min", "pickupEnabled": true, "pickupAddress": "Rua das Flores, 123 - Centro (Confeitaria Dolce Arte)", "pickupEstimate": "Pronto em 30 min"}'::jsonb,
    whatsapp_number TEXT DEFAULT '5511999999999',
    contact_phone TEXT DEFAULT '(11) 99999-9999',
    instagram TEXT DEFAULT '@dolcearte.bolos',
    address TEXT DEFAULT 'Rua das Flores, 123 - São Paulo/SP',
    footer_copyright TEXT DEFAULT '© 2026 Dolce Arte. Todos os direitos reservados.',
    payment_methods JSONB DEFAULT '[{"active": true, "icon": "📱", "id": "pix", "name": "Pix"}, {"active": true, "icon": "💵", "id": "dinheiro", "name": "Dinheiro"}, {"active": true, "icon": "💳", "id": "credito", "name": "Cartão Crédito"}, {"active": true, "icon": "💳", "id": "debito", "name": "Cartão Débito"}, {"active": false, "icon": "🏦", "id": "transferencia", "name": "Transferência"}]'::jsonb,
    pix_details JSONB DEFAULT '{"key": "(11) 99999-9999", "keyType": "Celular", "receiverName": "Dolce Arte Confeitaria Ltda", "instructions": "Transfira o valor do pedido e anexe o comprovante na conversa do WhatsApp para agilizarmos a produção."}'::jsonb,
    store_open BOOLEAN DEFAULT true,
    closed_custom_message TEXT DEFAULT 'Estamos fechados no momento. Nossos confeiteiros estão preparando novas delícias para você!',
    operating_hours JSONB DEFAULT '{"domingo": {"open": "00:00", "close": "00:00", "active": false}, "quarta": {"open": "08:00", "close": "18:00", "active": true}, "quinta": {"open": "08:00", "close": "18:00", "active": true}, "sabado": {"open": "09:00", "close": "14:00", "active": true}, "segunda": {"open": "08:00", "close": "18:00", "active": true}, "sexta": {"open": "08:00", "close": "18:00", "active": true}, "terca": {"open": "08:00", "close": "18:00", "active": true}}'::jsonb,
    closures JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABLE: ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL,
    delivery_type TEXT NOT NULL DEFAULT 'delivery',
    delivery_fee NUMERIC(10, 2) DEFAULT 0,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'novo',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- Habilita RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Limpa políticas antigas se existirem
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all on categories" ON public.categories;

DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated admins can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Allow all on products" ON public.products;

DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all on settings" ON public.settings;

DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;

-- ============================================================
-- OPÇÃO A: Modo Padrão (Compatível com painel via senha do proprietário)
-- Permite leitura e gravação tanto via chave anon quanto autenticada.
-- ============================================================
CREATE POLICY "Allow all on categories" 
ON public.categories FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all on products" 
ON public.products FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all on settings" 
ON public.settings FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all on orders" 
ON public.orders FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- ============================================================
-- OPÇÃO B: Modo Hardened (Recomendado se usar Supabase Auth)
-- Para ativar, descomente o bloco abaixo e comente a OPÇÃO A:
-- ============================================================
-- CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO public USING (true);
-- CREATE POLICY "Admin write categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
--
-- CREATE POLICY "Public read products" ON public.products FOR SELECT TO public USING (true);
-- CREATE POLICY "Admin write products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
--
-- CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO public USING (true);
-- CREATE POLICY "Admin write settings" ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
--
-- CREATE POLICY "Public insert orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
-- CREATE POLICY "Admin manage orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 7. REALTIME REPLICATION (Instant sync across all devices)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

-- ============================================================
-- 8. INITIAL SEED DATA (Populated if tables are empty)
-- ============================================================

-- Insert Categories
INSERT INTO public.categories (id, name, icon) VALUES
    ('cat_choco', 'Chocolate', '🍫'),
    ('cat_especial', 'Especial', '⭐'),
    ('cat_tradicional', 'Tradicional', '🏠'),
    ('cat_frutas', 'Frutas', '🍓'),
    ('cat_festas', 'Festas', '🎉')
ON CONFLICT (id) DO NOTHING;

-- Insert Default Products
INSERT INTO public.products (id, name, description, price, image, category, badge, active, in_stock, promotion) VALUES
    ('prod_001', 'Bolo de Chocolate Trufado', 'Irresistível bolo de chocolate com recheio de trufa e cobertura de ganache belga. Decorado com morangos frescos e raspas de chocolate.', 89.90, 'assets/images/cake_chocolate.jpg', 'Chocolate', 'Mais Vendido', true, true, '{"active": true, "discountPercent": 15}'::jsonb),
    ('prod_002', 'Red Velvet Premium', 'Elegante bolo red velvet com cream cheese artesanal e cachos de chocolate branco. Perfeito para ocasiões especiais.', 95.00, 'assets/images/cake_red_velvet.jpg', 'Especial', 'Destaque', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_003', 'Bolo de Cenoura Gourmet', 'Tradicional bolo de cenoura com cobertura cremosa e nozes caramelizadas. Receita da vovó com toque gourmet.', 65.00, 'assets/images/cake_carrot.jpg', 'Tradicional', 'Receita de Família', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_004', 'Bolo de Limão Siciliano', 'Delicado bolo de limão siciliano com cobertura de merengue e flores comestíveis. Leveza e sofisticação em cada fatia.', 78.00, 'assets/images/cake_lemon.jpg', 'Especial', 'Refrescante', true, true, '{"active": true, "discountPercent": 10}'::jsonb),
    ('prod_005', 'Bolo de Brigadeiro', 'Nosso clássico artesanal! Bolo de chocolate com recheio e cobertura de brigadeiro gourmet, decorado com brigadeiros enrolados à mão.', 85.00, 'assets/images/cake_brigadeiro.jpg', 'Chocolate', 'Favorito', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_006', 'Bolo de Coco Tropical', 'Bolo fofinho de coco com cobertura de coco ralado fresco e flores tropicais. Sabor que remete ao paraíso.', 72.00, 'assets/images/cake_coconut.jpg', 'Tradicional', 'Molhadinho', true, true, '{"active": false, "discountPercent": 0}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert Default Settings
INSERT INTO public.settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. ADMIN USER CREATION (Optional helper for Supabase Auth)
-- ============================================================
-- You can create the administrator in the Supabase Dashboard:
-- Authentication -> Users -> "Add User" (Create user)
-- Email: admin@dolcearte.com
-- Password: your choice (e.g. admin123)
-- Auto Confirm User: YES
-- ============================================================

-- ============================================================
-- 10. STORAGE BUCKET FOR PRODUCT PHOTOS
-- ============================================================
-- Creates the public 'products' bucket for cake photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for Storage: allow public viewing and uploading
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all on storage products" ON storage.objects;

CREATE POLICY "Allow all on storage products" 
ON storage.objects FOR ALL 
TO public 
USING (bucket_id = 'products') 
WITH CHECK (bucket_id = 'products');
