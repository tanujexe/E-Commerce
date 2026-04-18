/**
 * AdminLayout — sidebar navigation wrapper for all /admin/* pages
 * Wrap admin pages in this layout for consistent sidebar nav.
 * Usage: Import and use as a wrapper inside each admin page, or via an Outlet pattern.
 */

import { NavLink, Outlet } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiPackage,
  FiUsers, FiChevronRight,
} from 'react-icons/fi';

const NAV = [
  { to: '/admin',          label: 'Dashboard', icon: FiGrid,        end: true },
  { to: '/admin/products', label: 'Products',  icon: FiShoppingBag, end: false },
  { to: '/admin/orders',   label: 'Orders',    icon: FiPackage,     end: false },
  { to: '/admin/users',    label: 'Users',     icon: FiUsers,       end: false },
];

export default function AdminLayout() {
  return (
    <div className="container-page py-8 animate-fade-in">
      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0 sticky top-24">
          <div className="card p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-dark-400 px-3 mb-2">
              Admin Panel
            </p>
            <nav className="space-y-0.5">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-dark-900 text-white'
                        : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                    }`
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={15} />
                    {label}
                  </span>
                  <FiChevronRight size={13} className="opacity-40" />
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
