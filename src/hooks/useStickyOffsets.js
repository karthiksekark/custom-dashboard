import { useEffect } from 'react';

export function useStickyOffsets(isFiltered) {
  useEffect(() => {
    const update = () => {
      const hh = document.querySelector('.header')?.offsetHeight ?? 0;
      const ch = document.querySelector('.control-bar')?.offsetHeight ?? 0;
      const th = document.querySelector('.tabs')?.offsetHeight ?? 0;

      const r = document.documentElement;
      r.style.setProperty('--sticky-header-h',  `${hh}px`);
      r.style.setProperty('--sticky-control-h', `${ch}px`);
      r.style.setProperty('--sticky-tabs-h',    `${th}px`);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isFiltered]);
}
