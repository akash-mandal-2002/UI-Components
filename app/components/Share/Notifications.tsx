import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '@/app/type';

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" id="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => {
          const iconMap = {
            success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          };

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className="pointer-events-auto flex items-start gap-3 bg-white border border-neutral-200 p-3.5 rounded-xl shadow-lg"
              id={`toast_${toast.id}`}
            >
              <div className="mt-0.5">{iconMap[toast.type]}</div>
              
              <div className="flex-1 text-xs sm:text-sm font-medium text-neutral-800">
                {toast.message}
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-lg transition-colors cursor-pointer"
                id={`toast_close_${toast.id}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
