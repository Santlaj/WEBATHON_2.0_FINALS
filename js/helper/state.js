// ── Constants ──────────────────────────────────────────
export const TIMER_TOTAL = 15 * 60;

export const CUSTOMERS = ['Rahul M.', 'Priya S.', 'Amit K.', 'Neha R.', 'Suresh P.', 'Kavita D.'];
export const DISTANCES = ['0.4 km', '0.8 km', '1.1 km', '1.5 km', '1.9 km'];
export const JOBS = [
  { type: 'Plumbing', icon: '🔧' },
  { type: 'Appliance Repair', icon: '🔌' },
  { type: 'House Help', icon: '🏠' },
  { type: 'Electronics', icon: '📺' }
];

// ── Shared Mutable State ───────────────────────────────
export const helperState = {
  isOnline: false,
  gpsInterval: null,
  watchId: null,
  timerInterval: null,
  bookingCountdown: null,
  bookingSecsLeft: 15,
  map: null,
  helperMarker: null,
  customerMarker: null,
  routeLine: null,
  currentJob: JOBS[0],
  currentCustomer: CUSTOMERS[0],
  currentDistance: DISTANCES[0]
};

// ── DOM Helper ─────────────────────────────────────────
export const $ = (id) => document.getElementById(id);
