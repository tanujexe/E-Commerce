/**
 * ProfilePage — view/edit user profile, change password
 */

import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiPackage } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name:   user?.name    || '',
    phone:  user?.phone   || '',
    street: user?.address?.street  || '',
    city:   user?.address?.city    || '',
    state:  user?.address?.state   || '',
    country: user?.address?.country || '',
    zipCode: user?.address?.zipCode || '',
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError,   setProfileError]   = useState('');
  const [pwdLoading, setPwdLoading]         = useState(false);
  const [pwdError,   setPwdError]           = useState('');
  const [tab, setTab] = useState('profile');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    try {
      await updateUser({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street, city: profileForm.city,
          state: profileForm.state, country: profileForm.country, zipCode: profileForm.zipCode,
        },
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return setPwdError('New passwords do not match');
    }
    if (pwdForm.newPassword.length < 6) {
      return setPwdError('New password must be at least 6 characters');
    }
    setPwdLoading(true);
    setPwdError('');
    try {
      await updateUser({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="container-page py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Profile header */}
        <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-display font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-display font-bold text-2xl text-dark-900">{user?.name}</h1>
            <p className="text-dark-400 text-sm">{user?.email}</p>
            <span className={`badge mt-2 ${user?.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-stone-100 text-dark-600'} capitalize`}>
              {user?.role}
            </span>
          </div>
          <Link to="/orders" className="sm:ml-auto btn btn-ghost border border-dark-200 gap-2 text-sm">
            <FiPackage size={14} /> My Orders
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-200 mb-6">
          {['profile', 'security'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 px-1 mr-6 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-dark-500 hover:text-dark-800'
              }`}>
              {t === 'profile' ? 'Profile Info' : 'Change Password'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="card p-6 animate-fade-in">
            <h2 className="font-display font-semibold text-dark-900 mb-5 flex items-center gap-2">
              <FiUser size={16} className="text-primary-500" /> Personal Information
            </h2>

            {profileError && <Alert message={profileError} className="mb-5" />}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <FiUser size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input className="input pl-10" value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input className="input pl-10 bg-dark-50 cursor-not-allowed" value={user?.email} disabled />
                  </div>
                  <p className="text-xs text-dark-400 mt-1">Email cannot be changed</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <FiPhone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input className="input pl-10" placeholder="+1 234 567 8900" value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Address section */}
              <div className="border-t border-dark-100 pt-4">
                <h3 className="font-display font-semibold text-dark-700 text-sm mb-3 flex items-center gap-2">
                  <FiMapPin size={14} className="text-primary-500" /> Default Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'street',  label: 'Street',  col: 2 },
                    { key: 'city',    label: 'City'         },
                    { key: 'state',   label: 'State'        },
                    { key: 'country', label: 'Country'      },
                    { key: 'zipCode', label: 'ZIP Code'     },
                  ].map(({ key, label, col }) => (
                    <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                      <label className="label">{label}</label>
                      <input className="input" placeholder={label} value={profileForm[key]}
                        onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={profileLoading} className="btn btn-primary gap-2">
                {profileLoading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : <><FiSave size={15} /> Save Changes</>}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="card p-6 animate-fade-in">
            <h2 className="font-display font-semibold text-dark-900 mb-5 flex items-center gap-2">
              <FiLock size={16} className="text-primary-500" /> Change Password
            </h2>

            {pwdError && <Alert message={pwdError} className="mb-5" />}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
              {[
                { key: 'currentPassword', label: 'Current Password', auto: 'current-password' },
                { key: 'newPassword',     label: 'New Password',     auto: 'new-password'     },
                { key: 'confirmPassword', label: 'Confirm New Password', auto: 'new-password' },
              ].map(({ key, label, auto }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input type="password" className="input pl-10" placeholder="••••••••"
                      autoComplete={auto}
                      value={pwdForm[key]}
                      onChange={(e) => setPwdForm((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                </div>
              ))}

              <button type="submit" disabled={pwdLoading} className="btn btn-primary gap-2">
                {pwdLoading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
                  : <><FiLock size={15} /> Update Password</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
