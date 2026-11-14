/**
 * Supabase Database Type Definitions
 * Auto-generated shape matching the schema in supabase/migrations/
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          phone: string | null;
          company: string | null;
          gstin: string | null;
          role: 'customer' | 'admin' | 'superadmin';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          phone?: string | null;
          company?: string | null;
          gstin?: string | null;
          role?: 'customer' | 'admin' | 'superadmin';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          phone?: string | null;
          company?: string | null;
          gstin?: string | null;
          role?: 'customer' | 'admin' | 'superadmin';
          is_active?: boolean;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          base_price: number;
          mrp: number | null;
          wholesale_price: number | null;
          min_order_qty: number;
          unit: string | null;
          sku: string | null;
          images: string[];
          tags: string[];
          is_active: boolean;
          is_featured: boolean;
          is_new_arrival: boolean;
          is_bestseller: boolean;
          stock: number;
          low_stock_threshold: number;
          gst_percent: number | null;
          hsn_code: string | null;
          weight_grams: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          base_price: number;
          mrp?: number | null;
          wholesale_price?: number | null;
          min_order_qty?: number;
          unit?: string | null;
          sku?: string | null;
          images?: string[];
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_bestseller?: boolean;
          stock?: number;
          low_stock_threshold?: number;
          gst_percent?: number | null;
          hsn_code?: string | null;
          weight_grams?: number | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          category_id?: string | null;
          base_price?: number;
          mrp?: number | null;
          wholesale_price?: number | null;
          min_order_qty?: number;
          unit?: string | null;
          sku?: string | null;
          images?: string[];
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_bestseller?: boolean;
          stock?: number;
          low_stock_threshold?: number;
          gst_percent?: number | null;
          hsn_code?: string | null;
          weight_grams?: number | null;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          subtotal: number;
          discount_amount: number;
          shipping_charge: number;
          gst_amount: number;
          total_amount: number;
          coupon_code: string | null;
          shipping_address: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          subtotal: number;
          discount_amount?: number;
          shipping_charge?: number;
          gst_amount?: number;
          total_amount: number;
          coupon_code?: string | null;
          shipping_address: Json;
          notes?: string | null;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          subtotal?: number;
          discount_amount?: number;
          shipping_charge?: number;
          gst_amount?: number;
          total_amount?: number;
          notes?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_sku: string | null;
          product_image: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          product_sku?: string | null;
          product_image?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: never;
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
        };
        Update: {
          quantity?: number;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default?: boolean;
        };
        Update: {
          name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          is_default?: boolean;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: 'percent' | 'flat';
          discount_value: number;
          min_order_amount: number | null;
          max_uses: number | null;
          used_count: number;
          is_active: boolean;
          valid_from: string | null;
          valid_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: 'percent' | 'flat';
          discount_value: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
        };
        Update: {
          description?: string | null;
          discount_type?: 'percent' | 'flat';
          discount_value?: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          is_active?: boolean;
          valid_from?: string | null;
          valid_until?: string | null;
        };
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          value?: Json;
          updated_at?: string;
        };
      };
      wholesale_enquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          message: string | null;
          status: 'new' | 'contacted' | 'converted' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          message?: string | null;
          status?: 'new' | 'contacted' | 'converted' | 'rejected';
        };
        Update: {
          status?: 'new' | 'contacted' | 'converted' | 'rejected';
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
