/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { APIService } from '../services/api';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { id, title, message, type, userId } = customEvent.detail;
        
        const currentUser = APIService.getCurrentUser();
        // Hide toast if targeted and doesn't match current user ID
        if (userId && userId !== 'all') {
          if (!currentUser || currentUser.id !== userId) {
            return;
          }
        }

        const newToast: Toast = { id, title, message, type };
        
        setToasts((prev) => [...prev, newToast]);

        // Auto remove toast after 5 seconds
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
      }
    };

    window.addEventListener('new-notification', handleNewNotification);
    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-[#10B981]" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-[#EF4444]" />;
      default:
        return <Info className="h-5 w-5 text-[#06B6D4]" />;
    }
  };

  const borderColors = {
    success: 'border-[#10B981]/30 shadow-[#10B981]/10',
    warning: 'border-[#F59E0B]/30 shadow-[#F59E0B]/10',
    alert: 'border-[#EF4444]/30 shadow-[#EF4444]/10',
    info: 'border-[#06B6D4]/30 shadow-[#06B6D4]/10'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className={`flex items-start gap-3 p-4 bg-[#0B1120]/90 backdrop-blur-md rounded-xl border ${borderColors[toast.type]} shadow-lg text-slate-200 pointer-events-auto`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-grow">
              <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
