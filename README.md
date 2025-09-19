# Weather App (React + Express)

A secure web/API app that reads city codes from `cities.json`, fetches weather data from OpenWeatherMap, caches responses for 5 minutes, and displays a responsive UI. Includes simple auth (register/login) powered by JWT.

## Features
- Reads city IDs from `frontend/public/cities.json`
- JWT-protected API (`/api/...`)
- Caching via NodeCache (5 min TTL for weather; 1h for city list)
- Responsive React UI (Add City intentionally omitted per assignment)

## Prerequisites
- Node.js 18+ (tested on 22)
- An OpenWeather API key (free tier is fine)

## 1) Backend (Express)
- Tech: Express, Helmet, CORS, Morgan, JWT, bcrypt, NodeCache, Axios

### Configure env
Copy `backend/.env.example` to `backend/.env` and edit values:

```
PORT=5001
NODE_ENV=development
JWT_SECRET=replace-with-strong-secret
OPENWEATHER_API_KEY=<your_openweather_key>
CITIES_JSON_PATH=../frontend/public/cities.json
```

### Install & run
```
cd backend
npm install
npm run dev
```
Backend will listen on http://localhost:5001

### API Endpoints
- Auth
	- POST `/api/auth/register` → { token }
	- POST `/api/auth/login` → { token }
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

## 2) Frontend (Vite + React)
- Tech: React, React Router, Axios, Vite
- `vite.config.js` proxies `/api` to `http://localhost:5001` in dev

### Install & run
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Using the app
1. Start backend then frontend.
2. Go to `/login`. Enter an email and password (≥ 6 chars).
	 - Convenience: If login returns 401, the UI will auto-register then log you in.
3. After login, the dashboard shows cards for all cities in `public/cities.json`.

## Caching
- Each city’s weather is cached for 5 minutes to limit calls to OpenWeather.
- The parsed list of city IDs is cached for 1 hour.

## Troubleshooting
- Blank dashboard or “No data yet” message
	- Ensure `OPENWEATHER_API_KEY` is set in `backend/.env` and restart the backend.
	- Check backend logs for startup message: `Server listening on http://localhost:5001`.
- Invalid credentials
	- Users are in-memory. After a backend restart, re-register or just click Login (auto-registers on 401).
- CORS or 401 errors in DevTools
	- Confirm the `Authorization: Bearer <token>` header is present. Logging out/in refreshes it.

## Notes
- For production, replace in-memory user storage with a database and move secrets to a secure store.
- You can change the port by editing `backend/.env` and updating the proxy in `frontend/vite.config.js`.

# fidenz-assignment-weather-app