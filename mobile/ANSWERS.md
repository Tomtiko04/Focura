
## Summary recommendations (short)

* **Email verification:** Use a **deep link → mobile app** as primary and **web fallback**. Implement universal/app links for iOS/Android so the link opens the app reliably. Also support a web verification endpoint for users who can’t open the app.
* **Password reset:** Use **deep link → mobile app reset screen** as primary, with a **web fallback**. Token lifetime: **1 hour** (secure but user-friendly).
* **Token model:** Use **short-lived JWT access token + rotating refresh token**.

  * Access token: **\~15 minutes**.
  * Refresh token: **rotate on use**, valid \~**30 days**, stored server-side (hashed) for revocation.
  * **Mobile performs silent refresh** using refresh token stored in secure device storage (Keychain / Keystore / SecureStore). Server is authoritative for refresh/rotation.

---

## 1) Verification link vs deep link — pros & cons

**Deep link (e.g., `focura://verify?token=abc123`) — Pros**

* Seamless mobile UX: opens the app and lands the user directly on the verified flow.
* Better conversion (users verify faster).
* Can deep-link to a specific screen, show onboarding next step, etc.

**Deep link — Cons**

* Needs correct OS configuration; without Universal/App Links and proper association, link may fall back to web or prompt a permission.
* Older devices or misconfiguration can break the UX.

**Web link (e.g., `https://focura.com/verify?token=abc123`) — Pros**

* Reliable across platforms and email clients.
* Easier to debug and test from a browser.
* Works for users on desktop who registered on mobile or for support flows.

**Web link — Cons**

* Requires the user to switch context if they want to use the app.
* Less seamless for mobile-first apps.

**Best practice:** Use a **deep link** as the primary target but send a **universal/app link** (iOS Universal Link / Android App Link) that:

* Opens the app if present and configured.
* Falls back to the web verification page if the app is not present or association fails.

Also include the web-only link as a fallback in the email content: “If the app doesn’t open, verify here.”

---

## 2) Deep link format & example (recommended)

**Scheme + host**

* Scheme: `focura://`
* Example deep link:

  * `focura://verify?token=eyJhbGci...`
  * or include user id: `focura://verify?token=...&uid=1234` (avoid PII in URL; prefer token only)

**Web fallback**

* `https://app.focura.com/verify?token=eyJhbGci...`

**Why domain + scheme:** Using a real `https` domain and configuring Apple/Android app association gives a single link `https://app.focura.com/verify?...` that will open the app (universal link) — best user experience.

---

## 3) React Navigation linking config (example)

Add to your `App.js` or navigation bootstrap:

```js
// mobile/src/navigation/linking.js
export default {
  prefixes: ['focura://', 'https://app.focura.com'],
  config: {
    screens: {
      VerifyEmail: 'verify',       // focura://verify?token=...
      ResetPassword: 'reset',     // focura://reset?token=...
      Home: 'home',
      // ...
    },
  },
};
```

And in your navigation container:

```js
import { NavigationContainer } from '@react-navigation/native';
import linking from './navigation/linking';

export default function App() {
  return (
    <NavigationContainer linking={linking} fallback={<Loading />}>
      {/* ... */}
    </NavigationContainer>
  );
}
```

In the verify/reset screens, read the token from `route.params` or via `Linking` (some clients put params on `initialState`).

---

## 4) Password reset: web link or deep link?

**Recommendation:** Same approach as verification — **deep link primary (universal/app link)** with **web fallback**.

**Token validity:** **1 hour** is a reasonable default (short enough for security, long enough for real users). For especially sensitive flows you can make it **15 minutes**, but 1 hour is standard and user-friendly.

**Flow:**

1. User requests reset → server generates one-time reset token (cryptographically random), stores it hashed with expiration timestamp (1 hour), and emails a universal link `https://app.focura.com/reset?token=XYZ`.
2. If user opens on mobile and app present → deep link → app reads token, shows Reset Password screen, asks for new password, posts to server `/auth/reset-password` with token + new password.
3. If user opens web fallback → web page verifies token and shows reset UI.
4. On successful reset: invalidate the token (delete / mark used), optionally issue an access token + refresh token or redirect to login.

---

## 5) Token model — JWT access + rotating refresh (details & why)

**Why not a single long-lived token?**

* Single long-lived JWT stored on device is riskier: if stolen, the attacker has long-lived access.
* It’s harder to revoke.

**Recommended:**

* **Access Token (JWT)** — short-lived (\~15 minutes).

  * Contains user id and scopes/claims.
  * Sent in `Authorization: Bearer <access_token>` with API requests.
