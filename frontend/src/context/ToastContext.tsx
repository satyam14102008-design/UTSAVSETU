import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-[#F0FDF4] border-emerald-500/40 text-emerald-900'
                : toast.type === 'warning'
                ? 'bg-[#FFFBEB] border-amber-500/40 text-amber-900'
                : toast.type === 'error'
                ? 'bg-[#FEF2F2] border-rose-500/40 text-rose-900'
                : 'bg-white border-[#D4AF37]/40 text-[#2D2D2D]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#800020] mt-0.5 shrink-0" />}
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

