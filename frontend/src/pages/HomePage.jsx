/**
 * HomePage — hero, featured products, category grid, trust badges
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { productAPI } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', color: 'from-blue-500 to-indigo-600' },
  { name: 'Clothing',    emoji: '👕', color: 'from-pink-500 to-rose-600'   },
  { name: 'Books',       emoji: '📚', color: 'from-amber-400 to-orange-500' },
  { name: 'Home & Garden', emoji: '🏡', color: 'from-green-500 to-teal-600' },
  { name: 'Sports',      emoji: '⚽', color: 'from-violet-500 to-purple-600' },
  { name: 'Beauty',      emoji: '💄', color: 'from-red-400 to-pink-500'     },
];

const TRUST_BADGES = [
  { icon: FiTruck,       title: 'Free Shipping',    desc: 'On orders over $100'       },
  { icon: FiShield,      title: 'Secure Payments',  desc: 'SSL encrypted checkout'    },
  { icon: FiRefreshCw,   title: '30-Day Returns',   desc: 'Hassle-free refund policy' },
  { icon: FiHeadphones,  title: '24/7 Support',     desc: 'Round-the-clock assistance'},
];

export default function HomePage() {
  const [featured, setFeatured]   = useState([]);
  const [newest, setNewest]       = useState([]);
  const [loadingF, setLoadingF]   = useState(true);
  const [loadingN, setLoadingN]   = useState(true);

  useEffect(() => {
    productAPI.getAll({ featured: 'true', limit: 4 })
      .then(({ data }) => setFeatured(data.products))
      .finally(() => setLoadingF(false));

    productAPI.getAll({ sort: 'newest', limit: 8 })
      .then(({ data }) => setNewest(data.products))
      .finally(() => setLoadingN(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-dark-900 text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #ea580c 0%, transparent 40%)`,
          }}
        />
        <div className="container-page relative z-10 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-medium mb-6 border border-primary-500/30">
              ✦ New Season Arrivals
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
              Shop the
              <span className="block text-primary-400">Future.</span>
            </h1>
            <p className="text-dark-300 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
              Discover premium products curated for those who demand quality. Fast delivery, easy returns, unbeatable prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-primary text-base px-6 py-3 gap-2">
                Shop Now <FiArrowRight size={18} />
              </Link>
              <Link to="/products?featured=true" className="btn btn-outline border-white/30 text-white hover:bg-white hover:text-dark-900 text-base px-6 py-3">
                View Featured
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute -right-8 top-8 w-64 h-64 rounded-full border border-white/5" />
      </section>

      {/* ── Trust Badges ── */}
      <section className="bg-white border-b border-dark-100">
        <div className="container-page py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-display font-semibold text-dark-900 text-sm">{title}</p>
                  <p className="text-xs text-dark-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary-500 text-sm font-medium mb-1">Browse by</p>
            <h2 className="section-title">Categories</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-dark-600 hover:text-dark-900 flex items-center gap-1">
            All Products <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ name, emoji, color }) => (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-dark-100 hover:border-dark-300 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl mb-3 transition-transform duration-200 group-hover:scale-110`}>
                {emoji}
              </div>
              <span className="font-display font-semibold text-dark-800 text-sm">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-stone-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary-500 text-sm font-medium mb-1">Hand-picked</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="text-sm font-medium text-dark-600 hover:text-dark-900 flex items-center gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {loadingF ? (
            <Loader />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <p className="text-dark-400 text-center py-12">No featured products yet.</p>
          )}
        </div>
      </section>

      {/* ── Newest Arrivals ── */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-primary-500 text-sm font-medium mb-1">Just in</p>
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <Link to="/products?sort=newest" className="text-sm font-medium text-dark-600 hover:text-dark-900 flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loadingN ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newest.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="container-page pb-16">
        <div className="rounded-3xl bg-dark-900 text-white p-10 md:p-14 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 70% 50%, #f97316 0%, transparent 55%)`,
            }}
          />
          <div className="relative z-10 max-w-lg">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Join 50,000+ happy shoppers
            </h2>
            <p className="text-dark-300 mb-6 text-lg">
              Sign up today and get 10% off your first order. No spam, ever.
            </p>
            <Link to="/register" className="btn btn-primary text-base px-6 py-3">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
