-- Supabase Schema for WebKen — catalog, accounts (roles), and orders
-- DDL only. Seed data lives in supabase/seed.sql (run it after this file).

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables for clean migration (WARNING: This will delete existing data!)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS page_sections CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Taxonomy: Brands and Categories
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Core: Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  scale TEXT NOT NULL,
  condition TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0, -- Auto-calculated via trigger
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Stock Ledger
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'damaged')),
  quantity INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Accounts: Profiles (role lives here; auth.users is Supabase-managed)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Orders and line items (line items snapshot product name/sku/price)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed', 'cancelled')),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- 7. CMS & Settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whatsapp_number TEXT,
  site_name TEXT DEFAULT 'W//KEN',
  seo_title TEXT,
  seo_description TEXT,
  contact_email TEXT,
  address TEXT,
  bank_info TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================
-- Helper functions (defined before policies that reference them)
-- =============================================================

-- SECURITY DEFINER so the role lookup bypasses RLS and cannot recurse
-- into the profiles policies that call this function.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Auto-create a profile row (role=customer) when a user signs up.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Block customers from promoting themselves: only admins may change role.
-- auth.uid() IS NULL means a trusted server context (service role / SQL editor),
-- e.g. the demo-admin promote statement in seed.sql — that is allowed through.
CREATE OR REPLACE FUNCTION prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT is_admin() THEN
    RAISE EXCEPTION 'Not allowed to change role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

-- =============================================================
-- Row Level Security
-- =============================================================
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public (anon + authenticated) read access to catalog/CMS
CREATE POLICY "Public can view brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view page sections" ON page_sections FOR SELECT USING (true);

-- Catalog/CMS writes: admins only (role-gated, not just "authenticated")
CREATE POLICY "Admins manage brands" ON brands FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage products" ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage product images" ON product_images FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage stock movements" ON stock_movements FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage site settings" ON site_settings FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins manage page sections" ON page_sections FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Profiles: users see/edit their own; admins can read all.
-- (role changes are blocked for non-admins by prevent_role_escalation trigger)
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins update any profile" ON profiles FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Guest checkout: anyone may place an order; only admins can read or update them.
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins update orders" ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view all order items" ON order_items FOR SELECT USING (is_admin());

-- =============================================================
-- updated_at triggers
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON page_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- Stock auto-recalculation from the ledger
-- =============================================================
CREATE OR REPLACE FUNCTION recalculate_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = (
    SELECT COALESCE(SUM(
      CASE
        WHEN movement_type = 'in' THEN quantity
        WHEN movement_type = 'adjustment' THEN quantity
        ELSE -quantity -- out, damaged
      END
    ), 0)
    FROM stock_movements
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_stock_after_movement
  AFTER INSERT OR UPDATE OR DELETE ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION recalculate_product_stock();
