// lib/geo.js
// City centre coordinates + bounding-box helper used by lib/satellite.js
// (NASA GIBS WMS requests need a BBOX, not just a point) and lib/waqi.js
// (station-grid fallback). This file was referenced across the codebase
// but missing from the project, which broke the build entirely.

export const CITY_COORDS = {
  Delhi: { lat: 28.6139, lon: 77.209 },
  Mumbai: { lat: 19.076, lon: 72.8777 },
  Bengaluru: { lat: 12.9716, lon: 77.5946 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  "Greater Noida": { lat: 28.4744, lon: 77.504 },
};

function cityKey(cityName) {
  return CITY_COORDS[cityName] ? cityName : "Delhi";
}

export function getCityCoords(cityName) {
  return CITY_COORDS[cityKey(cityName)];
}

// Returns a small bounding box (~0.6 deg square, ~65km) around the city
// centre — enough to frame a city-scale aerosol tile from GIBS.
export function getBounds(cityName, size = 0.3) {
  const { lat, lon } = getCityCoords(cityName);
  return {
    lat1: +(lat - size).toFixed(4),
    lon1: +(lon - size).toFixed(4),
    lat2: +(lat + size).toFixed(4),
    lon2: +(lon + size).toFixed(4),
  };
}
