/**
 * OrderDetailPage — full order details, status timeline, items
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { orderAPI } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';

const TIMELINE = [
  { status: 'pending',    label: 'Order Placed',  icon: FiClock        },
  { status: 'processing', label: 'Processing',    icon: FiPackage      },
  { status: 'shipped',    label: 'Shipped',       icon: FiTruck        },
  { status: 'delivered',  label: 'Delivered',     icon: FiCheckCircle  },
];

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    orderAPI.getById(id)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (error)   return <div className="container-page py-16"><Alert message={error} /></div>;
  if (!order)  return null;

  const statusIndex = TIMELINE.findIndex((t) => t.status === order.orderStatus);

  return (
    <div className="container-page py-8 animate-fade-in">
      {/* Back link */}
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-dark-900 mb-6 transition-colors">
        <FiArrowLeft size={14} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`badge text-sm px-3 py-1.5 capitalize ${STATUS_STYLES[order.orderStatus] || 'bg-dark-100'}`}>
          {order.orderStatus}
        </span>
      </div>

      {/* Status Timeline */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-dark-900 mb-5">Order Progress</h2>
          <div className="flex items-center justify-between">
            {TIMELINE.map(({ status, label, icon: Icon }, i) => {
              const done    = i <= statusIndex;
              const current = i === statusIndex;
              return (
                <div key={status} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    done
                      ? current
                        ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                        : 'bg-green-500 text-white'
                      : 'bg-dark-100 text-dark-400'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-xs text-center font-medium ${done ? 'text-dark-800' : 'text-dark-400'}`}>{label}</span>
                  {i < TIMELINE.length - 1 && (
                    <div className={`absolute h-0.5 transition-colors ${done && i < statusIndex ? 'bg-green-400' : 'bg-dark-200'}`}
                      style={{ width: 'calc(25% - 2.5rem)', top: '1.25rem', left: `calc(${(i + 1) * 25}% - 0.25rem)`, position: 'absolute' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.orderStatus === 'cancelled' && (
        <Alert type="error" message="This order has been cancelled." className="mb-6" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + shipping */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-dark-900 mb-4">Items Ordered</h2>
            <div className="space-y-3">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-dark-50 last:border-0">
                  <img src={item.image} alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-dark-100" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product}`}
                      className="font-medium text-dark-800 text-sm hover:text-primary-600 transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs text-dark-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-display font-bold text-dark-900 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-dark-900 mb-3">Shipping Address</h2>
            <div className="text-sm text-dark-600 space-y-0.5">
              <p className="font-semibold text-dark-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-dark-400">📞 {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Right: Payment Summary */}
        <div>
          <div className="card p-5">
            <h2 className="font-display font-semibold text-dark-900 mb-4">Payment Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-dark-600"><span>Subtotal</span><span>${order.itemsPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-dark-600"><span>Tax</span><span>${order.taxPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-dark-600">
                <span>Shipping</span>
                <span className={order.shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                  {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-dark-100 pt-3 flex justify-between font-display font-bold text-dark-900 mb-4">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>

            <div className="space-y-2 text-xs text-dark-500">
              <div className="flex justify-between">
                <span>Payment method</span>
                <span className="capitalize font-medium text-dark-700">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment status</span>
                <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  {order.isPaid ? `Paid · ${new Date(order.paidAt).toLocaleDateString()}` : 'Pending'}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span>Tracking #</span>
                  <span className="font-mono font-medium text-dark-700">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
