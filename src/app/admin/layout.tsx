import React from 'react';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  Users, Tag, MessageSquare, Settings, LogOut,
  ShieldAlert, Image, BarChart3, ChevronRight,
  FolderTree, ShoppingBag,
} from 'lucide-react';
import { BUSINESS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const NAV = [
  { label: 'Overview',       href: '/admin',              icon: LayoutDashboard },
  { label: 'Products',       href: '/admin/products',     icon: Package },
  { label: 'Categories',     href: '/admin/categories',   icon: FolderTree },
  { label: 'Orders',         href: '/admin/orders',       icon: ShoppingCart },
  { label: 'Active Carts',   href: '/admin/carts',        icon: ShoppingBag },
  { label: 'Inventory',      href: '/admin/inventory',    icon: Warehouse },
  { label: 'Customers',      href: '/admin/customers',    icon: Users },
  { label: 'Coupons',        href: '/admin/coupons',      icon: Tag },
  { label: 'Enquiries',      href: '/admin/enquiries',    icon: MessageSquare },
  { label: 'Settings',       href: '/admin/settings',     icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#F4F1EA', color: '#24211F',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>
      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      {session && (
        <aside style={{
          width: 240, flexShrink: 0,
          background: '#1A100D',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh',
          overflowY: 'auto',
        }}
          className="hidden-mobile admin-sidebar"
        >
          {/* Logo */}
          <div style={{
            padding: '24px 20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              overflow: 'hidden',
              background: '#681C2D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid rgba(184,149,90,0.5)',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(104,28,45,0.4)',
            }}>
              <img
                src="/images/editorial/Gemini_Generated_Image_3w4lsp3w4lsp3w4l.png"
                alt="Mithai Box Wala"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FAF7F0', letterSpacing: '-.01em' }}>
                Admin Panel
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                Ajay Packers · Mirzapur
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '12px 10px', flex: 1 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
              letterSpacing: '.1em', textTransform: 'uppercase',
              padding: '8px 10px 4px',
            }}>
              Management
            </div>
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                textDecoration: 'none', fontSize: 13.5, fontWeight: 500,
                color: 'rgba(255,255,255,0.65)',
                transition: 'all 0.15s ease',
              }}
                className="admin-nav-link"
              >
                <Icon size={16} style={{ opacity: 0.7 }} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Footer / User */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', marginBottom: 6,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #681C2D, #B8955A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {(session as any)?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#FAF7F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {(session as any)?.name ?? 'Admin'}
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)' }}>Super Admin</div>
              </div>
            </div>
            <Link href="/api/admin/auth/logout" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 12.5, color: 'rgba(239,68,68,0.75)',
              transition: 'background 0.15s',
            }}
              className="admin-logout-link"
            >
              <LogOut size={14} /> Sign Out
            </Link>
          </div>
        </aside>
      )}

      {/* ─── MAIN CONTENT ───────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover {
          background: rgba(255,255,255,0.07) !important;
          color: #FAF7F0 !important;
        }
        .admin-logout-link:hover {
          background: rgba(239,68,68,0.08) !important;
          color: rgb(239,68,68) !important;
        }
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
