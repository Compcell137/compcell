"use client";

import { useToast, type Toast as ToastType } from '@/contexts/ToastContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-900/95 to-green-800/95 border-green-600 text-green-100';
      case 'error':
        return 'bg-gradient-to-r from-red-900/95 to-red-800/95 border-red-600 text-red-100';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-900/95 to-yellow-800/95 border-yellow-600 text-yellow-100';
      default:
        return 'bg-gradient-to-r from-blue-900/95 to-blue-800/95 border-blue-600 text-blue-100';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          icon={getIcon(toast.type)}
          colors={getColors(toast.type)}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({
  toast,
  icon,
  colors,
  onClose,
}: {
  toast: ToastType;
  icon: React.ReactNode;
  colors: string;
  onClose: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        ${colors} border rounded-lg p-4 flex items-start gap-3
        backdrop-blur-sm shadow-2xl transition-all duration-300
        ${isExiting ? 'animate-out fade-out slide-out-to-right-full' : 'animate-in fade-in slide-in-from-right-full'}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-current hover:opacity-75 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
