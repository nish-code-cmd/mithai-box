/**
 * Supabase Storage + RLS Setup Script
 * Run once: pnpm db:storage
 * Creates storage buckets and Row Level Security policies
 */
import { Client } from 'pg';

const connectionString = process.env.DIRECT_URL ||
  'postgresql://postgres.sbcjklefqqlhodqragum:GjRX%23gN5en84xDh@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL');

  try {
    // ---- RLS POLICIES ----
    console.log('\n📋 Setting up Row Level Security...');

    const rlsSQL = `
      -- Enable RLS on all tables
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.wholesale_enquiries ENABLE ROW LEVEL SECURITY;

      -- ==========================================
      -- PROFILES — users can only see/edit their own
      -- ==========================================
      DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
      CREATE POLICY "Users can view own profile"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      CREATE POLICY "Users can update own profile"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
      CREATE POLICY "Admins can view all profiles"
        ON public.profiles FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- PRODUCTS — public read, admin write
      -- ==========================================
      DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
      CREATE POLICY "Anyone can view active products"
        ON public.products FOR SELECT
        USING (is_active = true);

      DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
      CREATE POLICY "Admins can manage products"
        ON public.products FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- CATEGORIES — public read, admin write
      -- ==========================================
      DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
      CREATE POLICY "Anyone can view active categories"
        ON public.categories FOR SELECT
        USING (is_active = true);

      DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
      CREATE POLICY "Admins can manage categories"
        ON public.categories FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- CART — users own their cart
      -- ==========================================
      DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_items;
      CREATE POLICY "Users can manage own cart"
        ON public.cart_items FOR ALL
        USING (auth.uid() = user_id);

      -- ==========================================
      -- ORDERS — users see own orders, admins see all
      -- ==========================================
      DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
      CREATE POLICY "Users can view own orders"
        ON public.orders FOR SELECT
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
      CREATE POLICY "Users can create orders"
        ON public.orders FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
      CREATE POLICY "Admins can manage all orders"
        ON public.orders FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- ORDER ITEMS — same as orders
      -- ==========================================
      DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
      CREATE POLICY "Users can view own order items"
        ON public.order_items FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND o.user_id = auth.uid()
          )
        );

      DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
      CREATE POLICY "Admins can manage order items"
        ON public.order_items FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- ADDRESSES — users own their addresses
      -- ==========================================
      DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
      CREATE POLICY "Users can manage own addresses"
        ON public.addresses FOR ALL
        USING (auth.uid() = user_id);

      -- ==========================================
      -- COUPONS — public read (code only), admin full
      -- ==========================================
      DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
      CREATE POLICY "Anyone can view active coupons"
        ON public.coupons FOR SELECT
        USING (is_active = true);

      DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
      CREATE POLICY "Admins can manage coupons"
        ON public.coupons FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- SETTINGS — public read (non-secret), admin write
      -- ==========================================
      DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
      CREATE POLICY "Anyone can read settings"
        ON public.settings FOR SELECT
        TO authenticated
        USING (true);

      DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
      CREATE POLICY "Admins can manage settings"
        ON public.settings FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- WHOLESALE ENQUIRIES — anyone can submit, admin reads
      -- ==========================================
      DROP POLICY IF EXISTS "Anyone can submit enquiry" ON public.wholesale_enquiries;
      CREATE POLICY "Anyone can submit enquiry"
        ON public.wholesale_enquiries FOR INSERT
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.wholesale_enquiries;
      CREATE POLICY "Admins can manage enquiries"
        ON public.wholesale_enquiries FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role IN ('admin', 'superadmin')
          )
        );

      -- ==========================================
      -- AUTO-CREATE PROFILE ON USER SIGNUP TRIGGER
      -- ==========================================
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, role, is_active, created_at, updated_at)
        VALUES (NEW.id, 'customer', true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    await client.query(rlsSQL);
    console.log('✅ RLS policies applied');

    // ---- AUTO-UPDATE updated_at TRIGGER ----
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION public.update_updated_at()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DO $$
      DECLARE
        t text;
      BEGIN
        FOREACH t IN ARRAY ARRAY['profiles', 'products', 'orders', 'cart_items']
        LOOP
          EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
            CREATE TRIGGER set_updated_at
              BEFORE UPDATE ON public.%I
              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
          ', t, t);
        END LOOP;
      END $$;
    `;

    await client.query(triggerSQL);
    console.log('✅ Auto-update triggers applied');

    // ---- GRANT SUPERADMIN to business email ----
    const superadminSQL = `
      -- This runs after they sign up via Supabase Auth
      -- Will be a no-op until they sign up
      UPDATE public.profiles
      SET role = 'superadmin'
      WHERE id IN (
        SELECT id FROM auth.users
        WHERE email = 'mithaiboxwala@gmail.com'
      );
    `;

    await client.query(superadminSQL);
    console.log('✅ Superadmin role applied (if user exists)');

    console.log('\n🎉 Database security setup complete!');
    console.log('\nStorage buckets must be created via Supabase Dashboard:');
    console.log('  → Storage → New bucket → "product-images" (public)');
    console.log('  → Storage → New bucket → "category-images" (public)');

  } catch (err) {
    console.error('❌ Setup error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
