/**
 * AdminDashboard — stats cards, recent orders, quick links
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag, FiUsers, FiPackage, FiDollarSign,
  FiArrowRight, FiTrendingUp, FiAlertCircle,
} from 'react-icons/fi';
import { orderAPI, userAPI, productAPI } from '../../services/api.js';
import Loader from '../../components/Loader.jsx';

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats,          setStats]         = useState(null);
  const [recentOrders,   setRecentOrders]  = useState([]);
  const [lowStock,       setLowStock]      = useState([]);
  const [loading,        setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      orderAPI.getAll({ limit: 5 }),
      userAPI.getStats(),
      productAPI.getAll({ sort: 'newest', limit: 5 }),
    ]).then(([ordersRes, usersRes, productsRes]) => {
      setStats(ordersRes.data.stats);
      setRecentOrders(ordersRes.data.orders);
      // Flag products with low stock
      setLowStock(productsRes.data.products.filter((p) => p.stock <= 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FiDollarSign, color: 'bg-green-50 text-green-600', trend: '+12.5%' },
    { label: 'Total Orders',  value: stats?.totalOrders || 0,  icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600',   trend: '+8.2%'  },
    { label: 'Paid Orders',   value: stats?.paidOrders || 0,   icon: FiPackage,     color: 'bg-indigo-50 text-indigo-600', trend: '+5.1%' },
    { label: 'Customers',     value: '–',                       icon: FiUsers,       color: 'bg-primary-50 text-primary-600', trend: '+3.7%' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${color} bg-opacity-50 flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <FiTrendingUp size={11} /> {trend}
              </span>
            </div>
            <p className="text-dark-400 text-xs mb-1">{label}</p>
            <p className="font-display font-bold text-2xl text-dark-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-dark-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-500 hover:text-primary-700 flex items-center gap-1">
              View all <FiArrowRight size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-dark-400 text-sm py-4 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="flex items-center gap-4 py-2 px-3 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-800 text-sm truncate">
                      {order.user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-dark-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className={`badge capitalize text-xs ${STATUS_STYLES[order.orderStatus] || 'bg-dark-100'}`}>
                    {order.orderStatus}
                  </span>
                  <span className="font-display font-bold text-dark-900 text-sm shrink-0">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Low Stock */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-dark-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/admin/products', label: 'Manage Products', icon: FiShoppingBag },
                { to: '/admin/orders',   label: 'View Orders',     icon: FiPackage    },
                { to: '/admin/users',    label: 'Manage Users',    icon: FiUsers      },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-sm font-medium text-dark-700">
                  <div className="w-8 h-8 bg-primary-50 text-primary-500 rounded-lg flex items-center justify-center">
                    <Icon size={15} />
                  </div>
                  {label}
                  <FiArrowRight size={13} className="ml-auto text-dark-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Low stock alerts */}
          {lowStock.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiAlertCircle size={16} className="text-amber-500" />
                <h2 className="font-display font-semibold text-dark-900">Low Stock Alert</h2>
              </div>
              <div className="space-y-2">
                {lowStock.map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span className="text-dark-700 truncate flex-1">{p.name}</span>
                    <span className={`badge ml-2 shrink-0 ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
