/**
 * Cart Context
 * Manages cart items with localStorage persistence
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cartItems')) || []; }
    catch { return []; }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Add to cart ────────────────────────────────────────────────────────────
  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      const maxStock = product.stock;

      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > maxStock) {
          toast.error(`Only ${maxStock} items in stock`);
          return prev;
        }
        toast.success(`${product.name} quantity updated`);
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: newQty } : item
        );
      }

      if (quantity > maxStock) {
        toast.error(`Only ${maxStock} items in stock`);
        return prev;
      }

      toast.success(`${product.name} added to cart`);
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.discountedPrice || product.price,
          image: product.images?.[0]?.url || '',
          stock: product.stock,
          quantity,
        },
      ];
    });
  }, []);

  // ── Remove from cart ───────────────────────────────────────────────────────
  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Item removed from cart');
  }, []);

  // ── Update quantity ────────────────────────────────────────────────────────
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id !== productId) return item;
        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} items available`);
          return item;
        }
        return { ...item, quantity };
      })
    );
  }, []);

  // ── Clear cart ─────────────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  }, []);

  // ── Computed values ────────────────────────────────────────────────────────
  const itemCount   = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const itemsPrice  = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxPrice    = +(itemsPrice * 0.1).toFixed(2);          // 10% tax
  const shippingPrice = itemsPrice > 100 ? 0 : 9.99;           // Free shipping over $100
  const totalPrice  = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);

  return (
    <CartContext.Provider
      value={{
        cartItems, itemCount, itemsPrice, taxPrice, shippingPrice, totalPrice,
        addToCart, removeFromCart, updateQuantity, clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
