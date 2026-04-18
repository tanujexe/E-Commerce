/**
 * Alert — inline error/success/info/warning banner
 */

import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { useState } from 'react';

const VARIANTS = {
  error:   { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',   icon: FiAlertCircle,   iconColor: 'text-red-500'   },
  success: { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800', icon: FiCheckCircle,   iconColor: 'text-green-500' },
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',  icon: FiInfo,          iconColor: 'text-blue-500'  },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-800', icon: FiAlertTriangle, iconColor: 'text-amber-500' },
};

export default function Alert({ type = 'error', message, dismissible = false, className = '' }) {
  const [visible, setVisible] = useState(true);
  if (!visible || !message) return null;

  const v = VARIANTS[type] || VARIANTS.error;
  const Icon = v.icon;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${v.bg} ${v.border} ${className} animate-fade-in`}>
      <Icon size={16} className={`${v.iconColor} mt-0.5 shrink-0`} />
      <p className={`text-sm flex-1 ${v.text}`}>{message}</p>
      {dismissible && (
        <button onClick={() => setVisible(false)} className={`${v.iconColor} hover:opacity-70 transition-opacity shrink-0`}>
          <FiX size={14} />
        </button>
      )}
    </div>
  );
}
