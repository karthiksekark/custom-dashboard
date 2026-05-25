import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(target ?? 0);
  const prevRef = useRef(target ?? 0);
  const rafRef  = useRef(null);

  useEffect(() => {
    if (target == null) { setValue(null); return; }
    const start     = prevRef.current ?? 0;
    const diff      = target - start;
    const startTime = performance.now();

    cancelAnimationFrame(rafRef.current);

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(start + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
