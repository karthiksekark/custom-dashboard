import { useState, useEffect, useRef } from 'react';

export function useOnlineStatus(onComeOnline) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const callbackRef = useRef(onComeOnline);
  callbackRef.current = onComeOnline;

  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  callbackRef.current?.(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
