# SkillSprint

Daily skill-sprint app — pick a track (Coding, Writing, Design, Critical Thinking) and complete one timed challenge per day to build your streak and XP. Built with React Native (Expo), Firebase, and a Claude-powered scoring function.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI | latest | `npm install -g eas-cli` |
| Firebase CLI | latest | `npm install -g firebase-tools` |
| iOS Simulator | Xcode 15+ | Mac only — Xcode → Simulator |

---

## Clone & Install

```bash
# From the repo root
cd apps/skillsprint
npm install
```

---

## Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `EXPO_PUBLIC_FUNCTIONS_BASE_URL` | Cloud Functions base URL (for scoring) |
| `EXPO_PUBLIC_USE_EMULATORS` | `true` to use local Firebase Emulators |

**Never commit `.env.local`.** It is gitignored.

### Demo Mode

If `EXPO_PUBLIC_FIREBASE_API_KEY` is empty or left as `REPLACE_WITH_VALUE`, the app auto-detects demo mode — no Firebase connection is made. All screens work with local fixture data.

In demo mode:
- Auth screen shows a prominent **Continue as Demo** button
- Skips onboarding and sets track to `coding`
- All screens show fixture data from `src/lib/mockData.ts`
- A **Demo Mode** banner is shown at the bottom of the screen

---

## Run the App

```bash
# Start Expo dev server (demo mode — no Firebase needed)
npm start

# Or target a specific platform
npm run ios
npm run android
```

---

## Firebase Emulators (optional)

```bash
# From apps/skillsprint/
firebase emulators:start --only auth,firestore,functions
```

Then set `EXPO_PUBLIC_USE_EMULATORS=true` in your `.env.local`.

---

## Seed Challenge Content

Populate the `challenges` Firestore collection with the 60+ launch challenges across all four tracks.

### Against the emulator (recommended for local dev)

```bash
# Start emulators first
firebase emulators:start --only firestore

# Then from apps/skillsprint/scripts/
cd scripts
npm install
npm run seed:emulator
```

### Against a real Firebase project

```bash
# Download your service account key from Firebase console →
# Project settings → Service accounts → Generate new private key
# Save it as apps/skillsprint/service-account.json (gitignored)

cd scripts
npm install
npx ts-node seedChallenges.ts
```

The script is **idempotent** — re-running it skips any challenge that already has a Firestore document with the same ID.

**Challenge breakdown:** 62 total — 16 coding (5 fill_in_blank, 6 multiple_choice, 5 code_reading), 16 design (9 multiple_choice, 7 design_critique), 15 writing (all writing_prompt), 15 critical_thinking (8 multiple_choice, 7 writing_prompt).

---

## Project Structure

```
apps/skillsprint/
├── App.tsx                  # Root component — auth setup, navigation container
├── index.ts                 # Expo entry point
├── app.json                 # Expo config (bundle IDs, plugins)
├── src/
│   ├── components/
│   │   ├── DemoBanner.tsx   # Demo mode indicator strip
│   │   └── XPBar.tsx        # XP progress bar with track accent color
│   ├── hooks/
│   │   └── useSubmitChallenge.ts  # Sprint submission + LLM scoring hook
│   ├── lib/
│   │   ├── config.ts        # isDemoMode, TRACKS (colors + labels)
│   │   ├── firebase.ts      # Firebase app/auth/db init (guarded by isDemoMode)
│   │   ├── firebaseService.ts  # Auth helpers + Firestore read/write
│   │   ├── mockData.ts      # Fixture data for demo mode
│   │   └── store.ts         # Zustand store — uid, track, xp, streak, persistence
│   ├── navigation/
│   │   └── RootNavigator.tsx  # Stack + bottom tabs with auth gate
│   └── screens/
│       ├── AuthScreen.tsx      # Email/password + Apple sign-in + Demo button
│       ├── OnboardingScreen.tsx  # Track selection (4 cards)
│       ├── HomeScreen.tsx      # Today's challenge card + streak/XP
│       ├── ActiveSprintScreen.tsx  # Timed challenge UI
│       ├── SprintResultsScreen.tsx  # Score + AI feedback
│       ├── LeaderboardScreen.tsx  # Global + friends rankings
│       ├── RivalMatchupScreen.tsx  # Weekly head-to-head
│       ├── ProfileScreen.tsx   # Stats + track selector
│       └── PaywallScreen.tsx   # Premium upgrade
└── functions/               # Cloud Functions (LLM scoring)
```

---

## iOS Build (TestFlight)

```bash
eas build --platform ios --profile preview
```

Bundle ID: `com.lemaa.skillsprint`

Apple Sign-In is enabled — ensure the capability is active in App Store Connect before submitting.
