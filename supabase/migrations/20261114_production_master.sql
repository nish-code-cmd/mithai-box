-- ============================================================
-- MITHAI BOX WALA (AJAY PACKERS, MIRZAPUR - EST. 1984)
-- SUPABASE DATABASE SETUP (COMPLETE & PRODUCTION READY)
-- PostgreSQL + Authentication + RLS + Admin Security
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (Extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    phone TEXT,
    company TEXT,
    gstin TEXT,
    role TEXT NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'admin', 'superadmin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure email column exists if profiles was already created
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS gstin TEXT;

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    mrp NUMERIC(10,2),
    wholesale_price NUMERIC(10,2),
    min_order_qty INTEGER NOT NULL DEFAULT 1 CHECK (min_order_qty > 0),
    unit TEXT DEFAULT 'piece',
    sku TEXT UNIQUE,
    images TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
    stock INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 15,
    gst_percent NUMERIC(5,2) DEFAULT 12,
    hsn_code TEXT,
    weight_grams INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist on products even if created earlier
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0);
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 15;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS gst_percent NUMERIC(5,2) DEFAULT 12;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS hsn_code TEXT;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS weight_grams INTEGER;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE;

-- ============================================================
-- 4. ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'confirmed', 'processing',
            'shipped', 'delivered', 'cancelled', 'refunded'
        )),
    payment_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN (
            'pending', 'paid', 'failed', 'refunded'
        )),
    payment_method TEXT DEFAULT 'razorpay',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    gst_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    shipping_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(10,2) NOT NULL CHECK (grand_total >= 0),
    coupon_code TEXT,
    shipping_address JSONB,
    customer_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- 7. CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ============================================================
-- 8. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'percent'
        CHECK (type IN ('percent', 'flat')),
    value NUMERIC(10,2) NOT NULL CHECK (value > 0),
    min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount NUMERIC(10,2),
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. WHOLESALE ENQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wholesale_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'quoted', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 12. PREVENT CUSTOMERS FROM CHANGING THEIR OWN ROLE
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NOT NULL
       AND auth.uid() = OLD.id
       AND NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'You cannot change your own role';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change();

-- ============================================================
-- 13. AUTOMATIC PROFILE CREATION ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(NULLIF(EXCLUDED.name, ''), public.profiles.name),
        phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 14. ADMIN AUTHORIZATION FUNCTION (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role IN ('admin', 'superadmin')
          AND is_active = TRUE
    );
$$;

-- ============================================================
-- 15. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. PROFILES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "View own profile" ON public.profiles;
CREATE POLICY "View own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()) OR public.is_admin())
WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage profiles" ON public.profiles;
CREATE POLICY "Admin manage profiles"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 17. CATEGORY POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Public view categories" ON public.categories;
CREATE POLICY "Public view categories"
ON public.categories FOR SELECT
TO anon, authenticated
USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 18. PRODUCT POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Public view products" ON public.products;
CREATE POLICY "Public view products"
ON public.products FOR SELECT
TO anon, authenticated
USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Admin manage products"
ON public.products FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 19. ADDRESS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Customers manage own addresses" ON public.addresses;
CREATE POLICY "Customers manage own addresses"
ON public.addresses FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin())
WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_admin());

