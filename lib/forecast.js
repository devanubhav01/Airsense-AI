// lib/forecast.js
// AirSense AI's forecast fusion layer.
//
// Fuses a cached/baseline AQI with live meteorological signals (wind speed,
// humidity, precipitation) into a 7-day outlook. Low wind + high humidity
// traps particulates near the surface (AQI trends worse); strong wind or
// rain disperses/washes them out (AQI trends better). This is what makes
// the forecast a genuine sensor+weather fusion instead of a pass-through
// of a single provider's numbers — and matches the shape returned by
// lib/fallback-data.js so the UI never has to branch on live vs. cached.
//
// This file was imported by app/api/city/[name]/route.js and
// app/api/cron/alerts/route.js but was missing from the project, which
// broke the production build entirely.

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dispersionAdjustment(dayWeather) {
  if (!dayWeather) return 0;
  let adj = 0;

  if (dayWeather.windSpeed != null) {
    if (dayWeather.windSpeed < 6) adj += 0.07;
    else if (dayWeather.windSpeed > 18) adj -= 0.07;
  }
  if (dayWeather.humidity != null && dayWeather.humidity > 70) adj += 0.04;
  if (dayWeather.precipitation != null && dayWeather.precipitation > 2) adj -= 0.06;

  return Math.max(-0.15, Math.min(0.15, adj));
}

export function buildHybridForecast({ currentAQI, waqiForecast, weather }) {
  const baseline =
    Array.isArray(waqiForecast) && waqiForecast.length
      ? waqiForecast
      : DAY_LABELS.map((day, i) => ({ day, aqi: currentAQI }));

  const daily = weather?.daily;

  return baseline.slice(0, 7).map((point, i) => {
    const dayWeather = daily
      ? {
          windSpeed: daily.windSpeed?.[i],
          humidity: daily.humidity?.[i],
          precipitation: daily.precipitation?.[i],
        }
      : null;

    const baselineAQI = Number(point.aqi ?? currentAQI) || 0;
    const adjustment = dispersionAdjustment(dayWeather);
    const fusedAqi = Math.max(0, Math.min(500, Math.round(baselineAQI * (1 + adjustment))));
    const confidence = Math.max(55, Math.round(92 - i * 5 - (dayWeather ? 0 : 8)));

    return {
      day: point.day || DAY_LABELS[i] || `Day ${i + 1}`,
      date: point.date || daily?.dates?.[i] || null,
      aqi: fusedAqi,
      baselineAQI,
      weatherAdjustment: Math.round(adjustment * 100),
      confidence,
    };
  });
}
