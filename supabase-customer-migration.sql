-- ============================================================
-- SUPABASE MIGRATION: CONTAS DE CLIENTES & PEDIDOS SEGUROS
-- ============================================================
-- Execute este script no SQL Editor do Supabase (Dashboard > SQL Editor)
-- Não altera ou apaga nenhum produto, categoria ou configuração existente.
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE PERFIS DE CLIENTES (PROFILES)
-- Vinculada diretamente ao auth.users.id do Supabase Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    default_address JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Profiles:
-- Cliente autenticado só pode consultar, inserir e alterar SEU PRÓPRIO perfil.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. TRIGGER AUTOMÁTICO: CRIAÇÃO DE PERFIL NO CADASTRO / LOGIN GOOGLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ADICIONAR COLUNA user_id NA TABELA ORDERS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Índice para consultas rápidas por cliente
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 5. POLÍTICAS RLS SEGURAS PARA ORDERS (PEDIDOS)
-- Clientes autenticados consultam SOMENTE seus próprios pedidos.
-- Pedidos antigos sem user_id NÃO são expostos a nenhum cliente.
-- Clientes NÃO podem alterar status, preço ou excluir pedidos.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders with integrity" ON public.orders;

-- SELECT: Usuário autenticado consulta exclusivamente seus pedidos
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT: Qualquer cliente (autenticado ou visitante) pode cadastrar pedido.
-- Se autenticado, o user_id deve corresponder ao seu próprio auth.uid().
CREATE POLICY "Anyone can insert orders with integrity"
    ON public.orders FOR INSERT
    TO public
    WITH CHECK (
        user_id IS NULL OR user_id = auth.uid()
    );

-- Nota de Segurança: Não criamos policies de UPDATE ou DELETE para a role 'authenticated' ou 'anon'.
-- O status do pedido só é alterado pelo painel administrativo com permissão de serviço/administrador.

-- 6. ADICIONAR COLUNA DE IMAGEM EM CATEGORIAS (SE NÃO EXISTIR)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'image'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN image TEXT DEFAULT '';
    END IF;
END $$;

-- Preencher imagens padrão para as categorias se estiverem vazias
UPDATE public.categories SET image = 'assets/images/legging_fitness.jpg' WHERE id = 'cat_leggings' AND (image IS NULL OR image = '');
UPDATE public.categories SET image = 'assets/images/top_fitness.jpg' WHERE id = 'cat_tops' AND (image IS NULL OR image = '');
UPDATE public.categories SET image = 'assets/images/conjunto_fitness.jpg' WHERE id = 'cat_conjuntos' AND (image IS NULL OR image = '');
UPDATE public.categories SET image = 'assets/images/short_fitness.jpg' WHERE id = 'cat_shorts' AND (image IS NULL OR image = '');
UPDATE public.categories SET image = 'assets/images/hero_fitness.jpg' WHERE id = 'cat_macacoes' AND (image IS NULL OR image = '');
UPDATE public.categories SET image = 'assets/images/conjunto_fitness.jpg' WHERE id = 'cat_acessorios' AND (image IS NULL OR image = '');

-- 7. REINICIALIZAR REALTIME PARA TABELA PROFILES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;
