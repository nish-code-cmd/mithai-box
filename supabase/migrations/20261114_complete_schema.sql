-- ====================================================================
-- MITHAI BOX WALA (AJAY PACKERS, MIRZAPUR - EST. 1984)
-- COMPLETE SUPABASE PRODUCTION DATABASE SCHEMA
-- Matches Master Plan Section 5: All 29 E-Commerce & Admin Tables
-- ====================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ====================================================================
-- 1. PROFILES (Extends Supabase auth.users)
-- ====================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  phone text,
  company text,
  gstin text,
  avatar_url text,
  is_active boolean default true,
  is_blocked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 2. USER ROLES (RBAC for Super Admin, Product, Order, Inventory Managers)
-- ====================================================================
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in (
    'superadmin',
    'product_manager',
    'order_manager',
    'inventory_manager',
    'customer_support',
    'marketing_manager'
  )),
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- Helper security definer functions to verify roles without recursive RLS
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_admin(_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('superadmin', 'product_manager', 'order_manager', 'inventory_manager')
  );
end;
$$ language plpgsql security definer;

-- ====================================================================
-- 3. ADDRESSES (Customer Shipping & Billing Addresses)
-- ====================================================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text default 'shipping' check (type in ('shipping', 'billing', 'both')),
  name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null,
  country text default 'India',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 4. CATEGORIES (Hierarchical Packaging Categories)
-- ====================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  icon text,
  is_active boolean default true,
  is_featured boolean default false,
  sort_order int default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 5. PRODUCTS (Sweet Boxes, Dry Fruit Boxes, Wedding Hampers)
-- ====================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sku text unique not null,
  category_id uuid references public.categories(id) on delete set null,
  short_description text,
  description text,
  base_price numeric(10,2) not null check (base_price >= 0),
  mrp numeric(10,2) check (mrp >= base_price or mrp is null),
  wholesale_price numeric(10,2),
  min_order_qty int default 1 check (min_order_qty > 0),
  unit text default 'piece',
  dimensions text,
  material text,
  color text,
  capacity text,
  images text[] default '{}',
  tags text[] default '{}',
  is_active boolean default true,
  is_featured boolean default false,
  is_new_arrival boolean default false,
  is_bestseller boolean default false,
  stock int default 0 check (stock >= 0),
  gst_percent numeric(5,2) default 12.00,
  hsn_code text default '48191010',
  weight_grams int,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure stock column exists if table was already created in earlier run
alter table public.products add column if not exists stock int default 0 check (stock >= 0);

-- ====================================================================
-- 6. PRODUCT IMAGES (Multi-image Gallery with Primary & Sort Order)
-- ====================================================================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  alt_text text,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- ====================================================================
-- 7. PRODUCT VARIANTS (Size, Capacity: 250g, 500g, 1kg, Finishes)
-- ====================================================================
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  title text not null,
  sku text unique,
  capacity text,
  color text,
  price_adjustment numeric(10,2) default 0.00,
  stock int default 0 check (stock >= 0),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ====================================================================
-- 8. INVENTORY (Warehouse Stock Tracking)
-- ====================================================================
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null unique,
  quantity_on_hand int not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved int not null default 0 check (quantity_reserved >= 0),
  low_stock_threshold int not null default 20 check (low_stock_threshold >= 0),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 9. INVENTORY MOVEMENTS (Stock In, Stock Out, Audit Log for Inventory)
-- ====================================================================
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  change_qty int not null,
  movement_type text not null check (movement_type in (
    'restock',
    'order_reservation',
    'order_dispatch',
    'adjustment',
    'cancellation_restock',
    'damaged'
  )),
  reference_id text,
  notes text,
  created_at timestamptz default now()
);

-- ====================================================================
-- 10. CARTS (Persistent Customer & Guest Carts)
-- ====================================================================
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade unique,
  session_id text,
  coupon_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 11. CART ITEMS
-- ====================================================================
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(cart_id, product_id, variant_id)
);

-- ====================================================================
-- 12. WISHLISTS
-- ====================================================================
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  created_at timestamptz default now()
);

-- ====================================================================
-- 13. WISHLIST ITEMS
-- ====================================================================
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid references public.wishlists(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(wishlist_id, product_id)
);

