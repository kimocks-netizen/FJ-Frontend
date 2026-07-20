'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type, duration = 3000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = { success: <CheckCircle className="w-5 h-5 text-green-500" />, error: <XCircle className="w-5 h-5 text-red-500" />, warning: <AlertCircle className="w-5 h-5 text-yellow-500" />, info: <AlertCircle className="w-5 h-5 text-blue-500" /> };
  const bg = { success: 'bg-green-50 border-green-200', error: 'bg-red-50 border-red-200', warning: 'bg-yellow-50 border-yellow-200', info: 'bg-blue-50 border-blue-200' };
  const text = { success: 'text-green-800', error: 'text-red-800', warning: 'text-yellow-800', info: 'text-blue-800' };

  return (
    <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
      <div className={`${bg[type]} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start space-x-3">
          {icons[type]}
          <p className={`flex-1 text-sm font-medium ${text[type]}`}>{message}</p>
          <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
