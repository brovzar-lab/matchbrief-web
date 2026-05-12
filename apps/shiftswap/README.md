# ShiftSwap

B2B shift-trading marketplace for hourly workers. Workers post shifts they can't cover; eligible coworkers claim them; managers get a push notification for one-tap approve/deny.

## Local Dev Setup

### Prerequisites

- Node 20+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)

### 1. Install dependencies

```bash
cd apps/shiftswap
npm install
cd functions && npm install && cd ..
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in Firebase + RevenueCat values, or leave defaults to run in demo mode
```

### 3. Run in demo mode (no backend required)

Demo mode activates automatically when `EXPO_PUBLIC_FIREBASE_API_KEY` is missing or a placeholder.

```bash
npx expo start
```

Open Expo Go or run on simulator. Hit "Continue as Demo Worker" or "Continue as Demo Manager" on the auth screen.

### 4. Run with Firebase Emulators

```bash
# Terminal 1 — start emulators
firebase emulators:start

# Terminal 2 — start Expo with emulators enabled
EXPO_PUBLIC_USE_EMULATORS=true npx expo start
```

### 5. Deploy Cloud Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Architecture

```
apps/shiftswap/
├── App.tsx                   Root component (providers)
├── src/
│   ├── lib/
│   │   ├── config.ts         Theme constants + isDemoMode
│   │   ├── types.ts          TypeScript interfaces
│   │   ├── firebase.ts       Firebase init (null in demo mode)
│   │   └── store.ts          Zustand global store + auth listener
│   ├── demo/
│   │   └── seed.ts           Mock data for demo mode
│   ├── navigation/
│   │   └── RootNavigator.tsx Role-based navigation (worker tabs / manager tabs)
│   └── screens/
│       ├── AuthScreen.tsx
│       ├── worker/
│       │   ├── MyShiftsScreen.tsx      Tile calendar + Post Swap CTA
│       │   ├── OpenSwapsScreen.tsx     Available shifts to claim (role-filtered)
│       │   └── SwapHistoryScreen.tsx   Request history with status badges
│       └── manager/
│           ├── PendingApprovalsScreen.tsx  One-tap approve/deny + OT warning
│           └── LocationSettingsScreen.tsx  Workers list, OT threshold, paywall
└── functions/src/
    └── index.ts              Cloud Functions: setUserClaims, onSwapRequestWrite, revenuecatWebhook
```

## Firestore Schema

```
companies/{companyId}/
  locations/{locationId}/
    workers/{workerId}       { name, email, role, fcmToken, weeklyHoursLimit }
    shifts/{shiftId}         { workerId, start, end, role, overtimeRisk }
    swapRequests/{requestId} { shiftId, requesterId, claimantId, status, overtimeWarning,
                               createdAt, resolvedAt, history[] }
```

## Demo Mode

| Env var                          | Effect                              |
|----------------------------------|-------------------------------------|
| `EXPO_PUBLIC_DEMO_MODE=true`     | Force demo mode on                  |
| Firebase key missing/placeholder | Auto-activates demo mode            |

Demo data: 2 locations, 8 workers (Cashier + Shift Lead), 10 shifts, 3 swap requests (1 with overtime warning).
