// Stable fallback snapshots used when external AQI/station/satellite services are unavailable.
// These are intentionally older snapshots so the dashboard never renders an empty state.
// Keep the status label as "cached/fallback" in the UI/API; do not present these as live observations.

const SNAPSHOT_AT = new Date("2026-08-18T09:30:00.000Z");

export const BASE = {
  Delhi: { aqi: 176, pm25: 82, pm10: 141, no2: 41, so2: 9, co: 11, o3: 28 },
  Mumbai: { aqi: 119, pm25: 56, pm10: 91, no2: 29, so2: 7, co: 8, o3: 34 },
  Bengaluru: { aqi: 88, pm25: 38, pm10: 62, no2: 21, so2: 5, co: 6, o3: 31 },
  Kolkata: { aqi: 153, pm25: 71, pm10: 118, no2: 36, so2: 8, co: 9, o3: 25 },
  Chennai: { aqi: 104, pm25: 48, pm10: 77, no2: 24, so2: 6, co: 7, o3: 37 },
  "Greater Noida": { aqi: 188, pm25: 91, pm10: 153, no2: 44, so2: 10, co: 12, o3: 24 },
};

const OFFSETS = [
  [-0.055, -0.065, 12],
  [-0.025, 0.030, -8],
  [0.010, -0.020, 5],
  [0.038, 0.045, 17],
  [0.062, -0.010, -14],
  [-0.045, 0.058, 9],
  [0.018, 0.070, -4],
  [0.072, 0.032, 7],
];

export const FALLBACK_SNAPSHOTS = {
  Delhi: { lat: 28.6139, lon: 77.2090 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  "Greater Noida": { lat: 28.4744, lon: 77.5040 },
};

function cityKey(cityName) {
  return FALLBACK_SNAPSHOTS[cityName] ? cityName : "Delhi";
}

export function getFallbackSnapshot(cityName) {
  const key = cityKey(cityName);
  const geo = FALLBACK_SNAPSHOTS[key];
  const base = BASE[key];

  const stations = OFFSETS.map(([dLat, dLon, delta], index) => ({
    uid: `fallback-${key.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`,
    lat: Number((geo.lat + dLat).toFixed(5)),
    lon: Number((geo.lon + dLon).toFixed(5)),
    aqi: Math.max(20, Math.min(500, base.aqi + delta)),
    station: `${key} monitoring station ${index + 1}`,
  }));

  const forecast7Day = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    date: null,
    aqi: Math.max(20, Math.min(500, base.aqi + [0, 7, -4, 11, 4, -8, 5][i])),
    baselineAQI: base.aqi,
    weatherAdjustment: 0,
    confidence: 76,
  }));

  return {
    name: key,
    aqi: base.aqi,
    pollutants: {
      pm25: base.pm25,
      pm10: base.pm10,
      no2: base.no2,
      so2: base.so2,
      co: base.co,
      o3: base.o3,
    },
    forecast7Day,
    weather: {
      current: {
        temperature: 29,
        humidity: 61,
        windSpeed: 9,
        pressure: 1007,
        cloudCover: 34,
      },
      daily: {
        dates: [],
        temperatureMax: [],
        temperatureMin: [],
        humidity: [],
        windSpeed: [],
        precipitation: [],
      },
      source: "AirSense cached snapshot",
    },
    stations,
    stationName: `${key} cached monitoring snapshot`,
    snapshotAt: SNAPSHOT_AT,
  };
}
