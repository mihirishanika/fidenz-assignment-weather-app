# Weather App (React + Express)

A secure web/API app that reads city codes from `cities.json`, fetches weather data from OpenWeatherMap, caches responses for 5 minutes, and displays a responsive UI. Authentication is handled by Auth0 with JWT validation on the backend.

This repository is ready to submit as an assignment and to run locally following the steps below.

## Features
- Reads city IDs from `frontend/public/cities.json`
- Auth0-protected API (`/api/...`)
- Caching via NodeCache (5 min TTL for weather; 1h for city list)
- Responsive React UI (Add City intentionally omitted per assignment)

## Prerequisites
- Node.js 18+ (tested on 22)
- An OpenWeather API key (free tier is fine)

## Quick Start (Run locally)

1) Clone and open
```
git clone https://github.com/<your-username>/fidenz-assignment-weather-app.git
cd fidenz-assignment-weather-app
```

2) Backend (Express)
- Tech: Express, Helmet, CORS, Morgan, Auth0 JWT, NodeCache, Axios

### Configure env
Create `backend/.env` and edit values:

```
PORT=5001
NODE_ENV=development
OPENWEATHER_API_KEY=<your_openweather_key>
CITIES_JSON_PATH=../frontend/public/cities.json
# Auth0
AUTH0_AUDIENCE=https://weather-api.local
AUTH0_ISSUER_BASE_URL=https://YOUR_TENANT_DOMAIN/
```

### Install & run (backend)
```
cd backend
npm install
npm run dev
```
Backend will listen on http://localhost:5001

### API Endpoints
- Auth
	- GET `/api/auth/info` → { auth: 'handled-by-auth0' }
- Weather (Bearer token required)
	- GET `/api/weather` → array of city weather objects
	- GET `/api/weather/:id` → one city’s weather
	- GET `/api/weather/cities` → [ids]

Weather response shape (subset):
```
{
	id, name, weather, temp, tempMin, tempMax,
	pressure, humidity, visibility,
	wind: { speed, deg },
	sunrise, sunset
}
```

3) Frontend (Vite + React)
- Tech: React, React Router, Axios, Vite, Auth0 React SDK
- `vite.config.js` proxies `/api` to `http://localhost:5001` in dev

### Install & run (frontend)
```
cd frontend
npm install
npm run dev
```
Create `frontend/.env.local` with:
```
VITE_AUTH0_DOMAIN=YOUR_TENANT_DOMAIN
VITE_AUTH0_CLIENT_ID=YOUR_SPA_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://weather-api.local
```

Then open http://localhost:5173

### Using the app
1. Start backend then frontend.
2. You’ll be redirected to Auth0 to log in; after success you’ll return to `/`.
3. The dashboard shows cards for all cities in `public/cities.json`.

## Step-by-step setup & run

1) Clone the repository

```bash
git clone https://github.com/<your-username>/fidenz-assignment-weather-app.git
cd fidenz-assignment-weather-app
```

2) Create Auth0 resources
- Applications → Applications → Create Application → Single Page Web Application (SPA)
	- Note the Domain and Client ID
	- Allowed Callback URLs: `http://localhost:5173`
	- Allowed Logout URLs: `http://localhost:5173`
	- Allowed Web Origins: `http://localhost:5173`
- Applications → APIs → Create API
	- Identifier (Audience): `https://weather-api.local` (or your own unique URI)
	- Signing Algorithm: RS256

3) Enforce security policies
- Security → Multi-factor Auth → enable Email factor (MFA)
- Authentication → Database → [Your DB] → Settings → uncheck “Allow sign ups” (restrict signups)
- Authentication → Users → Create User
	- Email: `careers@fidenz.com` (or your test email)
	- Password: `Pass#fidenz` (or your chosen strong password)

4) Configure environment files
- Backend: copy example and fill values

```bash
cp backend/.env.example backend/.env
# On Windows PowerShell, copy manually if cp is unavailable
```

Edit `backend/.env`:

```
PORT=5001
OPENWEATHER_API_KEY=<your_openweather_key>
AUTH0_AUDIENCE=https://weather-api.local
AUTH0_ISSUER_BASE_URL=https://<YOUR_TENANT_DOMAIN>/  # trailing slash required
```

- Frontend: copy example and fill values

