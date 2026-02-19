import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-dismiss after 5s
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const isError = notification.type === 'error';
  const bgColor = isError ? 'bg-red-50' : 'bg-green-50';
  const borderColor = isError ? 'border-red-200' : 'border-green-200';
  const textColor = isError ? 'text-red-800' : 'text-green-800';
  const Icon = isError ? AlertTriangle : CheckCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out translate-y-0 opacity-100 ${bgColor} ${borderColor}`}>
      <Icon className={`w-5 h-5 ${isError ? 'text-red-600' : 'text-green-600'}`} />
      <div className={`flex-1 text-sm font-medium ${textColor}`}>
        {notification.message}
      </div>
      <button 
        onClick={onClose}
        className={`p-1 rounded-full hover:bg-black/5 transition-colors ${textColor}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationToast;
