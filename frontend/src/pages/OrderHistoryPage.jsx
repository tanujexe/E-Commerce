/**
 * OrderHistoryPage — list of all user orders
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiEye, FiChevronRight } from 'react-icons/fi';
import { orderAPI } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import Pagination from '../components/Pagination.jsx';

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function OrderHistoryPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);

  useEffect(() => {
    setLoading(true);
    orderAPI.getMyOrders({ page, limit: 10 })
      .then(({ data }) => {
        setOrders(data.orders);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container-page py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <FiPackage size={18} className="text-primary-500" />
        </div>
        <div>
          <h1 className="section-title">My Orders</h1>
          {!loading && <p className="text-sm text-dark-400">{total} order{total !== 1 ? 's' : ''} total</p>}
        </div>
      </div>

      {loading ? <Loader /> : error ? <Alert message={error} /> : orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-display font-semibold text-xl text-dark-800 mb-2">No orders yet</h3>
          <p className="text-dark-400 mb-6">Looks like you haven't ordered anything yet.</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow group"
              >
                {/* Order ID + date */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-dark-400">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`badge ${STATUS_STYLES[order.orderStatus] || 'bg-dark-100 text-dark-600'} capitalize`}>
                      {order.orderStatus}
                    </span>
                    {order.isPaid && (
                      <span className="badge bg-green-100 text-green-700">Paid</span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Item thumbnails */}
                <div className="flex -space-x-2">
                  {order.orderItems.slice(0, 3).map((item, i) => (
                    <img
                      key={i}
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-white"
                    />
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="w-10 h-10 rounded-lg bg-dark-100 border-2 border-white flex items-center justify-center text-xs font-medium text-dark-500">
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="font-display font-bold text-dark-900">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-dark-400">{order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}</p>
                </div>

                <FiChevronRight size={16} className="text-dark-300 group-hover:text-dark-600 transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