```bash
cp frontend/.env.example frontend/.env.local
# On Windows PowerShell, copy manually if cp is unavailable
```

Edit `frontend/.env.local`:

```
VITE_AUTH0_DOMAIN=<YOUR_TENANT_DOMAIN>              # e.g., dev-xxxx.us.auth0.com (no protocol)
VITE_AUTH0_CLIENT_ID=<YOUR_SPA_CLIENT_ID>
VITE_AUTH0_AUDIENCE=https://weather-api.local       # must match backend audience
```

5) Install dependencies and run

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend (in a second terminal):

```bash
cd frontend
npm install
npm run dev
```

Open the app at http://localhost:5173. If port 5173 is busy and the dev server uses 5174 instead, add `http://localhost:5174` to Auth0 Allowed Callback/Logout/Web Origins.

6) Log in and verify
- You’ll be redirected to Auth0. Log in with the pre-created user (e.g., `careers@fidenz.com`)
- Enter the MFA email code when prompted
- After redirect back, the dashboard should load weather data

7) Quick API checks (optional)
- Health (should be 200): http://localhost:5001/api/health
- Protected (should be 401 without token): http://localhost:5001/api/weather

## Submission checklist
- [ ] README includes complete setup and run instructions (this section)
- [ ] `backend/.env` configured with OpenWeather + Auth0
- [ ] `frontend/.env.local` configured with Auth0
- [ ] MFA enabled (Email), public signups disabled in Auth0
- [ ] Test user exists and can log in
- [ ] App builds and runs locally

## Caching
- Each city’s weather is cached for 5 minutes to limit calls to OpenWeather.
- The parsed list of city IDs is cached for 1 hour.

## Troubleshooting
- Blank dashboard or “No data yet” message
	- Ensure `OPENWEATHER_API_KEY` is set in `backend/.env` and restart the backend.
	- Check backend logs for startup message: `Server listening on http://localhost:5001`.
- Auth0 login issues
	- Verify your `.env.local` domain/clientId/audience and that the callback/logout URLs are configured in Auth0.
- CORS or 401 errors in DevTools
	- Confirm the `Authorization: Bearer <token>` header is present. Logging out/in refreshes it.

### Auth0 config gotchas
- The backend expects `AUTH0_ISSUER_BASE_URL` to have a trailing slash, e.g. `https://YOUR_TENANT_DOMAIN/`.
- The frontend and backend audiences must match:
  - frontend: `VITE_AUTH0_AUDIENCE`
  - backend: `AUTH0_AUDIENCE`
- Without a token, calling `GET /api/weather` should return `401 Unauthorized` (or `500` with a clear message if Auth0 env is missing). This is expected.

### Quick checklist
1. backend/.env → set `OPENWEATHER_API_KEY`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER_BASE_URL` (with trailing `/`).
2. frontend/.env.local → set `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`.
3. Restart backend; refresh frontend; sign in via Auth0.

## Clean Code & Tooling
- EditorConfig is included for consistent whitespace.
- Prettier is configured. Format code:
	- Backend: `npm run format` (from `backend`)
	- Frontend: `npm run format` (from `frontend`)
- ESLint is configured. Lint code:
	- Backend: `npm run lint` (from `backend`)
	- Frontend: `npm run lint` (from `frontend`)

## Notes
- For production, replace in-memory user storage with a database and move secrets to a secure store.
- You can change the port by editing `backend/.env` and updating the proxy in `frontend/vite.config.js`.


## Auth0: MFA + Restricted Signups

1. Create an Auth0 Application (SPA)
- Allowed Callback URLs: `http://localhost:5173`
- Allowed Logout URLs: `http://localhost:5173`
- Allowed Web Origins: `http://localhost:5173`

2. Create an Auth0 API
- Identifier (Audience): `https://weather-api.local` (or your choice)

3. Enable MFA via Email
- Auth0 Dashboard → Security → Multi-factor Auth → enable Email factor.
- Optionally enforce MFA for this application using Actions or policy settings.

4. Disable Public Signups
- Auth0 Dashboard → Authentication → Database → [Your DB] → Settings → uncheck "Allow sign ups".

5. Create Test User (example)
- Email: `careers@fidenz.com`
- Password: `Pass#fidenz`

# fidenz-assignment-weather-app
