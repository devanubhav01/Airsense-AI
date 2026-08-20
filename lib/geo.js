export const CITY_GEO = {
  Delhi: { lat: 28.6139, lon: 77.2090, radius: 0.22 },
  Mumbai: { lat: 19.0760, lon: 72.8777, radius: 0.18 },
  Bengaluru: { lat: 12.9716, lon: 77.5946, radius: 0.16 },
  Kolkata: { lat: 22.5726, lon: 88.3639, radius: 0.16 },
  Chennai: { lat: 13.0827, lon: 80.2707, radius: 0.16 },
  "Greater Noida": { lat: 28.4744, lon: 77.5040, radius: 0.12 },
};

export function getCityGeo(cityName) {
  return CITY_GEO[cityName] || CITY_GEO.Delhi;
}

export function getBounds(cityName) {
  const { lat, lon, radius } = getCityGeo(cityName);
  return {
    lat1: lat - radius,
    lon1: lon - radius,
    lat2: lat + radius,
    lon2: lon + radius,
  };
}