* **Refresh Token (opaque, rotating)** — long-ish life (\~30 days), stored securely (not accessible to JS if web; on mobile store in secure storage).

  * When the app needs a new access token, it calls `/auth/refresh` with the refresh token.
  * **Rotation**: on refresh, the server issues a new refresh token and invalidates the old one (server stores hashes). This prevents reuse and gives you a way to revoke.
  * Store only the current refresh token server-side (store its hash), so you can revoke sessions.

**Token lifetimes (suggested):**

* Access token: **15 minutes**.
* Refresh token: **30 days** (or longer if you want "remember me"; shorter if you are conservative).
* Email verification token: **24 hours**.
* Password reset token: **1 hour**.

**Storage on mobile:**

* Use Secure storage:

  * **iOS Keychain**, **Android EncryptedSharedPreferences/Keystore**, or Expo `SecureStore`.
* Do **not** store refresh tokens in AsyncStorage or insecure storage because they can be exfiltrated.

**Refresh approach: mobile vs server**

* **Mobile should do silent refresh**:

  * When access token expires (401), app calls `/auth/refresh` with the refresh token and receives a new access token (and a new refresh token if using rotation).
  * If refresh fails (expired or revoked), the app forces re-login.
* **Server-side session maintenance**:

  * The server keeps a DB of valid refresh tokens (hashes) with metadata (device, ip, createdAt, revoked).
  * For extra security, tie refresh tokens to device ids or user agent strings, or use `fingerprint`.
  * Implement refresh token **rotation** so stolen tokens can't be reused (on detection of reuse, revoke all sessions).

**Endpoint examples**

* `POST /auth/login` → returns `{ accessToken, refreshToken }`
* `POST /auth/refresh` → body: `{ refreshToken }` → returns `{ accessToken, refreshToken }` and server rotates
* `POST /auth/logout` → invalidates refresh token server-side
* `POST /auth/verify-email` → body: `{ token }` or GET `/auth/verify?token=...`
* `POST /auth/reset-password` → body: `{ token, newPassword }`

**Token DB model (refresh tokens)**

```js
{
  id: ObjectId,
  userId: ObjectId,
  tokenHash: String,
  createdAt: Date,
  expiresAt: Date,
  revoked: Boolean,
  deviceInfo: { platform, name, ip },
}
```

Store only the hash of the refresh token (bcrypt or other secure hash). Compare hashes upon refresh.

---

## 6) Security tips & best practices

* Use **HTTPS** for all endpoints (required).
* Make tokens cryptographically strong (high entropy).
* For email links, include only the token — don't include sensitive data.
* Hash tokens before saving in DB (so DB leak won’t expose usable tokens).
* When verifying email or resetting password, **invalidate the token once used**.
* Use **rate limiting** on `/auth/forgot-password` and `/auth/login`.
* Add **device/session listing** with ability for user to revoke sessions (logout everywhere).
* Consider **CAPTCHA** on password reset requests to prevent abuse.
* Log security events (token reuse, multiple failed refresh attempts) and notify user of suspicious activity.

---

## 7) Example verification + reset flows (server-side)

**Email verification (typical)**

1. User signs up → Server creates user in DB (inactive) + creates `verificationToken = crypto.randomBytes(32).toString('hex')`, store `hash(verificationToken)` with `expiresAt = now + 24h`.
2. Email link: `https://app.focura.com/verify?token=VERIFICATION_TOKEN`.
3. User clicks → if app opens, deep link → app calls backend `POST /auth/verify-email { token }`. Server finds the hashed token, if valid set `user.verified = true` and delete token.

**Reset password (typical)**

1. User requests reset → Server creates `resetToken` and stores hash with expiry 1 hour.
2. Email link: `https://app.focura.com/reset?token=RESET_TOKEN`
3. User opens link → deep link loads Reset screen in app → user sets new password → app calls `POST /auth/reset-password { token, newPassword }`. Server validates token, update password (hashed), delete token, and optionally issue access+refresh tokens.

---


Implement auth verification + reset flows with deep linking and token rotation.

Details:
- Email verification token: random 32-byte token, stored as hash server-side, expiry 24 hours.
- Reset token: random 32-byte token, stored as hash, expiry 1 hour.
- Send emails with a universal link: https://app.focura.com/verify?token=... (configure iOS Universal Links & Android App Links; also support focura:// scheme).
- React Navigation linking prefixes: ['focura://', 'https://app.focura.com'] and mapping 'verify' -> VerifyEmail screen, 'reset' -> ResetPassword.
- Token model: Short-lived JWT access token (15 minutes) + rotating refresh token (30 days). Server stores refresh token hashes for revocation.
- On refresh: POST /auth/refresh { refreshToken } → server validates, rotates token (issue new refreshToken + invalidate old), return new access token.
- Mobile stores refresh token securely (SecureStore/Keychain), uses it for silent refresh when access token expires, and handles refresh failures by sending user to login.
- Add endpoints: /auth/verify (POST) and /auth/reset-password (POST) that accept tokens from deep link.




