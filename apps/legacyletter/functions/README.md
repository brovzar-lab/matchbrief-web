# LegacyLetter Cloud Functions

Firebase Functions (Node 20 / TypeScript) for the LegacyLetter app.

## Functions

| Name | Trigger | Purpose |
|------|---------|---------|
| `scheduleLegacyDelivery` | PubSub schedule (every 60 min) | Query scheduled legacies, send via SendGrid, mark delivered |
| `onLegacyCreate` | Firestore onCreate | Enforce free-tier quota; write notification on violation |
| `revenueCatWebhook` | HTTPS | Sync RevenueCat subscription events to Firestore |

## Environment variables

### SendGrid API key

The function reads `SENDGRID_API_KEY` from the process environment. In Firebase Functions v1 this is set via Firebase Functions config:

```bash
firebase functions:config:set sendgrid.api_key="SG.YOUR_KEY_HERE"
```

Firebase automatically exposes config values as `process.env.SENDGRID_API_KEY` at runtime.

To verify the config is set:

```bash
firebase functions:config:get
```

### RevenueCat webhook secret

```bash
firebase functions:config:set revenuecat.webhook_secret="YOUR_SECRET"
```

Set the matching webhook URL in the RevenueCat dashboard under **Project → Integrations → Webhooks**:

```
https://<region>-<project-id>.cloudfunctions.net/revenueCatWebhook
```

### Local `.runtimeconfig.json` (for emulator)

Create `functions/.runtimeconfig.json` (gitignored) for local emulator runs:

```json
{
  "sendgrid": {
    "api_key": "SG.your-local-key"
  },
  "revenuecat": {
    "webhook_secret": "local-secret"
  }
}
```

Firebase Functions emulator loads this file automatically and sets the corresponding `process.env.*` variables.

## Development

### Install dependencies

```bash
cd apps/legacyletter/functions
npm install
```

### Build

```bash
npm run build
# or watch mode:
npm run watch
```

### Type-check only

```bash
npm run typecheck
```

## Running the emulator suite

From `apps/legacyletter/`:

```bash
firebase emulators:start
```

This starts Auth (9099), Firestore (8080), Storage (9199), Functions (5001), PubSub (8085), and the Emulator UI.

### Triggering `scheduleLegacyDelivery` manually in the emulator

The Functions emulator exposes a REST endpoint for PubSub-scheduled functions:

```bash
curl -X POST \
  "http://localhost:5001/legacyletter-dev/us-central1/scheduleLegacyDelivery" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Integration test

After starting the emulators, build and run the delivery test script:

```bash
npm run build
FIRESTORE_EMULATOR_HOST=localhost:8080 node lib/test-delivery.js
```

The script:
1. Seeds a Firestore emulator doc (`status: scheduled`, `deliveryDate: now − 1 h`)
2. Calls `runDelivery()` directly (SendGrid `send` is mocked)
3. Verifies the doc status flips to `delivered`
4. Verifies `sgMail.send` was called exactly once
5. Verifies the idempotency guard blocks a second send on re-run
6. Verifies a future-dated legacy is not delivered prematurely

## Deployment

```bash
firebase deploy --only functions
```

Requires the Firebase project to be selected (`firebase use <project-id>`).

## Security notes

- Never commit `sendgrid.api_key`, `revenuecat.webhook_secret`, or `.runtimeconfig.json` to version control.
- Signed Storage URLs are generated server-side (7-day expiry) and never stored in Firestore.
- The RevenueCat webhook validates the `Authorization: Bearer <secret>` header before processing events.