-- ====================================================================
-- 14. COUPONS & DISCOUNTS
-- ====================================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  type text default 'percent' check (type in ('percent', 'flat')),
  value numeric(10,2) not null check (value > 0),
  min_order_amount numeric(10,2) default 0,
  max_discount numeric(10,2),
  max_uses int,
  used_count int default 0,
  is_active boolean default true,
  starts_at timestamptz default now(),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ====================================================================
-- 15. ORDERS (100% Advance Payment via Razorpay, Full GST Invoicing)
-- ====================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  status text default 'pending' check (status in (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  )),
  payment_status text default 'pending' check (payment_status in (
    'pending',
    'paid',
    'failed',
    'refunded'
  )),
  payment_method text default 'razorpay' check (payment_method in (
    'razorpay',
    'bank_transfer',
    'cheque'
  )),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount_amount numeric(10,2) default 0.00 check (discount_amount >= 0),
  gst_amount numeric(10,2) default 0.00 check (gst_amount >= 0),
  shipping_amount numeric(10,2) default 0.00 check (shipping_amount >= 0),
  grand_total numeric(10,2) not null check (grand_total >= 0),
  coupon_code text,
  shipping_address jsonb not null,
  billing_address jsonb,
  customer_notes text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 16. ORDER ITEMS
-- ====================================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_sku text,
  product_image text,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  gst_rate numeric(5,2) default 12.00,
  total_price numeric(10,2) not null check (total_price >= 0)
);

-- ====================================================================
-- 17. PAYMENTS (Razorpay Orders, Payments, Signatures)
-- ====================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  gateway text default 'razorpay',
  gateway_order_id text,
  gateway_payment_id text,
  gateway_signature text,
  amount numeric(10,2) not null check (amount >= 0),
  currency text default 'INR',
  status text default 'pending' check (status in (
    'pending',
    'authorized',
    'captured',
    'failed',
    'refunded'
  )),
  error_code text,
  error_description text,
  raw_response jsonb,
  created_at timestamptz default now()
);

-- ====================================================================
-- 18. REFUNDS
-- ====================================================================
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  payment_id uuid references public.payments(id) on delete set null,
  gateway_refund_id text,
  amount numeric(10,2) not null check (amount > 0),
  reason text not null,
  status text default 'pending' check (status in ('pending', 'processed', 'failed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ====================================================================
-- 19. SHIPMENTS (Courier, Delhivery/BlueDart Tracking, Dispatch)
-- ====================================================================
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  courier_name text,
  tracking_number text,
  tracking_url text,
  status text default 'manifested' check (status in (
    'manifested',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'rto',
    'returned'
  )),
  dispatched_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 20. WHOLESALE ENQUIRIES (B2B Halwai & Corporate Bulk Quotes)
-- ====================================================================
create table if not exists public.wholesale_enquiries (
  id uuid primary key default gen_random_uuid(),
  enquiry_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  company_name text,
  gstin text,
  city text,
  box_types text[] default '{}',
  estimated_quantity text,
  custom_printing boolean default false,
  message text,
  status text default 'new' check (status in (
    'new',
    'under_review',
    'quoted',
    'in_negotiation',
    'won',
    'lost'
  )),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================================
-- 21. QUOTATIONS (Formal B2B Pricing Proposals)
-- ====================================================================
create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references public.wholesale_enquiries(id) on delete cascade,
  quote_number text unique not null,
  total_amount numeric(10,2) not null,
  gst_amount numeric(10,2) default 0,
  valid_until timestamptz not null,
  terms text,
  file_url text,
  status text default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ====================================================================
-- 22. REVIEWS (Verified Buyer Sweet Box Ratings & Feedback)
-- ====================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  is_verified_buyer boolean default false,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- ====================================================================
-- 23. NOTIFICATIONS (Order Updates, Quotation Alerts, Account Notices)
-- ====================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'order' check (type in ('order', 'payment', 'wholesale', 'system', 'promo')),
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ====================================================================
-- 24. NEWSLETTER SUBSCRIPTIONS
-- ====================================================================
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  is_active boolean default true,
  source text default 'footer',
  subscribed_at timestamptz default now()
);

-- ====================================================================
-- 25. HOMEPAGE SECTIONS (Customizable CMS Sections)
-- ====================================================================
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  title text not null,
  subtitle text,
  content jsonb default '{}',
  is_active boolean default true,
  sort_order int default 0,
  updated_at timestamptz default now()
);

-- ====================================================================
-- 26. BANNERS (Hero, Announcement, Festive Festival Campaigns)
-- ====================================================================
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  link_url text,
  button_text text,
  position text default 'hero' check (position in (
    'announcement',
    'hero',
    'mid_page',
    'festival_special',
    'wholesale'
  )),
  is_active boolean default true,
  sort_order int default 0,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- ====================================================================
-- 27. SITE SETTINGS (Brand, GSTIN, Shipping Thresholds, Contacts)
-- ====================================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz default now()
);