# ✅ Summary recommendations (short)

* **Store onboarding completion** in **both** client (AsyncStorage) and server (`users.onboarding.completed`).
* **Authoritative source on next login:** **Server wins**, but client changes made offline are queued and attempted to push on reconnect. Use **timestamps** to merge safely.
* **AsyncStorage** is okay for session, prefs, and small items — but **use SQLite (or Realm/WatermelonDB)** for tasks and complex offline caching.
* Persist extra local items: tasks, pending-sync queue, scheduled notification IDs, attachments, lastSyncAt, device id.
* Implement **GET /api/users/me/preferences** and **PATCH /api/users/me/preferences** and always attempt best-effort push on save; store locally first.
* I’ll provide minimal email templates if you don’t have branding assets.
* **Security:** Enforce a practical password policy (min 8 chars + diversity), require rate limiting and abuse protections (CAPTCHA on forgot/reset), and use standard token lifetimes & secure storage.

---

## 1) Onboarding gating — authoritative & sync rules

### Where to store

* **Server:** `users.onboarding.completed` (boolean), `users.preferences.notifications` (object).
* **Client:** AsyncStorage key (e.g. `focura:onboarding_completed`) and local copy of `notification_prefs`.

### Behavior & rules

1. **Write flow (user finishes onboarding while online):**

   * Save locally (AsyncStorage).
   * Attempt `PATCH /api/users/me/preferences` and `PATCH /api/users/me/onboarding` (or include onboarding flag in same preferences call).
   * If server responds OK → done.

2. **Offline writes (user toggles in onboarding/settings while offline):**

   * Save locally.
   * Add an item to a **pending sync queue**: `{ type: 'prefs:update', payload, ts: now }`.
   * On next successful network connectivity, process queue in FIFO order, calling server endpoints.

3. **On next login (client reconnects and fetches server state):**

   * Fetch server prefs & onboarding flag (`GET /api/users/me/preferences`).
   * Compare server vs local using `lastUpdatedAt` timestamps on both sides.
   * **Authoritative rule:**

     * If local `lastUpdatedAt > server.lastUpdatedAt` → client is newer → push local change to server.
     * Else → server is newer → overwrite local with server value.
   * If both changed offline on multiple devices and conflict cannot be resolved (rare), show lightweight UI: “We detected a change on another device. Use server version or keep my local settings?” (Keep this prompt minimal — you can usually avoid user prompts by trusting timestamps).

### Data model suggestion for preferences

```json
{
  "notificationPrefs": { /* full prefs object */ },
  "onboarding": {
    "completed": true,
    "lastUpdatedAt": "2025-08-19T09:30:00Z"
  },
  "preferencesLastUpdatedAt": "2025-08-19T09:30:00Z"
}
```

---

## 2) Offline-first data: AsyncStorage vs SQLite (which to use)

### AsyncStorage

* **Good for:** small key/value items: session token, user profile, flags (onboarding), small prefs, scheduled notification IDs map.
* **Not good for:** many tasks, complex queries, relational structures, robust sync operations.

### Use SQLite / or Realm / WatermelonDB for tasks

* **Recommendation:** Use a lightweight SQL layer for tasks caching and offline CRUD:

  * **Expo / React Native choices:**

    * `expo-sqlite` (built-in) or `react-native-sqlite-storage` — low dependency and good for structured data.
    * **WatermelonDB** — great if you expect many records and need performance & sync patterns (but heavier to set up).
    * **Realm** — excellent for complex offline-first with live objects and sync (but larger binary).
  * For MVP: **SQLite (expo-sqlite)** is sufficient and simpler to implement.

### What to persist locally besides session & prefs

* `session`: secure storage of refresh token (SecureStore / Keychain on mobile).
* `user`: user profile basic data (id, name, email).
* `onboarding` flag.
* `notificationPrefs`.
* `tasks` (full task records for offline CRUD).
* `pendingSyncQueue` (edits created/updated/deleted offline that need to be pushed).
* `scheduledNotificationsMap`: mapping `taskId -> { beforeId, atStartId, atEndId }` for cancel/reschedule.
* `attachments/ocrImages`: optionally, local cache of snapped images before upload.
* `lastSyncAt` timestamp and deviceId for conflict handling.

---

## 3) Notification prefs sync – API & semantics

### APIs to implement

* `GET /api/users/me/preferences`

  * Response includes `notificationPrefs`, `onboarding.completed`, `lastUpdatedAt`.
