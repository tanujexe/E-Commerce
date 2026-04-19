/**
 * ProductCard — grid card with image, rating, price, add-to-cart
 */

import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const displayPrice    = product.discountedPrice || product.price;
  const hasDiscount     = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <div className="card group flex flex-col overflow-hidden animate-fade-in">
      {/* Image */}
      <Link to={`/products/${product._id}`} className="relative overflow-hidden bg-dark-50 aspect-square block">
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.stock === 0 && (
            <span className="badge bg-dark-800 text-white text-[10px]">Out of Stock</span>
          )}
          {hasDiscount && (
            <span className="badge bg-primary-500 text-white text-[10px]">−{discountPercent}%</span>
          )}
          {product.isFeatured && (
            <span className="badge bg-amber-400 text-dark-900 text-[10px]">Featured</span>
          )}
        </div>
        {/* Wishlist placeholder */}
        <button className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-dark-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
          <FiHeart size={14} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <span className="text-[11px] font-medium text-primary-500 uppercase tracking-wider mb-1">
          {product.category}
        </span>

        {/* Name */}
        <Link
          to={`/products/${product._id}`}
          className="font-display font-semibold text-dark-900 text-sm leading-snug hover:text-primary-600 transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={11}
                className={star <= Math.round(product.rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-dark-200'}
              />
            ))}
          </div>
          <span className="text-[11px] text-dark-400">
            ({product.numReviews ?? 0})
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-dark-900">
              ${displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-dark-600 font-semibold line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 text-white text-xs font-medium
                       hover:bg-primary-500 transition-colors duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={13} />
            {product.stock === 0 ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