-- ====================================================================
-- 28. AUDIT LOGS (Security Log for All Administrative Operations)
-- ====================================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  ip_address text,
  changes jsonb,
  created_at timestamptz default now()
);

-- ====================================================================
-- 29. WEBHOOK EVENTS (Idempotent Razorpay Webhook Processing)
-- ====================================================================
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay',
  event_id text unique not null,
  event_type text not null,
  payload jsonb not null,
  status text default 'pending' check (status in ('pending', 'processed', 'failed', 'ignored')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_number on public.orders(order_number);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);
create index if not exists idx_inventory_product on public.inventory(product_id);
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- ====================================================================
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ====================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach triggers
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists trg_addresses_updated on public.addresses;
create trigger trg_addresses_updated before update on public.addresses for each row execute function public.set_updated_at();

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products for each row execute function public.set_updated_at();

drop trigger if exists trg_carts_updated on public.carts;
create trigger trg_carts_updated before update on public.carts for each row execute function public.set_updated_at();

drop trigger if exists trg_cart_items_updated on public.cart_items;
create trigger trg_cart_items_updated before update on public.cart_items for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders for each row execute function public.set_updated_at();

drop trigger if exists trg_shipments_updated on public.shipments;
create trigger trg_shipments_updated before update on public.shipments for each row execute function public.set_updated_at();

drop trigger if exists trg_wholesale_updated on public.wholesale_enquiries;
create trigger trg_wholesale_updated before update on public.wholesale_enquiries for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings for each row execute function public.set_updated_at();

-- ====================================================================
-- TRIGGER: AUTO CREATE PROFILE ON USER SIGNUP
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(nullif(excluded.name, ''), public.profiles.name),
    phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone);

  -- Create empty cart for new user
  insert into public.carts (user_id) values (new.id) on conflict do nothing;

  -- Create empty wishlist for new user
  insert into public.wishlists (user_id) values (new.id) on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.shipments enable row level security;
alter table public.wholesale_enquiries enable row level security;
alter table public.quotations enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.banners enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.webhook_events enable row level security;

-- Public Storefront Reads
drop policy if exists "Categories public read" on public.categories;
create policy "Categories public read" on public.categories for select using (is_active = true or public.is_admin(auth.uid()));

drop policy if exists "Products public read" on public.products;
create policy "Products public read" on public.products for select using (is_active = true or public.is_admin(auth.uid()));

drop policy if exists "Product images public read" on public.product_images;
create policy "Product images public read" on public.product_images for select using (true);

drop policy if exists "Product variants public read" on public.product_variants;
create policy "Product variants public read" on public.product_variants for select using (is_active = true or public.is_admin(auth.uid()));

drop policy if exists "Homepage sections public read" on public.homepage_sections;
create policy "Homepage sections public read" on public.homepage_sections for select using (is_active = true or public.is_admin(auth.uid()));

drop policy if exists "Banners public read" on public.banners;
create policy "Banners public read" on public.banners for select using (is_active = true or public.is_admin(auth.uid()));

drop policy if exists "Site settings public read" on public.site_settings;
create policy "Site settings public read" on public.site_settings for select using (true);

drop policy if exists "Approved reviews public read" on public.reviews;
create policy "Approved reviews public read" on public.reviews for select using (is_approved = true or user_id = auth.uid() or public.is_admin(auth.uid()));

-- Customer Own-Data Access
drop policy if exists "Users read/update own profile" on public.profiles;
create policy "Users read/update own profile" on public.profiles for all using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users manage own cart" on public.carts;
create policy "Users manage own cart" on public.carts for all using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users manage own cart items" on public.cart_items;
create policy "Users manage own cart items" on public.cart_items for all using (
  exists (select 1 from public.carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()) or public.is_admin(auth.uid())
);

