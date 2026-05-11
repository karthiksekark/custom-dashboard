import { useMemo } from 'react';
import moment from 'moment-timezone';

const EST = 'America/New_York';

export function useDateOptions() {
  return useMemo(() => {
    const now = moment().tz(EST);
    const months = [];
    const yearSet = new Set();

    // Past 24 months (2 years) including current
    for (let i = 0; i < 24; i++) {
      const m = now.clone().subtract(i, 'months');
      const year  = m.format('YYYY');
      const month = m.format('MM');
      const label = m.format('MMMM');
      months.push({ value: month, label, year });
      yearSet.add(year);
    }

    const years = Array.from(yearSet).sort((a, b) => b - a);

    return { months, years };
  }, []);
}
