# SplitTab

Split restaurant bills with friends. Host scans a receipt, shares a QR code, guests claim items, everyone sees what they owe.

## Demo Mode

No Firebase setup needed. Missing `VITE_FIREBASE_API_KEY` (or set to placeholder) activates demo mode automatically — pre-loaded with a 3-person session at The Rustic Table.

## Local Dev Setup

```bash
# From repo root
npm install

# Copy env template
cp apps/splittab/.env.example apps/splittab/.env.local
# Edit .env.local with your Firebase project credentials

# Start Firebase Emulators (in a separate terminal)
cd apps/splittab
npx firebase emulators:start

# Start dev server
npm run dev --workspace=splittab
```

## Firebase Project Setup

1. Create a Firebase project at console.firebase.google.com
2. Enable: **Anonymous Auth**, **Firestore**, **Storage**, **Cloud Functions**
3. Copy your Firebase config into `.env.local`
4. Set `VITE_USE_EMULATORS=true` for local dev

## Cloud Functions

The OCR function requires your Anthropic API key in Firebase Secret Manager:

```bash
cd apps/splittab
firebase secrets:set ANTHROPIC_API_KEY
# paste your Anthropic API key when prompted

# Build and deploy functions
cd functions && npm install && npm run build
firebase deploy --only functions
```

## Firestore Indexes

No composite indexes required for MVP.

## Deploy

```bash
# Build the app
npm run build --workspace=splittab

# Deploy to Firebase Hosting
cd apps/splittab
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| PWA | vite-plugin-pwa + Workbox |
| Styling | Tailwind CSS (orange brand) |
| State | Zustand (client) + Firestore onSnapshot (real-time) |
| Backend | Firebase: Auth (anonymous), Firestore, Storage, Cloud Functions |
| OCR | Claude Vision API (`claude-sonnet-4-6`) via Cloud Function |
| QR | `qrcode` npm package |
| Payments | Venmo deep-links only — no charge capture |

## Screens

### Host Flow
- `/` — Upload receipt (camera or file picker)
- `/session/:id/scan` — AI OCR in progress
- `/session/:id/edit` — **Always shown** — review/correct items + enter tax/tip
- `/session/:id/qr` — QR code + live guest counter
- `/session/:id/claims` — Real-time view of who claimed what
- `/session/:id/summary` — Per-person totals + Venmo links

### Guest Flow (zero install)
- `/join/:sessionId` — Enter name + optional Venmo handle
- `/join/:sessionId/claim` — Tap to claim items (real-time)
- `/join/:sessionId/pay` — Your total + payment link

## iOS Notes

Camera in PWA requires iOS 16.4+. On older iOS, the file picker fallback is used automatically.
