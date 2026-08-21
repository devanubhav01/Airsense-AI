// lib/weather.js
// Real weather data via Open-Meteo (free, no API key required).
// Shape matches lib/fallback-data.js so callers can treat live and
// fallback weather identically: { current: {...}, daily: {...}, source }.
// This file was imported by app/api/city/[name]/route.js and
// app/api/cron/alerts/route.js but was missing from the project, which
// broke the production build entirely.

import { getCityCoords } from "./geo";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather(cityName) {
  const { lat, lon } = getCityCoords(cityName);

  const url =
    `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,cloud_cover` +
    `&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max,precipitation_sum` +
    `&forecast_days=7&timezone=auto`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let res;
  try {
    res = await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new Error(`Open-Meteo weather fetch failed: ${res.status}`);
  }

  const json = await res.json();
  const current = json.current || {};
  const daily = json.daily || {};

  return {
    current: {
      temperature: current.temperature_2m ?? null,
      humidity: current.relative_humidity_2m ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      pressure: current.surface_pressure ?? null,
      cloudCover: current.cloud_cover ?? null,
    },
    daily: {
      dates: daily.time || [],
      temperatureMax: daily.temperature_2m_max || [],
      temperatureMin: daily.temperature_2m_min || [],
      humidity: daily.relative_humidity_2m_mean || [],
      windSpeed: daily.wind_speed_10m_max || [],
      precipitation: daily.precipitation_sum || [],
    },
    source: "Open-Meteo",
  };
}
