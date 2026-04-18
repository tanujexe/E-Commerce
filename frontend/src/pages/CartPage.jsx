/**
 * CartPage — cart items, qty controls, order summary, checkout CTA
 */

import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, itemsPrice, taxPrice, shippingPrice, totalPrice, itemCount } = useCart();
  const { isLoggedIn } = useAuth();

  if (cartItems.length === 0) {
    return (
      <div className="container-page py-24 text-center animate-fade-in">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="font-display font-bold text-3xl text-dark-900 mb-3">Your cart is empty</h2>
        <p className="text-dark-400 mb-8">Add some products to get started.</p>
        <Link to="/products" className="btn btn-primary text-base px-6 py-3 gap-2">
          <FiShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors"
        >
          <FiTrash2 size={14} /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 items-start sm:items-center animate-fade-in">
              <Link to={`/products/${item._id}`} className="shrink-0">
                <img
                  src={item.image || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover border border-dark-100"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item._id}`}
                  className="font-display font-semibold text-dark-900 text-sm hover:text-primary-600 transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-primary-600 font-semibold mt-1">${item.price.toFixed(2)}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                {/* Qty controls */}
                <div className="flex items-center border border-dark-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) removeFromCart(item._id);
                      else updateQuantity(item._id, item.quantity - 1);
                    }}
                    className="px-2.5 py-2 text-dark-500 hover:bg-dark-50 transition-colors"
                  >
                    <FiMinus size={13} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-dark-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="px-2.5 py-2 text-dark-500 hover:bg-dark-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiPlus size={13} />
                  </button>
                </div>

                {/* Subtotal */}
                <span className="font-display font-bold text-dark-900 w-16 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-1.5 text-dark-300 hover:text-red-500 transition-colors"
                  aria-label="Remove"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-display font-bold text-dark-900 text-lg mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm mb-5">
              <SummaryRow label={`Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})`} value={`$${itemsPrice.toFixed(2)}`} />
              <SummaryRow label="Tax (10%)" value={`$${taxPrice.toFixed(2)}`} />
              <SummaryRow
                label="Shipping"
                value={shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                valueClass={shippingPrice === 0 ? 'text-green-600 font-semibold' : ''}
              />
              {shippingPrice > 0 && (
                <p className="text-xs text-dark-400">Add ${(100 - itemsPrice).toFixed(2)} more for free shipping</p>
              )}
            </div>

            <div className="border-t border-dark-200 pt-4 flex items-center justify-between mb-6">
              <span className="font-display font-bold text-dark-900">Total</span>
              <span className="font-display font-bold text-xl text-dark-900">${totalPrice.toFixed(2)}</span>
            </div>

            {isLoggedIn ? (
              <Link to="/checkout" className="btn btn-primary w-full text-base py-3 gap-2">
                Proceed to Checkout <FiArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/login?redirect=/checkout" className="btn btn-primary w-full text-base py-3 gap-2">
                Login to Checkout <FiArrowRight size={18} />
              </Link>
            )}

            <Link to="/products" className="btn btn-ghost w-full mt-2 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between text-dark-600">
      <span>{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
