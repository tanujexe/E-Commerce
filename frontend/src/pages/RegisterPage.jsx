/**
 * RegisterPage — name, email, password, confirm password
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                                   e.name     = 'Name is required';
    else if (form.name.trim().length < 2)                    e.name     = 'Name must be at least 2 characters';
    if (!form.email.trim())                                  e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))               e.email    = 'Invalid email address';
    if (!form.password)                                      e.password = 'Password is required';
    else if (form.password.length < 6)                       e.password = 'Password must be at least 6 characters';
    if (!form.confirm)                                       e.confirm  = 'Please confirm your password';
    else if (form.confirm !== form.password)                 e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (ev) => {
    setForm((p) => ({ ...p, [field]: ev.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full Name',       type: 'text',     icon: FiUser,  placeholder: 'UserName',           auto: 'name'     },
    { key: 'email',    label: 'Email Address',   type: 'email',    icon: FiMail,  placeholder: 'user@example.com',    auto: 'email'    },
    { key: 'password', label: 'Password',        type: 'password', icon: FiLock,  placeholder: 'Min. 6 characters',  auto: 'new-password' },
    { key: 'confirm',  label: 'Confirm Password',type: 'password', icon: FiLock,  placeholder: 'Repeat your password', auto: 'new-password' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiUserPlus size={20} className="text-primary-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-dark-900">Create an account</h1>
            <p className="text-dark-400 text-sm mt-1">Join thousands of happy ShopVerse shoppers</p>
          </div>

          {apiError && <Alert message={apiError} className="mb-5" />}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {fields.map(({ key, label, type, icon: Icon, placeholder, auto }) => {
              const isPwd = key === 'password' || key === 'confirm';
              const inputType = isPwd ? (showPwd ? 'text' : 'password') : type;
              return (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      type={inputType}
                      placeholder={placeholder}
                      className={`input pl-10 ${isPwd ? 'pr-10' : ''} ${errors[key] ? 'input-error' : ''}`}
                      value={form[key]}
                      onChange={handleChange(key)}
                      autoComplete={auto}
                    />
                    {key === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                      >
                        {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    )}
                  </div>
                  {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                </div>
              );
            })}

            {/* Password strength hint */}
            {form.password && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => {
                  const strength = Math.min(4, Math.floor(form.password.length / 3) +
                    ((/[A-Z]/.test(form.password) ? 1 : 0) + (/[0-9]/.test(form.password) ? 1 : 0)));
                  return (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= strength
                        ? strength <= 1 ? 'bg-red-400'
                          : strength <= 2 ? 'bg-amber-400'
                          : strength <= 3 ? 'bg-blue-400'
                          : 'bg-green-500'
                        : 'bg-dark-200'
                    }`} />
                  );
                })}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-dark-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
