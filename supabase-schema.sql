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
    store_name TEXT DEFAULT 'Carla Silva Buffet',
    store_tagline TEXT DEFAULT 'Buffet Infantil, Bolos & Doces Artesanais',
    store_logo_emoji TEXT DEFAULT '🧁',
    store_logo_image TEXT DEFAULT '',
    theme_color TEXT DEFAULT '#D81B60',
    announcement_bar JSONB DEFAULT '{"active": true, "text": "🎉 Encomendas abertas! Bolos por kg, Kits Festa, Salgados, Doces Gourmet e Buffet Infantil Completo!"}'::jsonb,
    hero JSONB DEFAULT '{"emoji": "🧁", "title": "Carla Silva Buffet & Confeitaria", "subtitle": "Tudo para sua festa ser inesquecível! Bolos confeitados por quilo, kits festa práticos, doces finos, salgados crocantes e buffet infantil completo.", "ctaText": "✨ Ver Cardápio & Encomendar"}'::jsonb,
    about JSONB DEFAULT '{"active": true, "title": "Carla Silva Buffet", "subtitle": "Doces memórias e sabores inesquecíveis para o seu evento", "text": "No Carla Silva Buffet, cada comemoração é tratada como única e especial. Trabalhamos com ingredientes de primeira linha, bolos sob medida com massas e recheios generosos, kits festa prontinhos para celebrar, salgados crocantes fritos na hora ou assados de forno, e nosso serviço completo de Buffet Infantil com 3h de festa e equipe de apoio.", "features": [{"desc": "Estrutura completa com 3h de festa, fritura no local e apoio", "icon": "🎪", "title": "Buffet Infantil"}, {"desc": "Massas nobres e recheios generosos feitos sob medida", "icon": "🎂", "title": "Bolos por Quilo"}, {"desc": "Bolo confeitado, doces, salgados e topo de bolo inclusos", "icon": "🎉", "title": "Kits Festa Prontos"}, {"desc": "Doces gourmet com Nutella e salgados de forno especiais", "icon": "🥟", "title": "Doces & Salgados"}]}'::jsonb,
    delivery JSONB DEFAULT '{"deliveryEnabled": true, "deliveryFee": 15.00, "freeDeliveryThreshold": 200.00, "estimatedTime": "Consulte data e horário", "pickupEnabled": true, "pickupAddress": "Retirada com horário agendado com a Carla Silva", "pickupEstimate": "Pronto na data agendada"}'::jsonb,
    whatsapp_number TEXT DEFAULT '5581998723560',
    contact_phone TEXT DEFAULT '(81) 99872-3560',
    instagram TEXT DEFAULT '@Carlasilvacakes2',
    address TEXT DEFAULT 'Carla Silva Buffet & Confeitaria - Atendimento e Encomendas',
    footer_copyright TEXT DEFAULT '© 2026 Carla Silva Buffet. Todos os direitos reservados.',
    payment_methods JSONB DEFAULT '[{"active": true, "icon": "📱", "id": "pix", "name": "Pix"}, {"active": true, "icon": "💵", "id": "dinheiro", "name": "Dinheiro"}, {"active": true, "icon": "💳", "id": "credito", "name": "Cartão Crédito"}, {"active": true, "icon": "💳", "id": "debito", "name": "Cartão Débito"}, {"active": false, "icon": "🏦", "id": "transferencia", "name": "Transferência"}]'::jsonb,
    pix_details JSONB DEFAULT '{"key": "(81) 99872-3560", "keyType": "Celular", "receiverName": "Carla Silva Buffet", "instructions": "Faça o Pix para a chave celular acima e envie o comprovante pelo WhatsApp (81) 99872-3560 para confirmar sua encomenda."}'::jsonb,
    store_open BOOLEAN DEFAULT true,
    closed_custom_message TEXT DEFAULT 'Estamos em horário de preparação de encomendas. Mande uma mensagem pelo WhatsApp para agendar sua data!',
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
    ('cat_buffet', 'Buffet', '🎪'),
    ('cat_kits', 'Kits Festa', '🎉'),
    ('cat_bolos', 'Bolos', '🎂'),
    ('cat_doces', 'Doces', '🍬'),
    ('cat_salgados', 'Salgados', '🥟')
ON CONFLICT (id) DO NOTHING;

