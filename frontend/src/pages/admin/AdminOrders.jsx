/**
 * AdminOrders — all orders with status filter and status update modal
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEdit2, FiX, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filter,  setFilter]  = useState('');

  // Status update modal
  const [updating,  setUpdating]  = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [tracking,  setTracking]  = useState('');
  const [saving,    setSaving]    = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter) params.status = filter;
      const { data } = await orderAPI.getAll(params);
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, filter]);

  const openUpdate = (order) => {
    setUpdating(order);
    setNewStatus(order.orderStatus);
    setTracking(order.trackingNumber || '');
  };

  const handleStatusUpdate = async () => {
    setSaving(true);
    try {
      await orderAPI.updateStatus(updating._id, { orderStatus: newStatus, trackingNumber: tracking });
      toast.success('Order status updated!');
      setUpdating(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Orders</h1>
          {!loading && <p className="text-dark-400 text-sm mt-0.5">{total} orders total</p>}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <FiFilter size={14} className="text-dark-400" />
        <button
          onClick={() => { setFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filter ? 'bg-dark-900 text-white' : 'border border-dark-200 text-dark-600 hover:bg-dark-50'}`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? 'bg-dark-900 text-white' : 'border border-dark-200 text-dark-600 hover:bg-dark-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {error && <Alert message={error} className="mb-5" />}

      {loading ? <Loader /> : (
        <>
          <div className="card overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-dark-100">
                    {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {orders.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-dark-400">No orders found</td></tr>
                  ) : orders.map((order) => (
                    <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-dark-500">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-dark-800">{order.user?.name || '–'}</p>
                        <p className="text-xs text-dark-400">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3 text-dark-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-dark-500">{order.orderItems.length}</td>
                      <td className="px-5 py-3 font-semibold text-dark-900">${order.totalPrice.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge capitalize ${STATUS_STYLES[order.orderStatus] || 'bg-dark-100'}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/orders/${order._id}`}
                            className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                            <FiEye size={14} />
                          </Link>
                          <button onClick={() => openUpdate(order)}
                            className="p-2 text-dark-400 hover:text-dark-700 hover:bg-dark-50 rounded-lg transition-colors">
                            <FiEdit2 size={14} />
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

      {/* Status Update Modal */}
      {updating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setUpdating(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-dark-900">Update Order Status</h2>
              <button onClick={() => setUpdating(null)} className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-500">
                <FiX size={18} />
              </button>
            </div>

            <p className="text-xs text-dark-400 font-mono mb-4">
              Order #{updating._id.slice(-8).toUpperCase()}
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">Status</label>
                <select className="input capitalize" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Tracking Number (optional)</label>
                <input className="input" placeholder="e.g. 1Z999AA10123456784"
                  value={tracking} onChange={(e) => setTracking(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setUpdating(null)} className="btn btn-ghost border border-dark-200 flex-1">
                Cancel
              </button>
              <button onClick={handleStatusUpdate} disabled={saving} className="btn btn-primary flex-1 gap-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
