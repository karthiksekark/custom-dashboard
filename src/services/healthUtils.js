export function healthColor(score) {
  if (score == null) return '#94a3b8';
  if (score >= 95)   return '#16a34a';
  if (score >= 85)   return '#65a30d';
  if (score >= 70)   return '#ca8a04';
  return '#dc2626';
}

export function statusDot(status) {
  const map = {
    'Open':           '#dc2626',
    'In Progress':    '#2563eb',
    'Reopened':       '#ea580c',
    'Pending Review': '#ca8a04',
  };
  return map[status] || '#94a3b8';
}
