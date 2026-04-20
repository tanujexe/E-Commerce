/**
 * Navbar — responsive top navigation with cart badge, auth links, mobile menu
 */

import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiUser, FiMenu, FiX, FiChevronDown,
  FiPackage, FiSettings, FiLogOut, FiGrid,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const userMenuRef = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/',         label: 'Home' },
    { to: '/products', label: 'Products' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'border-b border-dark-100'
      }`}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm"></span>
            </div>
            <span className="font-display font-bold text-xl text-dark-900">
              Apna<span className="text-primary-500">Store</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-dark-600 hover:text-dark-900 hover:bg-dark-50 transition-colors"
            >
              <FiShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* User menu (desktop) */}
            {isLoggedIn ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-display font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-dark-700 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`text-dark-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-dark-100 rounded-xl shadow-lg py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-dark-100">
                      <p className="text-xs text-dark-400">Signed in as</p>
                      <p className="text-sm font-medium text-dark-800 truncate">{user?.email}</p>
                    </div>
                    <DropItem to="/profile"  icon={<FiUser size={14} />}    label="Profile" onClick={() => setUserMenuOpen(false)} />
                    <DropItem to="/orders"   icon={<FiPackage size={14} />} label="My Orders" onClick={() => setUserMenuOpen(false)} />
                    {isAdmin && (
                      <DropItem to="/admin"  icon={<FiGrid size={14} />}   label="Dashboard" onClick={() => setUserMenuOpen(false)} />
                    )}
                    <div className="border-t border-dark-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost text-sm py-2">Login</Link>
                <Link to="/register" className="btn btn-primary text-sm py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-dark-600 hover:bg-dark-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-dark-100 animate-slide-up">
          <div className="container-page py-4 space-y-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'text-primary-600 bg-primary-50' : 'text-dark-700 hover:bg-dark-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {isLoggedIn ? (
              <>
                <div className="border-t border-dark-100 pt-3 mt-3">
                  <p className="px-4 text-xs text-dark-400 mb-2">Signed in as {user?.name}</p>
                  <MobileNavLink to="/profile"  onClick={() => setMobileOpen(false)}>Profile</MobileNavLink>
                  <MobileNavLink to="/orders"   onClick={() => setMobileOpen(false)}>My Orders</MobileNavLink>
                  {isAdmin && <MobileNavLink to="/admin" onClick={() => setMobileOpen(false)}>Admin Dashboard</MobileNavLink>}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-dark-100 pt-3 mt-3 flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn btn-outline text-sm">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const DropItem = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2.5 px-4 py-2 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
  >
    {icon} {label}
  </Link>
);

const MobileNavLink = ({ to, onClick, children }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block px-4 py-2.5 rounded-lg text-sm font-medium ${
        isActive ? 'text-primary-600 bg-primary-50' : 'text-dark-700 hover:bg-dark-50'
      }`
    }
  >
    {children}
  </NavLink>
);