-- ============================================================
-- 20. ORDER POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;
CREATE POLICY "Customers view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders"
ON public.orders FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 21. ORDER ITEM POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Customers view own order items" ON public.order_items;
CREATE POLICY "Customers view own order items"
ON public.order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.orders
        WHERE orders.id = order_items.order_id
          AND orders.user_id = (SELECT auth.uid())
    )
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Admin manage order items" ON public.order_items;
CREATE POLICY "Admin manage order items"
ON public.order_items FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 22. CART POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Customers manage own cart" ON public.cart_items;
CREATE POLICY "Customers manage own cart"
ON public.cart_items FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================
-- 23. COUPON POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Admin manage coupons" ON public.coupons;
CREATE POLICY "Admin manage coupons"
ON public.coupons FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 24. WHOLESALE ENQUIRY POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Public submit enquiries" ON public.wholesale_enquiries;
CREATE POLICY "Public submit enquiries"
ON public.wholesale_enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "Admin manage enquiries" ON public.wholesale_enquiries;
CREATE POLICY "Admin manage enquiries"
ON public.wholesale_enquiries FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 25. SETTINGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings"
ON public.settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Admin manage settings" ON public.settings;
CREATE POLICY "Admin manage settings"
ON public.settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 26. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================
-- 27. DEFAULT PRODUCT CATEGORIES
-- ============================================================
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Traditional Mithai Boxes', 'traditional-mithai-boxes', 'Classic sweet packaging boxes for halwais and festivals', 1),
('Dry Fruit & Hampers', 'dry-fruit-boxes', 'Rigid and luxury boxes for cashews, almonds, and dry fruits', 2),
('Wedding & Festive Packaging', 'wedding-packaging', 'Premium packaging for weddings and celebrations', 3),
('Cake & Bakery Boxes', 'cake-bakery-boxes', 'Packaging boxes for cakes, pastries, and treats', 4),
('Chocolate Packaging', 'chocolate-boxes', 'Partitioned packaging for handcrafted chocolates', 5),
('Corporate Gifting', 'corporate-gifting', 'Custom-branded packaging for corporate gifting', 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 28. INITIAL VERIFIED PRODUCTS & BRAND SETTINGS
-- ============================================================
INSERT INTO public.settings (key, value) VALUES
('business_info', '{
  "brand": "Mithai Box Wala",
  "legal_entity": "Ajay Packers",
  "experience_years": 40,
  "established_year": 1984,
  "gstin": "09AMJPK3071C3Z6",
  "email": "mithaiboxwala@gmail.com",
  "address": "Mirzapur, Uttar Pradesh - 231001, India",
  "representatives": ["Ajay Kumar", "Sanjay Kumar"],
  "tagline": "The Perfection of Your Sweets, Paired with Our Ultimate Packaging."
}'),
('branding_assets', '{
  "main_logo": "/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png",
  "visual_reference": "/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png"
}'),
('commerce_rules', '{
  "free_shipping_threshold": 15000,
  "standard_shipping_charge": 149,
  "gst_percent": 12
}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

WITH cat AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (
  name, slug, sku, category_id, description,
  base_price, mrp, wholesale_price, min_order_qty, unit,
  images, tags, is_featured, stock, low_stock_threshold, gst_percent
) VALUES
(
  'Royal Burgundy Gold Foil Mithai Box (500g)',
  'royal-burgundy-gold-foil-mithai-box-500g',
  'MBW-RBG-500',
  (SELECT id FROM cat WHERE slug = 'traditional-mithai-boxes'),
  'Rigid luxury sweet box with intricate gold foil lattice artwork and grease-proof food lining. 40 years packaging heritage.',
  125.00, 160.00, 95.00, 50, 'piece',
  ARRAY['/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png', '/images/editorial/gift-boxes-table.jpg'],
  ARRAY['mithai', 'festive', 'gold-foil', '500g'],
  TRUE, 2500, 50, 12.00
),
(
  'Imperial 4-Partition Dry Fruit & Sweet Hamper Box',
  'imperial-4-partition-dry-fruit-sweet-hamper-box',
  'MBW-DFH-1000',
  (SELECT id FROM cat WHERE slug = 'dry-fruit-boxes'),
  '4-compartment velvet touch luxury rigid box for assorted dry fruits and gourmet sweets with magnetic closure.',
  280.00, 360.00, 220.00, 25, 'piece',
  ARRAY['/images/editorial/gift-box-blue.jpg', '/images/editorial/gift-box-ribbon.jpg'],
  ARRAY['dry-fruit', 'hamper', 'luxury', '1kg'],
  TRUE, 1200, 30, 12.00
),
(
  'Royal Shagun Wedding Sweet Box (1kg)',
  'royal-shagun-wedding-sweet-box-1kg',
  'MBW-WSB-1000',
  (SELECT id FROM cat WHERE slug = 'wedding-packaging'),
  'Grand wedding invitation sweet box with personalized couple monogram gold foiling and double tier support.',
  210.00, 280.00, 165.00, 100, 'piece',
  ARRAY['/images/editorial/gift-box-ribbon.jpg', '/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png'],
  ARRAY['wedding', 'shagun', 'invitation', 'luxury'],
  TRUE, 800, 40, 12.00
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  images = EXCLUDED.images,
  stock = EXCLUDED.stock;

-- ============================================================
-- DATABASE SETUP COMPLETE
-- ============================================================