drop policy if exists "Users manage own wishlist" on public.wishlists;
create policy "Users manage own wishlist" on public.wishlists for all using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users manage own wishlist items" on public.wishlist_items;
create policy "Users manage own wishlist items" on public.wishlist_items for all using (
  exists (select 1 from public.wishlists where wishlists.id = wishlist_items.wishlist_id and wishlists.user_id = auth.uid()) or public.is_admin(auth.uid())
);

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or public.is_admin(auth.uid())))
);

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications" on public.notifications for all using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Wholesale Enquiry: anyone can insert, only owner or admin can read
drop policy if exists "Anyone can submit wholesale enquiry" on public.wholesale_enquiries;
create policy "Anyone can submit wholesale enquiry" on public.wholesale_enquiries for insert with check (true);

drop policy if exists "Users read own enquiries" on public.wholesale_enquiries;
create policy "Users read own enquiries" on public.wholesale_enquiries for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Newsletter: anyone can subscribe
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscriptions;
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscriptions for insert with check (true);

-- Admin Full Access Policies
drop policy if exists "Admin full manage products" on public.products;
create policy "Admin full manage products" on public.products for all using (public.is_admin(auth.uid()));

drop policy if exists "Admin full manage categories" on public.categories;
create policy "Admin full manage categories" on public.categories for all using (public.is_admin(auth.uid()));

drop policy if exists "Admin full manage inventory" on public.inventory;
create policy "Admin full manage inventory" on public.inventory for all using (public.is_admin(auth.uid()));

drop policy if exists "Admin full manage orders" on public.orders;
create policy "Admin full manage orders" on public.orders for all using (public.is_admin(auth.uid()));

drop policy if exists "Admin full manage settings" on public.site_settings;
create policy "Admin full manage settings" on public.site_settings for all using (public.is_admin(auth.uid()));

-- Note: Supabase Service Role Key bypasses RLS automatically on server API routes!

-- ====================================================================
-- INITIAL PRODUCTION SEEDING (OFFICIAL BRAND DATA & REAL CATALOG)
-- ====================================================================

-- Official Site Settings
insert into public.site_settings (key, value, description) values
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
  }', 'Verified official manufacturer details'),
  ('branding_assets', '{
    "main_logo": "/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png",
    "visual_reference": "/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png"
  }', 'Official brand image assets in public directory'),
  ('commerce_config', '{
    "free_shipping_threshold": 15000,
    "standard_shipping_charge": 149,
    "gst_default_percent": 12,
    "currency": "INR",
    "payment_gateway": "Razorpay",
    "advance_payment_required": true
  }', 'E-commerce and tax calculation rules'),
  ('announcement_bar', '{
    "text": "Festive & Wedding packaging bulk orders welcome • Direct factory pricing from Ajay Packers, Mirzapur • Free shipping above ₹15,000",
    "is_active": true
  }', 'Top announcement banner text')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Official Categories
