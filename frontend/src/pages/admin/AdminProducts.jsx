/**
 * AdminProducts — list, create, edit, delete products
 */

import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI } from '../../services/api.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Food', 'Other'];

const EMPTY_FORM = {
  name: '', description: '', shortDescription: '', price: '',
  discountedPrice: '', category: 'Electronics', brand: '', stock: '',
  tags: '', isFeatured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [search,   setSearch]   = useState('');
  const [total,    setTotal]    = useState(0);
  const [error,    setError]    = useState('');

  // Modal state
  const [modal,    setModal]    = useState(false);  // 'create' | 'edit' | false
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [formErr,  setFormErr]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [images,   setImages]   = useState([]);
  const fileRef = useRef();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setFormErr('');
    setModal('create');
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price,
      discountedPrice: product.discountedPrice || '',
      category: product.category,
      brand: product.brand || '',
      stock: product.stock,
      tags: product.tags?.join(', ') || '',
      isFeatured: product.isFeatured || false,
    });
    setImages([]);
    setFormErr('');
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.stock || !form.category) {
      return setFormErr('Please fill in all required fields');
    }
    setSaving(true);
    setFormErr('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));

      if (modal === 'create') {
        await productAPI.create(fd);
        toast.success('Product created!');
      } else {
        await productAPI.update(editing._id, fd);
        toast.success('Product updated!');
      }
      setModal(false);
      fetchProducts();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Products</h1>
          {!loading && <p className="text-dark-400 text-sm mt-0.5">{total} products total</p>}
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          type="text" placeholder="Search products…"
          className="input pl-10"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
            <FiX size={14} />
          </button>
        )}
      </div>

      {error && <Alert message={error} className="mb-5" />}

      {loading ? <Loader /> : (
        <>
          {/* Product table */}
          <div className="card overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-dark-100">
                    {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {products.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-dark-400">No products found</td></tr>
                  ) : products.map((p) => (
                    <tr key={p._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]?.url} alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-dark-100 shrink-0" />
                          <div>
                            <p className="font-medium text-dark-800 line-clamp-1 max-w-[200px]">{p.name}</p>
                            {p.isFeatured && <span className="badge bg-amber-100 text-amber-700 text-[10px]">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-dark-500">{p.category}</td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-dark-900">${(p.discountedPrice || p.price).toFixed(2)}</span>
                        {p.discountedPrice ? <span className="text-xs text-dark-400 line-through ml-1">${p.price.toFixed(2)}</span> : null}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-dark-500">⭐ {p.rating} ({p.numReviews})</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)}
                            className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                            <FiEdit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p._id, p.name)}
                            className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-dark-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-display font-semibold text-dark-900 text-lg">
                {modal === 'create' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-500">
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formErr && <Alert message={formErr} />}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Product Name *</label>
                  <input className="input" placeholder="e.g. iPhone 15 Pro" value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Description *</label>
                  <textarea className="input resize-none" rows={3} placeholder="Full product description"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Short Description</label>
                  <input className="input" placeholder="One-line summary (max 200 chars)" value={form.shortDescription}
                    onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} maxLength={200} />
                </div>

                <div>
                  <label className="label">Price ($) *</label>
                  <input type="number" className="input" min={0} step="0.01" placeholder="0.00" value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Discounted Price ($)</label>
                  <input type="number" className="input" min={0} step="0.01" placeholder="Leave blank if no discount" value={form.discountedPrice}
                    onChange={(e) => setForm((p) => ({ ...p, discountedPrice: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Category *</label>
                  <select className="input" value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Brand</label>
                  <input className="input" placeholder="e.g. Apple" value={form.brand}
                    onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Stock *</label>
                  <input type="number" className="input" min={0} placeholder="0" value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
                </div>

                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input className="input" placeholder="apple, phone, 5g" value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Product Images</label>
                  <div
                    className="border-2 border-dashed border-dark-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <FiUpload size={20} className="mx-auto text-dark-400 mb-2" />
                    <p className="text-sm text-dark-500">Click to upload images (max 5, 5MB each)</p>
                    <p className="text-xs text-dark-400 mt-1">JPEG, PNG, WebP supported</p>
                    <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                      onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))} />
                  </div>
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {images.map((f, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(f)} alt=""
                            className="w-14 h-14 rounded-lg object-cover border border-dark-100" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary-500" checked={form.isFeatured}
                    onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} />
                  <span className="text-sm font-medium text-dark-700">Mark as Featured</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-dark-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button onClick={() => setModal(false)} className="btn btn-ghost border border-dark-200 px-6">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 gap-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : modal === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
