/**
 * HomePage — Premium version with hero background image
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { productAPI } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = [
  {
    name: 'Digital Products',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=1021&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1173&auto=format&fit=crop'
  },
  {
    name: 'Clothing',
    image: 'https://plus.unsplash.com/premium_photo-1664202525979-80d1da46b34b?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Home & Garden',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1170&auto=format&fit=crop'
  },
  {
    name: 'Sports',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1170&auto=format&fit=crop'
  },
  {
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1170&auto=format&fit=crop'
  },
  {
    name: 'Decor',
    image: 'https://images.unsplash.com/photo-1633192255677-3a1617157208?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Art',
    image: 'https://images.unsplash.com/photo-1578301996581-bf7caec556c0?q=80&w=1051&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

const TRUST_BADGES = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $100' },
  { icon: FiShield, title: 'Secure Payments', desc: 'SSL encrypted checkout' },
  { icon: FiRefreshCw, title: '30-Day Returns', desc: 'Hassle-free refund policy' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Round-the-clock assistance' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loadingF, setLoadingF] = useState(true);
  const [loadingN, setLoadingN] = useState(true);

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

      {/* HERO WITH IMAGE */}
      <section className="relative overflow-hidden text-white">

        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1170&auto=format&fit=crop"
          alt="hero background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Glow Effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(2,115,22,0.25), transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(249,115,22,0.15), transparent 40%)`,
          }}
        />

        {/* Content */}
        <div className="container-page relative z-10 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex px-3 py-1 rounded-full bg-orange-500/10 text-orange-300 text-xs mb-6 border border-orange-500/20">
              ✦ New Season Arrivals
            </span>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Shop the
              <span className="block text-orange-400">Future.</span>
            </h1>

            <p className="text-gray-300 text-lg mb-8 max-w-lg">
              Discover premium products curated for quality and performance.
            </p>

            <div className="flex gap-3">
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 transition flex items-center gap-2"
              >
                Shop Now <FiArrowRight size={18} />
              </Link>

              <Link
                to="/products?featured=true"
                className="px-6 py-3 rounded-xl border border-white/30 hover:bg-white hover:text-black transition"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white border-b">
        <div className="container-page py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center text-orange-500">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs font-semibold text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-14">
        <h1 className="text-2xl font-bold  mb-6">Categories</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(({ name, image }) => (
            <Link
              key={name}
              to={`/products?category=${encodeURIComponent(name)}`}
              className="group relative rounded-2xl overflow-hidden h-32 shadow-sm hover:shadow-2xl transition"
            >
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-gray-50 py-12">
        <div className="container-page">
          <h2 className="text-2xl font-bold mb-12">Featured Products</h2>

          {loadingF ? (
            <Loader />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(p => (
                <div key={p._id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition overflow-hidden">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-page py-16">
        <h2 className="text-2xl font-bold mb-8">New Arrivals</h2>

        {loadingN ? (
          <Loader />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newest.map(p => (
              <div key={p._id} className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition overflow-hidden">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="rounded-3xl bg-gradient-to-br from-[#0B0B0F] to-[#1A1A24] text-white p-12">
          <h2 className="text-3xl font-bold mb-4">
            Join 50,000+ happy shoppers
          </h2>
          <p className="text-gray-400 mb-6">
            Get 10% off your first order.
          </p>
          <Link
            to="/register"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl transition shadow-lg"
          >
            Create Account
          </Link>
        </div> 
      </section>

    </div>
  );
}