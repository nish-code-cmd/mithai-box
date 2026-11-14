# Mithai Box Wala — Premium Packaging & E-Commerce Platform

<div align="center">

<img src="./public/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png" alt="Mithai Box Wala Logo" width="120" style="border-radius: 24px; box-shadow: 0 8px 32px rgba(104,28,45,0.3);" />

### *"Every Sweet Deserves a Beautiful Beginning."*
**"The Perfection of Your Sweets, Paired with Our Ultimate Packaging."**

[![CI Status](https://github.com/nish-code-cmd/mithai-box/actions/workflows/ci.yml/badge.svg)](https://github.com/nish-code-cmd/mithai-box/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-681C2D?style=flat)](#)

A full-stack, enterprise-grade e-commerce storefront, wholesale quotation CRM, and Super Administrator system engineered for **Mithai Box Wala** — backed by **Ajay Packers** with 40 years of packaging manufacturing heritage in Mirzapur, Uttar Pradesh.

[Official Reference Website](https://www.mithaiboxes.com/) · [Explore Catalog](http://localhost:3000/products) · [Admin Portal](http://localhost:3000/admin/login)

---

</div>

## 🏛️ Manufacturing & Brand Identity

* **Consumer Brand:** Mithai Box Wala
* **Direct Manufacturer:** Ajay Packers (Est. 1984)
* **Manufacturing Facility:** Mirzapur, Uttar Pradesh – 231001, India
* **Representatives:** Ajay Kumar & Sanjay Kumar
* **GSTIN:** `09AMJPK3071C3Z6` (Registered Taxpayer)
* **Official Contact:** `mithaiboxwala@gmail.com`
* **Dispatch Terms:** Pan-India dispatch within 2 business days. Friday orders dispatch on Monday. 100% Advance Payment for customized orders.

---

## ✨ Platform Highlights

### 🎨 1. Luxury Indian Editorial Design System
* **Brand Color Palette:** Deep Burgundy (`#681C2D`), Dark Maroon (`#4A1420`), Muted Gold (`#B8955A`), Soft Gold (`#CBA96E`), Ivory (`#FAF7F0`), and Charcoal (`#24211F`).
* **Display Typography:** High-contrast serif headlines in *Cormorant Garamond* paired with clean sans-serif *Inter* for maximum legibility.
* **GPU-Accelerated Animations:** Zero layout-shift transitions, smooth 60fps cubic-bezier curves (`cubic-bezier(0.16, 1, 0.3, 1)`), glassmorphic headers with `backdrop-filter: blur(12px)`, and instant SSR-rendered hero section.

### 🔐 2. Customer Authentication & Profiles
* **Direct Password Authentication:** Fully integrated with Supabase Auth (`@supabase/ssr`).
* **Auto-Confirmed Registration:** Dedicated server-side registration pipeline (`/api/auth/register`) with automatic session creation.
* **Customer Dashboard (`/account`):** Live order tracking, dispatch LR lookup, address management, and persistent wishlist.
* **Security:** HttpOnly, SameSite cookies with SSL encryption and rate-limiting.

### 👑 3. Super Admin Dashboard (`/admin`)
* **Real-time Business KPIs:** Live revenue metrics, order status breakdown, active carts, and low-inventory alerts.
* **Product Management:** Full CRUD with image attachments, MOQ configuration, and tiered bulk pricing.
* **Category Engine:** Add/edit packaging collections with product count aggregation.
* **Inventory Control:** Real-time stock adjustments with mandatory reason logging and audit trail (`inventory_logs`).
* **B2B Wholesale CRM:** Pipeline for tracking quotes (`new` → `contacted` → `sample_sent` → `quoted` → `won` / `lost`).

### 🛒 4. Cart & Server-Authoritative Checkout
* **Slide-out Cart Drawer:** Instant updates powered by client-side Zustand store.
* **Dynamic Volume Tiering:** Server-verified discount calculations based on order volume.
* **Payment Gateway:** 100% advance payments with Razorpay and HMAC SHA-256 signature verification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16.4.3 (App Router, Server Components & Route Handlers) |
| **Language** | TypeScript 5.9 (Strict Type Checking) |
| **Styling** | Tailwind CSS 4 with custom CSS design tokens & keyframes |
| **Database** | Supabase PostgreSQL (11 Relational Tables with RLS & Triggers) |
| **Auth** | Supabase Auth + `@supabase/ssr` (Cookie-based Sessions) |
| **State** | Zustand (Cart & Storefront UI drawers) |
| **Payments** | Razorpay Node.js SDK & Webhook verification |
| **Testing** | Vitest 3+ for unit & validation suites |
| **CI / CD** | GitHub Actions (automated linting, tests & production builds) |

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

The platform runs on **11 relational PostgreSQL tables** managed with Supabase Row Level Security (RLS) policies:

```mermaid
erDiagram
    users ||--o{ profiles : "1:1 profile"
    profiles ||--o{ orders : places
    profiles ||--o{ addresses : owns
    profiles ||--o{ wishlists : saves
    categories ||--o{ products : categorizes
    products ||--o{ order_items : contains
    orders ||--o{ order_items : includes
    products ||--o{ cart_items : holds
    products ||--o{ inventory_logs : tracks
    profiles ||--o{ wholesale_enquiries : submits
```

| Table Name | Description |
| :--- | :--- |
| `public.profiles` | User identity, role (`customer`, `admin`, `superadmin`), phone, GSTIN |
| `public.categories` | Packaging categories with slugs and display ordering |
| `public.products` | Products, base pricing, MOQ, bulk pricing tiers & dimensions |
| `public.orders` | Placed orders, tracking LR numbers, status pipeline, total amounts |
| `public.order_items` | Individual line items per order |
| `public.cart_items` | Active shopping carts for recovery analysis |
| `public.inventory_logs` | Audit trail of all stock additions, deductions, and reasons |
| `public.coupons` | Percentage & fixed discount coupons with minimum thresholds |
| `public.addresses` | Customer shipping and billing address book |
| `public.wishlists` | Customer saved packaging favorites |
| `public.wholesale_enquiries` | B2B quotation leads, required box quantity & status pipeline |

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v20.x or higher
* **pnpm** v10.x (`npm install -g pnpm`)
* A **Supabase** project (or local Supabase CLI)

### 2. Environment Setup
Create a `.env.local` file in the project root:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
SUPABASE_SECRET_KEY=sb_secret_your_service_role_key_here

# PostgreSQL Direct Connections (for migrations and pooler)
DATABASE_URL=postgresql://postgres.your-id:password@pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.your-id:password@pooler.supabase.com:5432/postgres

# Super Admin Master Bootstrap Credentials
ADMIN_BOOTSTRAP_EMAIL=mithaiboxwala@gmail.com
ADMIN_BOOTSTRAP_PASSWORD=MithaiAdmin2024!

# Razorpay Payments (Test or Live)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourSecretKey
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Database Setup & Migrations
Run the production master SQL migration on your Supabase instance:
```bash
pnpm run db:setup
```

### 5. Start Development Server
```bash
pnpm dev
```
* Storefront: [http://localhost:3000](http://localhost:3000)
* Customer Auth: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
* Super Admin Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🔑 Default Super Admin Credentials

The platform includes a built-in Super Administrator account pre-configured in Supabase:

* **Portal URL:** `/admin/login`
* **Admin Email:** `mithaiboxwala@gmail.com`
* **Admin Password:** `MithaiAdmin2024!`

*(You can also use the one-click **"⚡ Auto-fill Super Admin credentials"** shortcut directly on the `/admin/login` page during development).*

---

## 🗺️ Route Directory

### 🛍️ Storefront
| Route | Description |
| :--- | :--- |
| `/` | Homepage with hero visual, categories, featured boxes & heritage section |
| `/products` | Filterable catalog with search, price sorting, and MOQ indicators |
| `/products/[slug]` | Product Detail Page (PDP) with tier pricing & dimensions |
| `/categories/[slug]` | Category-specific product showcase |
| `/cart` | Server-synced shopping cart page |
| `/checkout` | 2-step shipping address and Razorpay advance payment |
| `/checkout/success` | Order confirmation receipt & dispatch timeline |
| `/wholesale` | B2B bulk quote enquiry form (MOQ 500+) |
| `/custom-packaging` | Bespoke box foil-stamping and custom sizing request |
| `/corporate-gifting` | Festive hamper and corporate gifting curation |
| `/about` | 40-year manufacturing story of Ajay Packers, Mirzapur |
| `/contact` | Contact information, map reference, and direct email |

### 🔐 Authentication & Customer Portal
| Route | Description |
| :--- | :--- |
| `/auth/login` | Unified auth with instant tab switching (Sign In / Create Account) |
| `/auth/signup` | Clean redirect to unified registration |
| `/forgot-password` | Password reset email dispatch |
| `/auth/reset-password` | Secure new password entry via token |
| `/account` | Customer account overview |
| `/account/orders` | Order history & live tracking number lookup |
| `/account/addresses` | Shipping address book manager |
| `/account/wishlist` | Saved packaging wishlist |

### 👑 Super Admin Dashboard
| Route | Description |
| :--- | :--- |
| `/admin/login` | Secure administrator authentication |
| `/admin` | Metrics overview (Revenue, Orders, Low Stock Alerts) |
| `/admin/products` | Catalog manager (add, edit, bulk pricing, visibility) |
| `/admin/products/new` | Product creation with category assignment |
| `/admin/categories` | Packaging category manager with product counts |
| `/admin/orders` | Order fulfillment pipeline & courier dispatch tracking |
| `/admin/inventory` | Real-time stock levels, adjustment modal & audit log |
| `/admin/carts` | Active carts overview for abandoned cart recovery |
| `/admin/customers` | Customer directory with lifetime spend metrics |
| `/admin/coupons` | Discount coupon manager (fixed & percentage) |
| `/admin/enquiries` | B2B wholesale quotation CRM pipeline |
| `/admin/settings` | Store tax, GSTIN, and manufacturing dispatch rules |

---

## 🧪 Testing & Verification

Run the test suite:
```bash
# Run unit & schema tests
pnpm test

# Run production build check
pnpm build
```

---

## 📦 Brand Image Assets Reference

Official brand assets located in `/public/images/editorial/`:
* **Main Brand Logo:** `public/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png`
* **Signature Luxury Box Showcase:** `public/images/editorial/Gemini_Generated_Image_jbsl4ljbsl4ljbsl.png`

---

## ⚖️ License & Proprietary Notice

Copyright © 1984–2026 **Mithai Box Wala** / **Ajay Packers**. All rights reserved.  
Proprietary software developed exclusively for Mithai Box Wala wholesale and retail operations.
