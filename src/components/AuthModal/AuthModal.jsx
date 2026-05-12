import Modal from '../Modal/Modal';
import { redirectToJiraLogin } from '../../services/jira';
import './AuthModal.scss';

const LOCK_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EXTERNAL_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function AuthModal() {
  const jiraBase = import.meta.env.VITE_JIRA_BASE_URL;

  return (
    <Modal
      isOpen
      blocking
      variant="auth"
      title={<>{LOCK_ICON} Authentication Required</>}
    >
      <div className="modal-body">
        <p className="modal-body__text">
          Your JIRA session has expired or is unavailable. Please log in to
          continue accessing the dashboard.
        </p>

        {jiraBase ? (
          <>
            <button className="btn btn--primary btn--full" onClick={redirectToJiraLogin}>
              {EXTERNAL_ICON}
              Login to JIRA
            </button>
            <p className="auth-modal__note">
              JIRA will open in a new tab. After logging in, switch back to
              this tab — the dashboard will resume automatically.
            </p>
          </>
        ) : (
          <div className="auth-modal__no-config">
            <p className="modal-body__text">
              <strong>No JIRA URL configured.</strong> Set{' '}
              <code className="auth-modal__code">VITE_JIRA_BASE_URL</code> in
              your <code className="auth-modal__code">.env</code> file and
              rebuild the extension.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
