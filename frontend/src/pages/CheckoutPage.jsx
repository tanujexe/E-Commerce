/**
 * CheckoutPage — shipping address, payment method selection, order placement
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiMapPin, FiCheckCircle, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import Alert from '../components/Alert.jsx';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [shipping, setShipping] = useState({
    fullName: '', street: '', city: '', state: '',
    country: '', zipCode: '', phone: '',
  });
  const [shippingErrors, setShippingErrors] = useState({});

  const [paymentMethod, setPaymentMethod] = useState('cod');

  // ── Shipping validation ─────────────────────────────────────────────────────
  const validateShipping = () => {
    const e = {};
    Object.entries(shipping).forEach(([k, v]) => {
      if (!v.trim()) e[k] = 'This field is required';
    });
    setShippingErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleShippingChange = (field) => (ev) => {
    setShipping((p) => ({ ...p, [field]: ev.target.value }));
    if (shippingErrors[field]) setShippingErrors((p) => ({ ...p, [field]: '' }));
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const orderItems = cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      let paymentResult = null;

      // Razorpay flow
      if (paymentMethod === 'razorpay') {
        const { data: rzp } = await paymentAPI.createRazorpayOrder({ amount: totalPrice });
        await new Promise((resolve, reject) => {
          const options = {
            key: rzp.keyId,
            amount: rzp.amount,
            currency: rzp.currency,
            order_id: rzp.orderId,
            name: 'ShopVerse',
            description: 'Order Payment',
            handler: async (response) => {
              try {
                await paymentAPI.verifyRazorpay(response);
                paymentResult = { id: response.razorpay_payment_id, status: 'completed' };
                resolve();
              } catch (err) { reject(err); }
            },
            prefill: { name: shipping.fullName },
            theme: { color: '#f97316' },
          };
          // Only works when Razorpay SDK is loaded
          if (window.Razorpay) {
            new window.Razorpay(options).open();
          } else {
            toast.error('Razorpay SDK not loaded — falling back to COD');
            resolve();
          }
        });
      }

      // Create the order
      const { data } = await orderAPI.create({
        orderItems,
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentResult,
      });

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container-page py-8 animate-fade-in">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? 'bg-green-500 text-white' : i === step ? 'bg-dark-900 text-white' : 'bg-dark-100 text-dark-400'
              }`}>
                {i < step ? <FiCheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${i === step ? 'text-dark-900' : 'text-dark-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-4 transition-colors ${i < step ? 'bg-green-500' : 'bg-dark-200'}`} style={{ minWidth: 40 }} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Panel ── */}
        <div className="lg:col-span-2">
          {error && <Alert message={error} className="mb-5" />}

          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <FiMapPin size={18} className="text-primary-500" />
                </div>
                <h2 className="font-display font-semibold text-dark-900 text-lg">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'fullName', label: 'Full Name', col: 2 },
                  { key: 'street',   label: 'Street Address', col: 2 },
                  { key: 'city',     label: 'City'     },
                  { key: 'state',    label: 'State / Province' },
                  { key: 'country',  label: 'Country' },
                  { key: 'zipCode',  label: 'ZIP / Postal Code' },
                  { key: 'phone',    label: 'Phone Number', col: 2 },
                ].map(({ key, label, col }) => (
                  <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="label">{label}</label>
                    <input
                      type={key === 'phone' ? 'tel' : 'text'}
                      placeholder={label}
                      className={`input ${shippingErrors[key] ? 'input-error' : ''}`}
                      value={shipping[key]}
                      onChange={handleShippingChange(key)}
                    />
                    {shippingErrors[key] && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors[key]}</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { if (validateShipping()) setStep(1); }}
                className="btn btn-primary mt-6 px-8 py-2.5"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <FiCreditCard size={18} className="text-primary-500" />
                </div>
                <h2 className="font-display font-semibold text-dark-900 text-lg">Payment Method</h2>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { value: 'stripe',   label: 'Credit / Debit Card',   desc: 'Powered by Stripe — secure SSL',       icon: '💳' },
                  { value: 'razorpay', label: 'Razorpay',               desc: 'UPI, net banking, cards & wallets',    icon: '📱' },
                  { value: 'cod',      label: 'Cash on Delivery',       desc: 'Pay when your order arrives',         icon: '💵' },
                ].map(({ value, label, desc, icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === value
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-dark-200 hover:border-dark-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)}
                      className="accent-primary-500"
                    />
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-medium text-dark-800 text-sm">{label}</p>
                      <p className="text-xs text-dark-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn btn-ghost border border-dark-200 px-6">
                  Back
                </button>
                <button onClick={() => setStep(2)} className="btn btn-primary px-8 py-2.5">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-semibold text-dark-900 text-lg mb-5">Review Your Order</h2>

              {/* Shipping summary */}
              <div className="bg-stone-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiTruck size={15} className="text-primary-500" />
                  <span className="text-sm font-semibold text-dark-700">Shipping to</span>
                </div>
                <p className="text-sm text-dark-600">
                  {shipping.fullName} · {shipping.street}, {shipping.city}, {shipping.state}, {shipping.country} {shipping.zipCode}
                </p>
              </div>

              {/* Payment summary */}
              <div className="bg-stone-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <FiCreditCard size={15} className="text-primary-500" />
                  <span className="text-sm font-semibold text-dark-700">Payment</span>
                </div>
                <p className="text-sm text-dark-600 capitalize">{paymentMethod}</p>
              </div>

              {/* Items list */}
              <div className="space-y-3 mb-5">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-dark-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-dark-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-dark-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn btn-ghost border border-dark-200 px-6">
                  Back
                </button>
                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="btn btn-primary flex-1 py-3 text-base gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order…
                    </span>
                  ) : `Place Order · $${totalPrice.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="font-display font-semibold text-dark-900 mb-4">Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-dark-600"><span>Subtotal</span><span>${itemsPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-dark-600"><span>Tax</span><span>${taxPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-dark-600">
                <span>Shipping</span>
                <span className={shippingPrice === 0 ? 'text-green-600 font-semibold' : ''}>
                  {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>
            </div>
            <div className="border-t border-dark-100 pt-3 flex justify-between font-display font-bold text-dark-900">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {/* Mini cart */}
            <div className="mt-4 pt-4 border-t border-dark-100 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-2">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                  <span className="text-xs text-dark-600 flex-1 line-clamp-1">{item.name}</span>
                  <span className="text-xs font-medium text-dark-800">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
