export const MOCK_DEFECTS_BY_PRIORITY = [
  { name: 'Critical', value: 38 },
  { name: 'High',     value: 27 },
  { name: 'Medium',   value: 21 },
  { name: 'Low',      value: 14 },
];

export const MOCK_DEFECTS_BY_STATUS = [
  { name: 'Closed',      value: 52 },
  { name: 'Open',        value: 23 },
  { name: 'In Progress', value: 14 },
  { name: 'Resolved',    value:  8 },
  { name: 'Rejected',    value:  3 },
];

export const MOCK_IMPL_TICKETS = [
  { team: 'Alpha Squad', UAT: 4, OPUAT: 2, CR_UAT: 1, BIZ_VAL: 3, Total: 10 },
  { team: 'Beta Core',   UAT: 6, OPUAT: 3, CR_UAT: 2, BIZ_VAL: 1, Total: 12 },
  { team: 'Gamma Unit',  UAT: 2, OPUAT: 5, CR_UAT: 0, BIZ_VAL: 4, Total: 11 },
  { team: 'Delta Force', UAT: 3, OPUAT: 1, CR_UAT: 3, BIZ_VAL: 2, Total:  9 },
];

export const MOCK_DEFECTS_TABLE = [
  { status: 'Open',           critical: 8, high: 12, medium: 6, low: 3, total: 29 },
  { status: 'In Progress',    critical: 3, high:  5, medium: 9, low: 2, total: 19 },
  { status: 'Reopened',       critical: 2, high:  3, medium: 1, low: 0, total:  6 },
  { status: 'Pending Review', critical: 1, high:  2, medium: 4, low: 1, total:  8 },
];

export const MOCK_RELEASE_ROWS = [
  { date: '4/28', t: 41, d: 14, c:  1, h:  3, m:  8, l:  2, hs: 87.80  },
  { date: '4/27', t: 13, d:  6, c: null, h:  2, m:  4, l: null, hs: 100    },
  { date: '4/26', t: 13, d: 17, c: 11, h:  2, m:  2, l:  2, hs: 100    },
  { date: '4/24', t: 33, d:  3, c: null, h:  2, m:  1, l: null, hs: 95.45  },
  { date: '4/23', t: 70, d: 29, c:  5, h: 12, m: 11, l:  1, hs: 95.71  },
  { date: '4/22', t:  5, d:  2, c: null, h:  1, m:  1, l: null, hs: 70     },
  { date: '4/21', t: 25, d:  5, c: null, h:  4, m:  1, l: null, hs: 100    },
  { date: '4/20', t: 34, d:  9, c: null, h:  4, m:  5, l: null, hs: 100    },
  { date: '4/17', t: 15, d:  8, c: null, h:  2, m:  5, l:  1, hs: 90     },
  { date: '4/16', t: 51, d:  6, c: null, h:  3, m:  3, l: null, hs: 100    },
  { date: '4/15', t:  8, d:  4, c:  1, h:  1, m:  1, l:  1, hs: 100    },
  { date: '4/14', t:  9, d:  4, c:  1, h:  3, m: null, l: null, hs: 66.67  },
  { date: '4/13', t: 19, d:  7, c: null, h:  5, m:  2, l: null, hs: 92.11  },
  { date: '4/10', t: 22, d:  7, c: null, h:  4, m:  3, l: null, hs: 93.18  },
  { date: '4/9',  t: 40, d: 29, c:  3, h: 16, m:  9, l:  1, hs: 85     },
  { date: '4/7',  t:  9, d:  2, c: null, h:  1, m:  1, l: null, hs: 83.33  },
  { date: '4/6',  t: 22, d:  8, c: null, h:  4, m:  4, l: null, hs: 100    },
  { date: '4/3',  t:  7, d:  4, c: null, h:  2, m:  1, l:  1, hs: 100    },
  { date: '4/2',  t: 75, d: 41, c:  1, h: 23, m: 16, l:  1, hs: 83.33  },
  { date: '4/1',  t: 46, d: 13, c:  1, h:  5, m:  7, l: null, hs: 100    },
];

export const MOCK_TOTALS = { t: 557, d: 218, c: 24, h: 99, m: 85, l: 10, hs: 92.13 };

export const MOCK_QUARTERS = [
  { q: '1Q26', period: 'Jan–Mar 2026', days: 59, tickets: 1144, defects: 338, c:  7, h: 153, m: 147, l: 31, hs: 91.70, acc: '#0284c7' },
  { q: '2Q26', period: 'Apr–Jun 2026', days: 20, tickets:  557, defects: 218, c: 24, h:  99, m:  85, l: 10, hs: 92.13, acc: '#0369a1' },
  { q: '3Q26', period: 'Jul–Sep 2026', days:  0, tickets:    0, defects:   0, c:  0, h:   0, m:   0, l:  0, hs: null,  acc: '#0ea5e9' },
  { q: '4Q26', period: 'Oct–Dec 2026', days:  0, tickets:    0, defects:   0, c:  0, h:   0, m:   0, l:  0, hs: null,  acc: '#38bdf8' },
];

export const MOCK_CURRENT_DAY_FED = {
  impl:       [{ name: 'UAT', value: 3 }, { name: 'NOUAT', value: 7 }],
  defects:    [{ name: 'High', value: 5 }, { name: 'Medium', value: 3 }],
  regression: [],
};

export const MOCK_CURRENT_DAY_CATALOG = {
  impl:       [{ name: 'UAT', value: 4 }, { name: 'OPUAT', value: 2 }, { name: 'NOUAT', value: 6 }],
  defects:    [{ name: 'Critical', value: 1 }, { name: 'High', value: 3 }, { name: 'Medium', value: 2 }, { name: 'Low', value: 1 }],
  regression: [{ name: 'High', value: 2 }],
};

export const MOCK_HEALTH_SCORE = 82;

export const MOCK_TODAY_LABEL = '4/29/2026';
