-- WebKen seed data. Run AFTER schema.sql.
-- Safe to re-run: clears catalog/CMS rows first (does NOT touch auth.users/profiles).

TRUNCATE order_items, orders, stock_movements, product_images, products, categories, brands, page_sections, site_settings RESTART IDENTITY CASCADE;

-- Brands
INSERT INTO brands (name, slug) VALUES
  ('Mini GT',        'mini-gt'),
  ('Tarmac Works',   'tarmac-works'),
  ('Inno64',         'inno64'),
  ('Tomica Premium', 'tomica-premium'),
  ('Kyosho',         'kyosho'),
  ('Hot Wheels Premium', 'hot-wheels-premium');

-- Categories
INSERT INTO categories (name, slug) VALUES
  ('JDM',        'jdm'),
  ('Supercar',   'supercar'),
  ('Sports Car', 'sports-car'),
  ('Classic',    'classic'),
  ('Rally',      'rally');

-- Products (brand_id/category_id resolved by slug)
INSERT INTO products (slug, sku, name, brand_id, category_id, scale, condition, price, description, status, is_featured) VALUES
  ('porsche-911-gt3-rs', 'MGT-P911-001', 'Porsche 911 GT3 RS',
    (SELECT id FROM brands WHERE slug = 'mini-gt'), (SELECT id FROM categories WHERE slug = 'supercar'),
    '1:64', 'Brand New in Box (Sealed)', 250000,
    'Model 1:64 Porsche 911 GT3 RS dengan detail cat autentik, interior rapi, dan ban karet. Termasuk display case akrilik.', 'Active', true),

  ('nissan-skyline-gt-r-r34', 'TW-R34-042', 'Nissan Skyline GT-R R34',
    (SELECT id FROM brands WHERE slug = 'tarmac-works'), (SELECT id FROM categories WHERE slug = 'jdm'),
    '1:64', 'Brand New in Box', 320000,
    'Ikon JDM R34 dengan finishing Bayside Blue, spion terpisah, dan detail mesin RB26. Rilisan terbatas Tarmac Works.', 'Active', true),

  ('honda-civic-type-r-fk8', 'TP-FK8-011', 'Honda Civic Type R FK8',
    (SELECT id FROM brands WHERE slug = 'tomica-premium'), (SELECT id FROM categories WHERE slug = 'jdm'),
    '1:64', 'Brand New in Box', 180000,
    'Hot hatch Championship White dengan sayap belakang khas Type R dan velg presisi.', 'Active', false),

  ('lamborghini-aventador-svj', 'MGT-AV-009', 'Lamborghini Aventador SVJ',
    (SELECT id FROM brands WHERE slug = 'mini-gt'), (SELECT id FROM categories WHERE slug = 'supercar'),
    '1:64', 'Brand New in Box (Sealed)', 275000,
    'Aventador SVJ Verde Alceo dengan aero agresif dan detail knalpot yang tajam.', 'Active', true),

  ('mazda-rx-7-fd3s', 'IN-RX7-023', 'Mazda RX-7 FD3S',
    (SELECT id FROM brands WHERE slug = 'inno64'), (SELECT id FROM categories WHERE slug = 'jdm'),
    '1:64', 'Brand New in Box', 350000,
    'RX-7 FD generasi terakhir dengan bodi rotary klasik, cat merah menyala, dan velg RE Amemiya.', 'Active', false),

  ('toyota-ae86-trueno', 'KY-AE86-055', 'Toyota Sprinter Trueno AE86',
    (SELECT id FROM brands WHERE slug = 'kyosho'), (SELECT id FROM categories WHERE slug = 'classic'),
    '1:64', 'Brand New in Box', 210000,
    'Panda Trueno AE86 legendaris, livery hitam-putih dua nada dengan pop-up headlight.', 'Active', false),

  ('subaru-impreza-wrx-sti-rally', 'HW-WRX-078', 'Subaru Impreza WRX STI Rally',
    (SELECT id FROM brands WHERE slug = 'hot-wheels-premium'), (SELECT id FROM categories WHERE slug = 'rally'),
    '1:64', 'Brand New in Box', 165000,
    'Livery rally World Rally Blue dengan detail sponsor, mud flap, dan velg gold khas WRC.', 'Active', false),

  ('bmw-m3-e30', 'TW-E30-091', 'BMW M3 E30',
    (SELECT id FROM brands WHERE slug = 'tarmac-works'), (SELECT id FROM categories WHERE slug = 'classic'),
    '1:64', 'Brand New in Box', 230000,
    'M3 E30 boxy klasik dengan proporsi presisi, fender flare, dan detail interior lengkap.', 'Active', false);

