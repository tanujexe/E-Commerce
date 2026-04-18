/**
 * ProductsPage — searchable, filterable product grid with sidebar
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';
import { productAPI } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First'    },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'        },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters driven by URL params
  const [search,    setSearch]    = useState(searchParams.get('search')   || '');
  const [category,  setCategory]  = useState(searchParams.get('category') || '');
  const [sort,      setSort]      = useState(searchParams.get('sort')     || 'newest');
  const [minPrice,  setMinPrice]  = useState(searchParams.get('minPrice') || '');
  const [maxPrice,  setMaxPrice]  = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating')|| '');
  const [featured,  setFeatured]  = useState(searchParams.get('featured') || '');
  const [page,      setPage]      = useState(Number(searchParams.get('page')) || 1);

  const [products,  setProducts]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search)    params.search    = search;
      if (category)  params.category  = category;
      if (minPrice)  params.minPrice  = minPrice;
      if (maxPrice)  params.maxPrice  = maxPrice;
      if (minRating) params.minRating = minRating;
      if (featured)  params.featured  = featured;

      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort, minPrice, maxPrice, minRating, featured]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Sync URL params
  useEffect(() => {
    const p = {};
    if (search)    p.search    = search;
    if (category)  p.category  = category;
    if (sort !== 'newest') p.sort = sort;
    if (minPrice)  p.minPrice  = minPrice;
    if (maxPrice)  p.maxPrice  = maxPrice;
    if (minRating) p.minRating = minRating;
    if (featured)  p.featured  = featured;
    if (page > 1)  p.page      = page;
    setSearchParams(p);
  }, [search, category, sort, minPrice, maxPrice, minRating, featured, page]);

  const clearFilters = () => {
    setSearch(''); setCategory(''); setSort('newest');
    setMinPrice(''); setMaxPrice(''); setMinRating(''); setFeatured('');
    setPage(1);
  };

  const hasFilters = search || category || minPrice || maxPrice || minRating || featured;

  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="label">Search</label>
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Search products…"
            className="input pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="label">Price Range ($)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="input" value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} min={0} />
          <input type="number" placeholder="Max" className="input" value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} min={0} />
        </div>
      </div>

      {/* Min rating */}
      <div>
        <label className="label">Min Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => { setMinRating(minRating == r ? '' : r); setPage(1); }}
              className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                minRating == r
                  ? 'bg-amber-400 border-amber-400 text-dark-900'
                  : 'border-dark-200 text-dark-600 hover:border-dark-400'
              }`}
            >
              {r}★
            </button>
          ))}
        </div>
      </div>

      {/* Featured toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={featured === 'true'}
            onChange={(e) => { setFeatured(e.target.checked ? 'true' : ''); setPage(1); }} />
          <div className={`w-10 h-6 rounded-full transition-colors ${featured === 'true' ? 'bg-primary-500' : 'bg-dark-200'}`} />
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${featured === 'true' ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-sm font-medium text-dark-700">Featured only</span>
      </label>

      {hasFilters && (
        <button onClick={clearFilters} className="w-full btn btn-ghost border border-dark-200 text-sm gap-2">
          <FiX size={14} /> Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-page py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Products</h1>
          {!loading && (
            <p className="text-sm text-dark-400 mt-1">{total} result{total !== 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative hidden sm:block">
            <select
              className="input pr-8 text-sm appearance-none cursor-pointer"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              style={{ minWidth: 160 }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn btn-outline text-sm gap-2"
          >
            <FiFilter size={14} /> Filters
            {hasFilters && <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">!</span>}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-dark-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-primary-500 hover:text-primary-700 font-medium">
                  Clear all
                </button>
              )}
            </div>
            <FiltersPanel />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Loader />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={pages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0 }); }} />
            </>
          ) : (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="font-display font-semibold text-xl text-dark-800 mb-2">No products found</h3>
              <p className="text-dark-400 mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-dark-900">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-dark-50">
                <FiX size={18} />
              </button>
            </div>
            <FiltersPanel />
          </div>
        </div>
      )}
    </div>
  );
}
