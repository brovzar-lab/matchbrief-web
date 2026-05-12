import type { AppUser, Location, Worker, Shift, SwapRequest } from '../lib/types';

// Current week anchored to Monday May 11, 2026
function weekDay(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date(2026, 4, 11); // Mon May 11
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const DEMO_USER: AppUser = {
  uid: 'demo-worker-1',
  email: 'alex.chen@riverviewretail.com',
  name: 'Alex Chen',
  companyId: 'demo-company-1',
  locationId: 'demo-location-1',
  role: 'worker',
};

export const DEMO_MANAGER_USER: AppUser = {
  uid: 'demo-manager-1',
  email: 'mgr.rivera@riverviewretail.com',
  name: 'Maria Rivera',
  companyId: 'demo-company-1',
  locationId: 'demo-location-1',
  role: 'manager',
};

export const DEMO_LOCATIONS: Location[] = [
  { id: 'demo-location-1', name: 'Riverview Retail — Downtown', overtimeThresholdHours: 40 },
  { id: 'demo-location-2', name: 'Riverview Retail — Eastside', overtimeThresholdHours: 40 },
];

export const DEMO_WORKERS: Worker[] = [
  { id: 'demo-worker-1', name: 'Alex Chen',    email: 'alex.chen@riverviewretail.com',    role: 'Cashier',    weeklyHoursLimit: 40 },
  { id: 'demo-worker-2', name: 'Jordan Lee',   email: 'jordan.lee@riverviewretail.com',   role: 'Cashier',    weeklyHoursLimit: 40 },
  { id: 'demo-worker-3', name: 'Sam Patel',    email: 'sam.patel@riverviewretail.com',    role: 'Shift Lead', weeklyHoursLimit: 40 },
  { id: 'demo-worker-4', name: 'Taylor Brown', email: 'taylor.brown@riverviewretail.com', role: 'Shift Lead', weeklyHoursLimit: 40 },
  { id: 'demo-worker-5', name: 'Morgan Kim',   email: 'morgan.kim@riverviewretail.com',   role: 'Cashier',    weeklyHoursLimit: 32 },
  { id: 'demo-worker-6', name: 'Riley Gomez',  email: 'riley.gomez@riverviewretail.com',  role: 'Cashier',    weeklyHoursLimit: 40 },
  { id: 'demo-worker-7', name: 'Casey Nguyen', email: 'casey.nguyen@riverviewretail.com', role: 'Shift Lead', weeklyHoursLimit: 40 },
  { id: 'demo-worker-8', name: 'Drew Santos',  email: 'drew.santos@riverviewretail.com',  role: 'Shift Lead', weeklyHoursLimit: 40 },
];

export const DEMO_SHIFTS: Shift[] = [
  // Alex (worker-1) — Cashier shifts this week
  { id: 'shift-1',  workerId: 'demo-worker-1', start: weekDay(0, 9),  end: weekDay(0, 17),  role: 'Cashier',    overtimeRisk: false },
  { id: 'shift-2',  workerId: 'demo-worker-1', start: weekDay(2, 13), end: weekDay(2, 21),  role: 'Cashier',    overtimeRisk: false },
  { id: 'shift-3',  workerId: 'demo-worker-1', start: weekDay(4, 8),  end: weekDay(4, 16),  role: 'Cashier',    overtimeRisk: false },
  // Jordan (worker-2) — Cashier
  { id: 'shift-4',  workerId: 'demo-worker-2', start: weekDay(1, 9),  end: weekDay(1, 17),  role: 'Cashier',    overtimeRisk: false },
  { id: 'shift-5',  workerId: 'demo-worker-2', start: weekDay(3, 9),  end: weekDay(3, 17),  role: 'Cashier',    overtimeRisk: false },
  // Sam (worker-3) — Shift Lead
  { id: 'shift-6',  workerId: 'demo-worker-3', start: weekDay(0, 8),  end: weekDay(0, 16),  role: 'Shift Lead', overtimeRisk: false },
  { id: 'shift-7',  workerId: 'demo-worker-3', start: weekDay(2, 8),  end: weekDay(2, 16),  role: 'Shift Lead', overtimeRisk: false },
  // Morgan (worker-5) — near weekly limit
  { id: 'shift-8',  workerId: 'demo-worker-5', start: weekDay(1, 8),  end: weekDay(1, 16),  role: 'Cashier',    overtimeRisk: true  },
  // Riley (worker-6)
  { id: 'shift-9',  workerId: 'demo-worker-6', start: weekDay(3, 14), end: weekDay(3, 22),  role: 'Cashier',    overtimeRisk: false },
  // Taylor (worker-4) — Shift Lead
  { id: 'shift-10', workerId: 'demo-worker-4', start: weekDay(4, 12), end: weekDay(4, 20),  role: 'Shift Lead', overtimeRisk: false },
];

export const DEMO_SWAP_REQUESTS: SwapRequest[] = [
  {
    id: 'swap-1',
    shiftId: 'shift-2',
    requesterId: 'demo-worker-1',
    claimantId: 'demo-worker-2',
    status: 'claimed',
    overtimeWarning: false,
    createdAt: weekDay(1, 10),
    resolvedAt: null,
    history: [
      { action: 'created', agentId: 'demo-worker-1', at: weekDay(1, 10) },
      { action: 'claimed', agentId: 'demo-worker-2', at: weekDay(1, 14) },
    ],
  },
  {
    id: 'swap-2',
    shiftId: 'shift-8',
    requesterId: 'demo-worker-5',
    claimantId: 'demo-worker-6',
    status: 'claimed',
    // Morgan is near limit — claiming this shift would push Riley over 40h
    overtimeWarning: true,
    createdAt: weekDay(0, 9),
    resolvedAt: null,
    history: [
      { action: 'created', agentId: 'demo-worker-5', at: weekDay(0, 9) },
      { action: 'claimed', agentId: 'demo-worker-6', at: weekDay(0, 18) },
    ],
  },
  {
    id: 'swap-3',
    shiftId: 'shift-9',
    requesterId: 'demo-worker-6',
    claimantId: null,
    status: 'open',
    overtimeWarning: false,
    createdAt: weekDay(2, 8),
    resolvedAt: null,
    history: [
      { action: 'created', agentId: 'demo-worker-6', at: weekDay(2, 8) },
    ],
  },
];
