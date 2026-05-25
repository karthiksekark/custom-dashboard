import { createContext, useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import '../components/Toast/Toast.scss';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <ToastList toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastList({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-list" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

ToastList.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.shape({
    id:      PropTypes.number,
    message: PropTypes.string,
    type:    PropTypes.string,
  })).isRequired,
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