insert into public.categories (name, slug, description, image_url, sort_order, is_featured) values
  ('Traditional Mithai Boxes', 'traditional-mithai-boxes', 'Classic sweet packaging boxes for Indian halwais, festivals, and celebrations.', '/images/editorial/gift-boxes-table.jpg', 1, true),
  ('Dry Fruit & Royal Hampers', 'dry-fruit-boxes', 'Rigid kappa board luxury boxes for dry fruits, cashew dates, and Diwali gifting.', '/images/editorial/gift-box-blue.jpg', 2, true),
  ('Wedding & Festive Packaging', 'wedding-packaging', 'Gold foil stamped, velvet touch, and royal red packaging for shagun and weddings.', '/images/editorial/gift-box-ribbon.jpg', 3, true),
  ('Cake & Confectionery Boxes', 'cake-bakery-boxes', 'Food-grade window pastry and designer cake packaging with grease-resistant barrier.', '/images/editorial/gift-boxes-table.jpg', 4, false),
  ('Artisan Chocolate Boxes', 'chocolate-boxes', 'Custom cavity luxury chocolate gift packaging with magnetic flap closures.', '/images/editorial/gift-box-blue.jpg', 5, false),
  ('Corporate Gifting & Custom Logo', 'corporate-gifting', 'Customized corporate packaging with brand embossing and bulk wholesale tiers.', '/images/editorial/gift-box-ribbon.jpg', 6, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Homepage CMS Sections
insert into public.homepage_sections (section_key, title, subtitle, content, sort_order) values
  ('hero', 'Every Sweet Deserves a Beautiful Beginning.', '40 Years of Packaging Excellence • Est. 1984', '{
    "cta_primary_text": "Explore Collections",
    "cta_primary_url": "/products",
    "cta_secondary_text": "Request Bulk Quote",
    "cta_secondary_url": "/wholesale",
    "badge": "40 Years of Packaging Heritage",
    "stats": [
      {"label": "Years Experience", "value": "40+"},
      {"label": "Direct Factory Rate", "value": "100%"},
      {"label": "Sweet Boxes Crafted", "value": "10M+"},
      {"label": "Pan-India Dispatch", "value": "All Pincodes"}
    ]
  }', 1),
  ('craft_legacy', 'Craftsmanship Rooted in Mirzapur Since 1984', 'Ajay Packers Heritage', '{
    "description": "For four decades, Ajay Packers in Mirzapur has supplied India''s finest sweet houses with rigid, food-grade, foil-stamped mithai boxes that honor tradition while delivering modern luxury.",
    "highlights": [
      "Heavyweight food-safe Kappa Board",
      "Metallic hot-foil embossing & UV varnish",
      "Factory direct pricing with pan-India transport"
    ]
  }', 2)
on conflict (section_key) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  content = excluded.content,
  updated_at = now();

-- Sample Initial Products (Real Specifications)
with cat as (select id, slug from public.categories)
insert into public.products (
  name, slug, sku, category_id, short_description, description,
  base_price, mrp, wholesale_price, min_order_qty, unit, dimensions, material, color, capacity,
  images, is_featured, is_bestseller, stock
) values
  (
    'Royal Burgundy Gold Foil Mithai Box (500g)',
    'royal-burgundy-gold-foil-mithai-box-500g',
    'MBW-RBG-500',
    (select id from cat where slug = 'traditional-mithai-boxes'),
    'Rigid luxury sweet box with intricate gold foil lattice artwork and grease-proof food lining.',
    'Engineered for premium halwais and festive gifting. Constructed from high-density rigid kappa board with gold hot-foil stamping. Includes separate food-grade inner separator cavities.',
    125.00, 160.00, 95.00, 50, 'piece', '7.5 x 7.5 x 2.25 inches', 'Kappa Board (1200 GSM)', 'Burgundy / Gold', '500g Sweets',
    array['/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png', '/images/editorial/gift-boxes-table.jpg'],
    true, true, 2500
  ),
  (
    'Imperial 4-Partition Dry Fruit & Sweet Hamper Box',
    'imperial-4-partition-dry-fruit-sweet-hamper-box',
    'MBW-DFH-1000',
    (select id from cat where slug = 'dry-fruit-boxes'),
    '4-compartment velvet touch luxury rigid box for assorted dry fruits and gourmet sweets.',
    'Features four deep acrylic/card cavities for kaju, badam, kishmish, and pista. Magnetic closure flap with antique gold metal corner trims.',
    280.00, 360.00, 220.00, 25, 'piece', '10 x 10 x 2.5 inches', 'Rigid Board with Velvet Lamination', 'Royal Navy / Antique Gold', '1 kg (4 x 250g)',
    array['/images/editorial/gift-box-blue.jpg', '/images/editorial/gift-box-ribbon.jpg'],
    true, true, 1200
  ),
  (
    'Royal Shagun Wedding Sweet Box (1kg)',
    'royal-shagun-wedding-sweet-box-1kg',
    'MBW-WSB-1000',
    (select id from cat where slug = 'wedding-packaging'),
    'Grand wedding invitation sweet box with personalized couple monogram gold foiling.',
    'Designed specifically for wedding shagun, baraat sweets, and luxury invitations. Accommodates two tiers of traditional peda, barfi, and motichoor ladoo.',
    210.00, 280.00, 165.00, 100, 'piece', '9 x 9 x 3 inches', 'Rigid Kappa Board (1400 GSM)', 'Deep Wine / Gold Foil', '1kg Sweets',
    array['/images/editorial/gift-box-ribbon.jpg', '/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png'],
    true, false, 800
  )
on conflict (slug) do nothing;

-- Populate inventory matching the initial products
insert into public.inventory (product_id, quantity_on_hand, quantity_reserved, low_stock_threshold)
select id, stock, 0, 50 from public.products
on conflict (product_id) do update set quantity_on_hand = excluded.quantity_on_hand;