-- Insert Default Products
INSERT INTO public.products (id, name, description, price, image, category, badge, active, in_stock, promotion) VALUES
    ('prod_buffet_01', 'Buffet Infantil Completo (50 Convidados)', 'Buffet Infantil completo para 50 convidados (3h de festa). Inclui: Doces e salgados tradicionais, Doces Gourmet, Salgados de forno (Mini Pizza, Hambúrguer, Barquete, Mini lanches), Fritura no local, Refrigerantes, Água mineral, Suco da fruta, Descartáveis e 1 apoio de cozinha. Taxa de deslocamento a combinar.', 1499.00, 'assets/images/buffet_infantil.jpg', 'Buffet', 'Pacote 50 Pessoas', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_kit_01', 'Kit Festa 1 (1 kg Bolo + 20 Doces + 30 Salgados)', 'Ideal para comemorações íntimas. Inclui: 1 kg de bolo confeitado, 20 doces tradicionais, 30 salgados e Topo de bolo simples.', 120.00, 'assets/images/kit_festa.jpg', 'Kits Festa', 'Econômico', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_kit_02', 'Kit Festa 2 (1,5 kg Bolo + 30 Doces + 50 Salgados)', 'Perfeito para celebrar em família. Inclui: 1,5 kg de bolo confeitado, 30 doces tradicionais, 50 salgados e Topo de bolo simples.', 160.00, 'assets/images/kit_festa.jpg', 'Kits Festa', 'Mais Pedido', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_kit_03', 'Kit Festa 3 (2 kg Bolo + 50 Doces + 60 Salgados)', 'O preferido dos clientes! Inclui: 2 kg de bolo confeitado, 50 doces tradicionais, 60 salgados e Topo de bolo simples.', 199.90, 'assets/images/kit_festa.jpg', 'Kits Festa', 'Destaque', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_kit_04', 'Kit Festa 4 (3 kg Bolo + 80 Doces + 100 Salgados)', 'Festa completa com muita fartura! Inclui: 3 kg de bolo confeitado, 80 doces tradicionais, 100 salgados e Topo de bolo simples.', 299.00, 'assets/images/kit_festa.jpg', 'Kits Festa', 'Super Festa', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_bolo_1k', 'Bolo Decorado - 1 Kilo', 'Bolo confeitado artesanal (1 kg). Massas: Chocolate, Brigadeiro Branco, Baunilha ou Red Velvet. Recheios: Chocolate, Prestígio, Bem Casado, Ninho, Brigadeiro Branco ou Oreo.', 70.00, 'assets/images/bolo_decorado.jpg', 'Bolos', '1 kg', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_bolo_2k', 'Bolo Decorado - 2 Kilos', 'Bolo confeitado artesanal (2 kg - serve aprox. 20 fatias). Massas: Chocolate, Brigadeiro Branco, Baunilha ou Red Velvet. Recheios: Chocolate, Prestígio, Bem Casado, Ninho, Brigadeiro Branco ou Oreo.', 140.00, 'assets/images/bolo_decorado.jpg', 'Bolos', 'Mais Vendido', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_bolo_3k', 'Bolo Decorado - 3 Kilos', 'Bolo confeitado artesanal (3 kg - serve aprox. 30 fatias). Massas: Chocolate, Brigadeiro Branco, Baunilha ou Red Velvet. Recheios: Chocolate, Prestígio, Bem Casado, Ninho, Brigadeiro Branco ou Oreo.', 210.00, 'assets/images/bolo_decorado.jpg', 'Bolos', '3 kg', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_doce_trad_un', 'Doces Tradicionais (Unidade)', 'Docinho tradicional de festa (unidade). Sabores: Brigadeiro, Beijinho, Bem Casado, Moranguinho, Crespinho e Colorido.', 0.80, 'assets/images/doces_gourmet.jpg', 'Doces', 'R$ 0,80 un', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_doce_esp_un', 'Doces Especiais Gourmet (Unidade)', 'Docinho gourmet especial (unidade). Sabores: Brigadeiro Gourmet c/ Nutella, Ferrero Rocher c/ Nutella, Ninho com Nutella, Churros c/ Doce de Leite, Surpresa de Uva e Tortinha Doce.', 2.00, 'assets/images/doces_gourmet.jpg', 'Doces', 'Gourmet', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_salg_frito_un', 'Salgados Fritos Tradicionais (Unidade)', 'Salgadinho frito crocante (unidade). Sabores: Coxinha, Bolinho de Queijo, Croquete de Calabresa, Risole de Pizza, Bolinho de Charque e Enroladinho de Salsicha.', 0.80, 'assets/images/salgados_festa.jpg', 'Salgados', 'R$ 0,80 un', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_salg_pizza', 'Mini Pizza de Forno (Unidade)', 'Mini pizza assada de forno com molho de tomate caseiro, queijo derretido e tempero especial.', 1.50, 'assets/images/salgados_festa.jpg', 'Salgados', 'De Forno', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_salg_burguer', 'Mini Hambúrguer Artesanal (Unidade)', 'Mini hambúrguer artesanal no pão com gergelim, carne suculenta e queijo derretido. O preferido das crianças!', 2.50, 'assets/images/salgados_festa.jpg', 'Salgados', 'De Forno', true, true, '{"active": false, "discountPercent": 0}'::jsonb),
    ('prod_salg_barquete', 'Barquete Recheada (Unidade)', 'Barquete crocante recheada com patê especial decorado, perfeita para recepções e buffets.', 1.20, 'assets/images/salgados_festa.jpg', 'Salgados', 'De Forno', true, true, '{"active": false, "discountPercent": 0}'::jsonb)
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