* `PATCH /api/users/me/preferences`

  * Body: `{ notificationPrefs, onboarding?, lastUpdatedAt? }`
  * Server checks incoming `lastUpdatedAt`: if client is newer, accept and update `lastUpdatedAt` to server now. If server is newer, return `409 Conflict` with server copy or return server version and a `conflict: true` flag.

**Example PATCH flow (best-effort):**

1. Client saves locally (AsyncStorage) with `lastUpdatedAt = now`.
2. Client POSTs `PATCH /api/users/me/preferences` with the new prefs and `clientLastUpdatedAt`.
3. Server compares with server `preferencesLastUpdatedAt`:

   * If `clientLastUpdatedAt >= server` → write server prefs and respond 200 with new server `lastUpdatedAt`.
   * Else → respond 409 with server value (client should refresh local from server or offer merge).

### Client behavior

* Always **store locally first** and schedule a best-effort push. The app should work regardless of server success.
* If server responds 409, the client should handle it by:

  * Overwriting local with server value (safe default) or
  * If local was user-initiated and more important, present a simple conflict dialog (rare for preferences).

---

## 4) Email templates / branding

* If you don’t have branded templates, I can create **minimal, clear, production-safe templates**. Include both verification and reset emails and include both the universal link and deep-link fallback.

### Minimal verification email template (plaintext + HTML)

**Subject:** Verify your Focura account
**Plaintext:**

```
Hi {{name}},

Welcome to Focura! Click the link below to verify your email and activate your account:

https://app.focura.com/verify?token={{token}}

If that link doesn’t open the app, open the Focura app and use the following code: {{token}}

Thanks,
The Focura Team
```

**HTML:** include same link and a small branded header and button. Also add fallback text: “If the app doesn’t open, click the web link.”

### Minimal reset email

**Subject:** Reset your Focura password
**Plaintext:**

```
Hi {{name}},

We received a request to reset your Focura password. Click the link below to reset it. This link expires in 1 hour.

https://app.focura.com/reset?token={{token}}

If you didn't request this, ignore this email.

Thanks,
Focura Security
```

I can produce styled HTML versions if you want logos/brand colors.

---

## 5) Security: password policy & rate limiting

### Password policy (practical & user-friendly)

* **Minimum length:** 8 characters (12 recommended for encouraged complexity).
* **Complexity:** require at least **one uppercase**, **one lowercase**, **one digit**. Symbol optional (encourage strong password).
* **Password strength meter** in UI (use zxcvbn) and enforce a minimal score (e.g., score ≥ 2).
* **Optional:** require password reuse prevention (hash check) or enforce rotation after compromise.

**Server validation example (JS):**

```js
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
if (!passwordRegex.test(password)) {
  // reject: min 8, at least 1 uppercase, 1 lowercase, 1 digit
}
```

### Rate limiting & abuse protections

* **Rate limit endpoints**: `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` with per-IP and per-account thresholds:

  * Example: `login` limit: 10 attempts per 10 minutes per IP and 5 per account per 10 minutes.
  * `forgot-password`: 3 requests per hour per email or per IP.
  * `register`: 5 per hour per IP.
* **Account lockout** after N failed attempts (e.g., 10) for a brief period (e.g., 15 minutes).
* **Captcha** on repeated forgot-password requests or when suspicious patterns occur.
* **Email throttling** (prevent email spam) and queue with retry/backoff.
* **Logging & alerts** for suspicious behavior (multiple resets, token reuse).
* **Hash tokens** (password reset, verify) in DB; store only hashed token value (e.g., HMAC or bcrypt) for verification.

---

## 6) Implementation checklist / endpoints & local storage summary

### API endpoints (summary)

* `GET /api/users/me/preferences`
* `PATCH /api/users/me/preferences`  // includes onboarding flag optional
* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/refresh`
* `POST /api/auth/verify` (token)
* `POST /api/auth/forgot-password`
* `POST /api/auth/reset-password` (token + new password)

### Client local storage keys

* `focura:session` → access/refresh token metadata (refresh in SecureStore)
* `focura:user` → basic profile
* `focura:onboarding_completed` → boolean + lastUpdatedAt
* `focura:notification_prefs`
* `focura:tasks` → SQLite table
* `focura:pending_sync_queue` → list of pending actions
* `focura:scheduled_notifications` → map taskId -> scheduled ids
* `focura:lastSyncAt` → timestamp

---

## 7) Conflict resolution examples (concrete)

* **Scenario A (client offline toggles reminders; server unchanged):**

  * Client writes local & queues update.
  * On reconnect, client sees server timestamp older → client pushes update, server accepts.

* **Scenario B (client and server both changed):**

  * Compare timestamps.
  * If server newer → overwrite local & notify user briefly (“Updated from another device” toast).
  * If client newer → push to server.
  * If same timestamp collision → server wins or prompt user (rare).




