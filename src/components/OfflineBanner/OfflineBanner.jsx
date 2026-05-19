import { useState, useEffect } from 'react';
import './OfflineBanner.scss';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner" role="alert" aria-live="assertive">
      <span className="offline-banner__icon">⚡</span>
      You are offline — showing cached or demo data.
    </div>
  );
}
