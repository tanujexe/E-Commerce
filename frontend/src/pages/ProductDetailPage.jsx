/**
 * ProductDetailPage — image gallery, description, reviews, add-to-cart
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiShoppingCart, FiStar, FiArrowLeft, FiTruck,
  FiShield, FiMinus, FiPlus, FiPackage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [product,  setProduct]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [selImg,   setSelImg]   = useState(0);
  const [qty,      setQty]      = useState(1);
  const [tab,      setTab]      = useState('description');

  // Review form
  const [rating,   setRating]   = useState(5);
  const [comment,  setComment]  = useState('');
  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState('');

  useEffect(() => {
    setLoading(true);
    productAPI.getById(id)
      .then(({ data }) => setProduct(data.product))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return setRevError('Please write a comment.');
    setRevLoading(true);
    setRevError('');
    try {
      await productAPI.addReview(id, { rating, comment });
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      // Refresh product
      const { data } = await productAPI.getById(id);
      setProduct(data.product);
    } catch (err) {
      setRevError(err.message);
    } finally {
      setRevLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error)   return <div className="container-page py-16"><Alert message={error} /></div>;
  if (!product) return null;

  const displayPrice = product.discountedPrice || product.price;
  const hasDiscount  = product.discountedPrice && product.discountedPrice < product.price;
  const discPct      = hasDiscount ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;

  return (
    <div className="container-page py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-8">
        <Link to="/" className="hover:text-dark-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-dark-700">Products</Link>
        <span>/</span>
        <span className="text-dark-700 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* ── Image Gallery ── */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-dark-50 mb-3 border border-dark-100">
            <img
              src={product.images?.[selImg]?.url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    i === selImg ? 'border-primary-500' : 'border-dark-100 hover:border-dark-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div>
          <span className="text-xs font-medium text-primary-500 uppercase tracking-wider">
            {product.category} · {product.brand}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-dark-900 mt-2 mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} size={16}
                  className={s <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-dark-200'} />
              ))}
            </div>
            <span className="text-sm text-dark-500">{product.rating} ({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display font-bold text-4xl text-dark-900">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-dark-400 line-through">${product.price.toFixed(2)}</span>
                <span className="badge bg-primary-100 text-primary-700">−{discPct}%</span>
              </>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-dark-600 mb-6">{product.shortDescription}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
            </span>
          </div>

          {/* Qty + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-dark-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 text-dark-600 hover:bg-dark-50 transition-colors"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-12 text-center font-display font-semibold text-dark-900">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2.5 text-dark-600 hover:bg-dark-50 transition-colors"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 btn btn-primary text-base py-3 gap-2"
              >
                <FiShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}

          {/* Info badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-dark-100 pt-5">
            {[
              { icon: FiTruck,   text: 'Free shipping over $100' },
              { icon: FiShield,  text: 'Secure checkout'         },
              { icon: FiPackage, text: '30-day returns'          },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-stone-50">
                <Icon size={18} className="text-primary-500" />
                <span className="text-xs text-dark-500">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Description | Reviews ── */}
      <div className="border-b border-dark-200 mb-8">
        <div className="flex gap-6">
          {['description', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-dark-500 hover:text-dark-800'
              }`}
            >
              {t}{t === 'reviews' ? ` (${product.numReviews})` : ''}
            </button>
          ))}
        </div>
      </div>

      {tab === 'description' && (
        <div className="prose prose-stone max-w-3xl text-dark-700 leading-relaxed mb-12">
          <p>{product.description}</p>
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 not-prose">
              {product.tags.map((tag) => (
                <span key={tag} className="badge bg-dark-100 text-dark-600">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="max-w-3xl mb-12">
          {/* Existing reviews */}
          {product.reviews?.length > 0 ? (
            <div className="space-y-4 mb-10">
              {product.reviews.map((rev) => (
                <div key={rev._id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-display font-semibold text-dark-800 text-sm">{rev.name}</p>
                      <p className="text-xs text-dark-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <FiStar key={s} size={13}
                          className={s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-dark-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-dark-600 text-sm">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 mb-8">No reviews yet — be the first!</p>
          )}

          {/* Write a review */}
          {isLoggedIn ? (
            <div className="card p-6">
              <h3 className="font-display font-semibold text-dark-900 mb-4">Write a Review</h3>
              {revError && <Alert message={revError} className="mb-4" />}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="label">Your Rating</label>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map((s) => (
                      <button type="button" key={s} onClick={() => setRating(s)}>
                        <FiStar size={24}
                          className={`transition-colors ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-dark-200 hover:text-amber-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Comment</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="Share your experience with this product…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={revLoading}>
                  {revLoading ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-dark-500 mb-3">Please log in to leave a review.</p>
              <Link to="/login" className="btn btn-primary">Login</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
