import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Toast = { id: string; message: string; variant?: 'info' | 'error' | 'success' };

type ToastContextType = {
  notify: (message: string, variant?: Toast['variant']) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = useCallback((message: string, variant: Toast['variant'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 1000 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.variant === 'error' ? 'rgba(255,107,107,0.12)' : t.variant === 'success' ? 'rgba(79,140,255,0.12)' : 'rgba(255,255,255,0.06)',
            border: '1px solid #223044',
            color: 'var(--text)',
            padding: '10px 12px',
            borderRadius: 10,
            maxWidth: 360,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}



