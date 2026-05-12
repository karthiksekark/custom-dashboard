import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Modal.scss';

export default function Modal({ isOpen, onClose, title, children, variant, blocking, dismissLocked }) {
  // Lock scroll while open
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // ESC to close — disabled when blocking or dismissLocked
  useEffect(() => {
    if (!isOpen || blocking || dismissLocked) return;
    const handler = e => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, blocking, dismissLocked, onClose]);

  if (!isOpen) return null;

  // blocking: no ESC, no backdrop, no X button
  // dismissLocked: no ESC, no backdrop, but X button is kept
  const suppressBackdrop = blocking || dismissLocked;
  const showCloseButton  = !blocking;

  return (
    <div
      className={`modal-backdrop${blocking ? ' modal-backdrop--blocking' : ''}`}
      onClick={suppressBackdrop ? undefined : onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal modal--${variant ?? 'default'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`modal__header modal__header--${variant ?? 'default'}`}>
          <span className="modal__title">{title}</span>
          {showCloseButton && (
            <button className="modal__close" onClick={onClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen:        PropTypes.bool.isRequired,
  onClose:       PropTypes.func,
  title:         PropTypes.node.isRequired,
  children:      PropTypes.node.isRequired,
  variant:       PropTypes.oneOf(['default', 'auth', 'warning']),
  blocking:      PropTypes.bool,
  dismissLocked: PropTypes.bool,
};
