## Focura Backend

This is the Express + MongoDB backend for Focura.

### Scripts
- `npm run dev` – start dev server (nodemon)
- `npm start` – start production server
- `npm test` – run Jest tests

### Environment variables
- `MONGODB_URI` – MongoDB connection string (default: `mongodb://localhost:27017/focura`)
- `JWT_SECRET` – required for JWT signing
- `ACCESS_TTL_MIN` – access token TTL in minutes (default: 15)
- `REFRESH_TTL_DAYS` – refresh token TTL in days (default: 30)
- `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_FROM` – SMTP for emails
- `BACKEND_PUBLIC_URL` – public base URL of this backend (used in emails). Dev default: `http://localhost:4000`
- `APP_SCHEME` – deep link scheme (default: `focura`)
- `APP_UNIVERSAL_LINK_BASE` – universal links base (optional for dev)
- `WEB_BASE_URL` – web app base (optional)
- `APP_VERIFY_REDIRECT` – deep link to open app after verifying (default: `focura://verified`)
- `CLIENT_ORIGIN` – CORS allowlist origin (default: `http://localhost:8081`)

In tests, you can set `EMAIL_DISABLE=true` to skip real SMTP.

### Base URLs
- API base: `http://localhost:4000`
- Health: `GET /api/health`

---

## API

### Auth
- `POST /api/auth/register`
  - body: `{ name?: string, email: string, password: string }`
  - 201 → `{ message }` and sends verification email (24h expiry)

- `GET /api/auth/verify?token=...`
  - Verifies email token; returns a small HTML page with "Open the app" button

- `POST /api/auth/login`
  - body: `{ email: string, password: string }`
  - requires verified email
  - 200 → `{ accessToken, refreshToken, user }`

- `POST /api/auth/refresh`
  - body: `{ refreshToken }`
  - rotates refresh token
  - 200 → `{ accessToken, refreshToken }`

- `POST /api/auth/logout`
  - body: `{ refreshToken }` → revokes the token
  - 200 → `{ ok: true }`

- `POST /api/auth/forgot-password`
  - body: `{ email }` → always 200; sends reset email (1h expiry)

- `GET /api/auth/reset?token=...`
  - Minimal web form (HTML) for resetting password

- `POST /api/auth/reset-password`
  - body: `{ token, password }`
  - 200 → `{ message }` and revokes all refresh tokens

### Users
- `GET /api/users/me/preferences` (auth: Bearer access token)
  - 200 → `{ notifications: {...}, onboarding: {...} }`

- `PATCH /api/users/me/preferences` (auth)
  - body: `{ notifications?: { enabled?: boolean, dailySummary?: boolean, timeOfDay?: string }, onboarding?: { completed?: boolean } }`
  - 200 → updated prefs

### Tasks
Existing task routes remain (not covered here; see `src/routes/tasks.js`).

---

## Testing
We use Jest + Supertest + mongodb-memory-server. package.json already contains scripts and Jest config.

### Quick start
1) Install dev deps:
```
npm i -D jest supertest mongodb-memory-server cross-env
```

2) Create `tests/` with the following files:
- `tests/setup.js`: global test setup/teardown
- `tests/utils/testServer.js`: spins up in-memory MongoDB and exports `app`, `mongoose`, helpers
- `tests/auth.test.js`: auth flow tests (register → verify → login → refresh → logout → reset)
- `tests/users.test.js`: preferences GET/PATCH tests
- `tests/tasks.test.js`: example test for an existing task route (optional)

3) Run:
```
EMAIL_DISABLE=true BACKEND_PUBLIC_URL=http://localhost:4000 npm test
```

### Notes
- Verification and reset emails are disabled in tests via `EMAIL_DISABLE=true`.
- Tests hit `GET /api/auth/verify` directly using the raw token generated during registration.

---

## cURL examples

Register:
```
curl -X POST http://localhost:4000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{"email":"user@example.com","password":"P@ssw0rd!","name":"User"}'
```

Login:
```
curl -X POST http://localhost:4000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"user@example.com","password":"P@ssw0rd!"}'
```

Refresh:
```
curl -X POST http://localhost:4000/api/auth/refresh \
 -H "Content-Type: application/json" \
 -d '{"refreshToken":"<token>"}'
```

Verify (web):
```
open "http://localhost:4000/api/auth/verify?token=<token>"