-- Primary images (reuse the real .webp already in public/uploads/images; no-image for the rest)
INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
  ((SELECT id FROM products WHERE slug = 'porsche-911-gt3-rs'),          '/uploads/images/1782096542599-c57a88b80b654c1e.webp', 0, true),
  ((SELECT id FROM products WHERE slug = 'nissan-skyline-gt-r-r34'),     '/uploads/images/1782096547954-4b9c05787e48fc92.webp', 0, true),
  ((SELECT id FROM products WHERE slug = 'honda-civic-type-r-fk8'),      '/uploads/images/1782096558509-e230da0d02d104b4.webp', 0, true),
  ((SELECT id FROM products WHERE slug = 'lamborghini-aventador-svj'),   '/uploads/images/1782096646143-4dab02ecfad14e16.webp', 0, true),
  ((SELECT id FROM products WHERE slug = 'mazda-rx-7-fd3s'),             '/uploads/images/1782105868148-d0c16c384b69c95a.webp', 0, true),
  ((SELECT id FROM products WHERE slug = 'toyota-ae86-trueno'),          '/uploads/images/no-image.webp', 0, true),
  ((SELECT id FROM products WHERE slug = 'subaru-impreza-wrx-sti-rally'),'/uploads/images/no-image.webp', 0, true),
  ((SELECT id FROM products WHERE slug = 'bmw-m3-e30'),                  '/uploads/images/no-image.webp', 0, true);

-- Initial stock (trigger recalculates products.stock from this ledger)
INSERT INTO stock_movements (product_id, movement_type, quantity, note) VALUES
  ((SELECT id FROM products WHERE slug = 'porsche-911-gt3-rs'),           'in', 5,  'Initial stock'),
  ((SELECT id FROM products WHERE slug = 'nissan-skyline-gt-r-r34'),      'in', 0,  'Initial stock'),
  ((SELECT id FROM products WHERE slug = 'honda-civic-type-r-fk8'),       'in', 12, 'Initial stock'),
  ((SELECT id FROM products WHERE slug = 'lamborghini-aventador-svj'),    'in', 3,  'Initial stock'),
  ((SELECT id FROM products WHERE slug = 'mazda-rx-7-fd3s'),              'in', 8,  'Initial stock'),
  ((SELECT id FROM products WHERE slug = 'toyota-ae86-trueno'),           'in', 6,  'Initial stock'),
  ((SELECT id FROM products WHERE slug = 'subaru-impreza-wrx-sti-rally'), 'in', 10, 'Initial stock'),
  ((SELECT id FROM products WHERE slug = 'bmw-m3-e30'),                   'in', 4,  'Initial stock');

-- Site settings (single row)
INSERT INTO site_settings (site_name, whatsapp_number, seo_title, seo_description, contact_email, address, bank_info, social_links) VALUES
  ('W//KEN', '6281234567890',
   'W//KEN — Diecast Collector Store',
   'Toko diecast skala kecil pilihan untuk kolektor Indonesia.',
   'halo@wken.store',
   'Jakarta, Indonesia',
   'Transfer BCA 1234567890 a.n. W//KEN Store. Sertakan nomor order pada berita transfer.',
   '{"instagram": "https://instagram.com/wken.store"}'::jsonb);

-- Page sections (hero read by homepage; about/contact by their pages)
INSERT INTO page_sections (section_key, title, subtitle, content) VALUES
  ('hero',
   'Diecast kurasi untuk kolektor yang teliti',
   'Skala 1:64 dan 1:43, kondisi jelas, foto aktual, dan stok siap dikirim.',
   NULL),
  ('about',
   'Tentang W//KEN',
   'Diecast pilihan untuk kolektor Indonesia.',
   'W//KEN adalah toko diecast yang fokus pada kurasi model skala kecil dengan kondisi yang jelas dan riwayat stok yang rapi. Setiap item difoto aktual sehingga kamu tahu persis apa yang kamu beli. Kami melayani kolektor di seluruh Indonesia dengan pengiriman cepat dan konfirmasi yang transparan.'),
  ('contact',
   'Hubungi Kami',
   'Ada pertanyaan soal produk atau pesanan? Kami siap membantu.',
   'Balasan tercepat melalui WhatsApp pada jam kerja (09.00–17.00 WIB). Untuk pertanyaan pesanan, sertakan nomor order kamu.');

-- =============================================================
-- Admin account (no email needed — avoids free-tier email limits)
-- =============================================================
-- 1) Supabase Dashboard -> Authentication -> Users -> "Add user":
--    email admin@wken.store, set a password, and CHECK "Auto Confirm User".
--    (The handle_new_user trigger creates its profile row automatically.)
-- 2) Then promote that account to admin:
--
--    UPDATE profiles SET role = 'admin' WHERE email = 'admin@wken.store';
