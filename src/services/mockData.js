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

export const MOCK_TAB_FED = {
  prevPeriod: { healthScore: null, defectsTotal: null },
  currentDay: {
    impl:       [{ name: 'UAT', value: 3 }, { name: 'NOUAT', value: 7 }],
    defects:    [{ name: 'High', value: 5 }, { name: 'Medium', value: 3 }],
    regression: [],
  },
  rootCause: {
    today: {
      defects: {
        FED_Triaged:  { Critical: 0, High: 0, Medium: 1, Low: 0 },
        FED_IMPL:     { Critical: 0, High: 0, Medium: 0, Low: 2 },
        FED_NO_IMPL:  { Critical: 0, High: 1, Medium: 0, Low: 0 },
        FED_REQ_GAP:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_PUB:      { Critical: 0, High: 0, Medium: 1, Low: 0 },
        FED_CacheCLR: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      },
      regression: {
        FED_Triaged:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_IMPL:     { Critical: 0, High: 1, Medium: 0, Low: 0 },
        FED_NO_IMPL:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_REQ_GAP:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_PUB:      { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_CacheCLR: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      },
    },
    monthly: {
      defects: {
        FED_Triaged:  { Critical: 0, High: 2, Medium: 1, Low: 0 },
        FED_IMPL:     { Critical: 1, High: 3, Medium: 2, Low: 0 },
        FED_NO_IMPL:  { Critical: 0, High: 0, Medium: 1, Low: 1 },
        FED_REQ_GAP:  { Critical: 0, High: 1, Medium: 0, Low: 0 },
        FED_PUB:      { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_CacheCLR: { Critical: 0, High: 0, Medium: 1, Low: 0 },
      },
      regression: {
        FED_Triaged:  { Critical: 0, High: 2, Medium: 6, Low: 2 },
        FED_IMPL:     { Critical: 0, High: 0, Medium: 2, Low: 0 },
        FED_NO_IMPL:  { Critical: 0, High: 1, Medium: 2, Low: 0 },
        FED_REQ_GAP:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_PUB:      { Critical: 0, High: 0, Medium: 0, Low: 0 },
        FED_CacheCLR: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      },
    },
  },
  monthly: {
    healthScore:      78,
    defectsByPriority: [
      { name: 'High',   value: 7 },
      { name: 'Medium', value: 12 },
      { name: 'Low',    value: 5 },
    ],
  },
  dailyMetrics: {
    rows: [
      { date: '5/12', t: 30, d: 8,  c: 1,    h: 3, m: 3, l: 1,    rg: 2,    fp: 5,    dp: 2,    hs: 73.33 },
      { date: '5/9',  t: 25, d: 5,  c: null, h: 2, m: 2, l: 1,    rg: 1,    fp: 4,    dp: 1,    hs: 80.00 },
      { date: '5/8',  t: 18, d: 3,  c: null, h: 1, m: 2, l: null, rg: null, fp: 3,    dp: null, hs: 83.33 },
      { date: '5/7',  t: 42, d: 12, c: 2,    h: 5, m: 4, l: 1,    rg: 3,    fp: 7,    dp: 3,    hs: 71.43 },
      { date: '5/6',  t: 15, d: 2,  c: null, h: 1, m: 1, l: null, rg: null, fp: 2,    dp: 1,    hs: 86.67 },
      { date: '5/5',  t: 20, d: 6,  c: 1,    h: 2, m: 2, l: 1,    rg: 1,    fp: 3,    dp: 1,    hs: 70.00 },
      { date: '5/2',  t: 35, d: 9,  c: null, h: 4, m: 4, l: 1,    rg: 2,    fp: 6,    dp: 2,    hs: 74.29 },
      { date: '5/1',  t: 28, d: 7,  c: 1,    h: 3, m: 2, l: 1,    rg: 2,    fp: 5,    dp: 1,    hs: 75.00 },
    ],
    totals: { t: 213, d: 52, c: 5, h: 21, m: 18, l: 6, rg: 11, fp: 35, dp: 11, hs: 75.59 },
  },
  quarters: [
    { q: '1Q26', period: 'Jan–Mar 2026', days: 59, tickets: 800,  defects: 200, rg: 40, fp: 120, c:  5, h: 100, m:  80, l: 15, hs: 75.00, acc: '#0284c7', startDate: '2026-01-01', endDate: '2026-03-31' },
    { q: '2Q26', period: 'Apr–Jun 2026', days: 28, tickets: 213,  defects:  52, rg: 11, fp:  35, c:  5, h:  21, m:  18, l:  6, hs: 75.59, acc: '#0369a1', startDate: '2026-04-01', endDate: '2026-06-30' },
    { q: '3Q26', period: 'Jul–Sep 2026', days:  0, tickets:   0,  defects:   0, rg:  0, fp:   0, c:  0, h:   0, m:   0, l:  0, hs: null,  acc: '#0ea5e9', startDate: '2026-07-01', endDate: '2026-09-30' },
    { q: '4Q26', period: 'Oct–Dec 2026', days:  0, tickets:   0,  defects:   0, rg:  0, fp:   0, c:  0, h:   0, m:   0, l:  0, hs: null,  acc: '#38bdf8', startDate: '2026-10-01', endDate: '2026-12-31' },
  ],
};

export const MOCK_TAB_CATALOG = {
  prevPeriod: { healthScore: null, defectsTotal: null },
  currentDay: {
    impl:       [{ name: 'UAT', value: 4 }, { name: 'OPUAT', value: 2 }, { name: 'NOUAT', value: 6 }],
    defects:    [{ name: 'Critical', value: 1 }, { name: 'High', value: 3 }, { name: 'Medium', value: 2 }, { name: 'Low', value: 1 }],
    regression: [{ name: 'High', value: 2 }],
  },
  rootCause: {
    today: {
      defects: {
        CAT_Triaged:  { Critical: 0, High: 0, Medium: 1, Low: 0 },
        CAT_IMPL:     { Critical: 0, High: 1, Medium: 0, Low: 0 },
        CAT_NO_IMPL:  { Critical: 0, High: 0, Medium: 1, Low: 0 },
        CAT_REQ_GAP:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_PUB:      { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_CacheCLR: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      },
      regression: {
        CAT_Triaged:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_IMPL:     { Critical: 0, High: 1, Medium: 0, Low: 0 },
        CAT_NO_IMPL:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_REQ_GAP:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_PUB:      { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_CacheCLR: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      },
    },
    monthly: {
      defects: {
        CAT_Triaged:  { Critical: 0, High: 1, Medium: 2, Low: 0 },
        CAT_IMPL:     { Critical: 1, High: 2, Medium: 1, Low: 0 },
        CAT_NO_IMPL:  { Critical: 0, High: 0, Medium: 1, Low: 0 },
        CAT_REQ_GAP:  { Critical: 0, High: 1, Medium: 0, Low: 1 },
        CAT_PUB:      { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_CacheCLR: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      },
      regression: {
        CAT_Triaged:  { Critical: 0, High: 1, Medium: 3, Low: 1 },
        CAT_IMPL:     { Critical: 0, High: 0, Medium: 1, Low: 0 },
        CAT_NO_IMPL:  { Critical: 0, High: 1, Medium: 1, Low: 0 },
        CAT_REQ_GAP:  { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_PUB:      { Critical: 0, High: 0, Medium: 0, Low: 0 },
        CAT_CacheCLR: { Critical: 0, High: 0, Medium: 0, Low: 0 },
      },
    },
  },
  monthly: {
    healthScore:      85,
    defectsByPriority: [
      { name: 'Critical', value: 1 },
      { name: 'High',     value: 3 },
      { name: 'Medium',   value: 4 },
      { name: 'Low',      value: 2 },
    ],
  },
  dailyMetrics: {
    rows: [
      { date: '5/12', t: 22, d: 7,  c: 1,    h: 3, m: 2, l: 1,    rg: 2,    fp: 4,    dp: 1,    hs: 68.18 },
      { date: '5/9',  t: 18, d: 4,  c: null, h: 2, m: 2, l: null, rg: 1,    fp: 3,    dp: 1,    hs: 77.78 },
      { date: '5/8',  t: 14, d: 2,  c: null, h: 1, m: 1, l: null, rg: null, fp: 2,    dp: null, hs: 85.71 },
      { date: '5/7',  t: 38, d: 10, c: 2,    h: 4, m: 3, l: 1,    rg: 3,    fp: 6,    dp: 2,    hs: 73.68 },
      { date: '5/6',  t: 12, d: 3,  c: null, h: 1, m: 2, l: null, rg: null, fp: 2,    dp: null, hs: 75.00 },
      { date: '5/5',  t: 16, d: 5,  c: 1,    h: 2, m: 2, l: null, rg: 1,    fp: 2,    dp: 1,    hs: 68.75 },
      { date: '5/2',  t: 28, d: 8,  c: null, h: 3, m: 4, l: 1,    rg: 2,    fp: 5,    dp: 2,    hs: 71.43 },
      { date: '5/1',  t: 20, d: 5,  c: null, h: 2, m: 2, l: 1,    rg: 1,    fp: 4,    dp: 1,    hs: 75.00 },
    ],
    totals: { t: 168, d: 44, c: 4, h: 18, m: 16, l: 4, rg: 10, fp: 28, dp: 8, hs: 73.81 },
  },
  quarters: [
    { q: '1Q26', period: 'Jan–Mar 2026', days: 59, tickets: 650,  defects: 180, rg: 35, fp:  95, c:  4, h:  85, m:  70, l: 21, hs: 72.31, acc: '#0284c7', startDate: '2026-01-01', endDate: '2026-03-31' },
    { q: '2Q26', period: 'Apr–Jun 2026', days: 28, tickets: 168,  defects:  44, rg: 10, fp:  28, c:  4, h:  18, m:  16, l:  4, hs: 73.81, acc: '#0369a1', startDate: '2026-04-01', endDate: '2026-06-30' },
    { q: '3Q26', period: 'Jul–Sep 2026', days:  0, tickets:   0,  defects:   0, rg:  0, fp:   0, c:  0, h:   0, m:   0, l:  0, hs: null,  acc: '#0ea5e9', startDate: '2026-07-01', endDate: '2026-09-30' },
    { q: '4Q26', period: 'Oct–Dec 2026', days:  0, tickets:   0,  defects:   0, rg:  0, fp:   0, c:  0, h:   0, m:   0, l:  0, hs: null,  acc: '#38bdf8', startDate: '2026-10-01', endDate: '2026-12-31' },
  ],
};

export const MOCK_HEALTH_SCORE = 82;

export const MOCK_TODAY_LABEL = '4/29/2026';
