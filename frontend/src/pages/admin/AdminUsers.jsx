/**
 * AdminUsers — list, search, edit role, deactivate, delete users
 */

import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiEdit2, FiTrash2, FiUser, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ role: 'user', isActive: true });
  const [saving, setSaving]   = useState(false);
  const [editErr, setEditErr] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await userAPI.getAll(params);
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const openEdit = (user) => {
    setEditing(user);
    setEditForm({ role: user.role, isActive: user.isActive });
    setEditErr('');
  };

  const handleSave = async () => {
    setSaving(true);
    setEditErr('');
    try {
      await userAPI.update(editing._id, editForm);
      toast.success('User updated!');
      setEditing(null);
      fetchUsers();
    } catch (err) {
      setEditErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Users</h1>
          {!loading && <p className="text-dark-400 text-sm mt-0.5">{total} users registered</p>}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          type="text" placeholder="Search by name or email…"
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
          <div className="card overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-dark-100">
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-dark-400">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-display font-bold text-sm shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-dark-800">{u.name}</span>
                          {u._id === currentUser?._id && (
                            <span className="badge bg-primary-100 text-primary-700 text-[10px]">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-dark-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`badge capitalize flex items-center gap-1 w-fit ${
                          u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-stone-100 text-dark-600'
                        }`}>
                          {u.role === 'admin' ? <FiShield size={11} /> : <FiUser size={11} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-dark-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        {u._id !== currentUser?._id && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)}
                              className="p-2 text-dark-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                              <FiEdit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(u._id, u.name)}
                              className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
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

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-dark-900">Edit User</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-500">
                <FiX size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-stone-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-display font-bold">
                {editing.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-dark-800 text-sm">{editing.name}</p>
                <p className="text-xs text-dark-400">{editing.email}</p>
              </div>
            </div>

            {editErr && <Alert message={editErr} className="mb-4" />}

            <div className="space-y-4">
              <div>
                <label className="label">Role</label>
                <select className="input" value={editForm.role}
                  onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={editForm.isActive}
                    onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))} />
                  <div className={`w-10 h-6 rounded-full transition-colors ${editForm.isActive ? 'bg-primary-500' : 'bg-dark-200'}`} />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isActive ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-medium text-dark-700">Account Active</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="btn btn-ghost border border-dark-200 flex-1">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 gap-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
