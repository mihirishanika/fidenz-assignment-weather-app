import fs from 'fs';
import path from 'path';
import axios from 'axios';
import NodeCache from 'node-cache';

// Cache with 5 minutes default TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

function readCities() {
  // Allow overriding path via env (works when frontend serves cities.json from public)
  const possible = [
    process.env.CITIES_JSON_PATH,
    path.join(process.cwd(), 'cities.json'),
    path.join(process.cwd(), '..', 'frontend', 'public', 'cities.json')
  ].filter(Boolean);

  for (const p of possible) {
    try {
      const file = fs.readFileSync(p, 'utf-8');
      const json = JSON.parse(file);
      return json.List.map((c) => c.CityCode);
    } catch (e) {
      // try next path
    }
  }
  throw new Error('cities.json not found. Set CITIES_JSON_PATH or place one in backend folder.');
}

export async function getCityIds() {
  const key = 'cityIds';
  let ids = cache.get(key);
  if (!ids) {
    ids = readCities();
    cache.set(key, ids, 3600); // cache ids for 1h
  }
  return ids;
}

export async function fetchWeatherById(id) {
  const cacheKey = `w:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw Object.assign(new Error('OPENWEATHER_API_KEY missing'), { status: 500 });

  const url = `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}&units=metric`;
  let data;
  try {
    ({ data } = await axios.get(url, { timeout: 10_000 }));
  } catch (err) {
    // Normalize axios errors to meaningful messages
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      const e = new Error('OpenWeather API key invalid or unauthorized');
      e.status = 502;
      throw e;
    }
    if (status === 429) {
      const e = new Error('OpenWeather rate limit exceeded (HTTP 429)');
      e.status = 502;
      throw e;
    }
    if (status === 404) {
      const e = new Error(`City id ${id} not found at OpenWeather`);
      e.status = 404;
      throw e;
    }
    const e = new Error('Failed to fetch data from OpenWeather');
    e.status = 502;
    throw e;
  }
  // Normalize the minimal fields required by assignment
  const normalized = {
    id: data.id,
    name: data.name,
    weather: data.weather?.[0]?.description ?? 'N/A',
    temp: data.main?.temp ?? null,
    tempMin: data.main?.temp_min ?? null,
    tempMax: data.main?.temp_max ?? null,
    pressure: data.main?.pressure ?? null,
    humidity: data.main?.humidity ?? null,
    visibility: data.visibility ?? null,
    wind: {
      speed: data.wind?.speed ?? null,
      deg: data.wind?.deg ?? null
    },
    sunrise: data.sys?.sunrise ?? null,
    sunset: data.sys?.sunset ?? null,
    raw: data
  };
  cache.set(cacheKey, normalized); // 5 min TTL by default
  return normalized;
}

export async function fetchAllWeather() {
  const ids = await getCityIds();
  // Run parallel with Promise.allSettled to handle failures gracefully
  const results = await Promise.allSettled(ids.map((id) => fetchWeatherById(id)));
  const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  if (ok.length === 0) {
    // Bubble up a representative error if everything failed
    const firstRej = results.find((r) => r.status === 'rejected');
    if (firstRej && firstRej.reason) {
      throw firstRej.reason;
    }
  }
  return ok;
}
