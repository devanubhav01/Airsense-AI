const WAQI_BASE_URL = "https://api.waqi.info/feed";

const CITY_STATION_MAP = {
  Delhi: "delhi",
  Mumbai: "mumbai",
  Bengaluru: "bangalore",
  Kolkata: "kolkata",
  Chennai: "chennai",
  "Greater Noida": "greater noida",
};

export async function fetchLiveAQI(cityName) {
  const station = CITY_STATION_MAP[cityName] || cityName.toLowerCase();
  const url = `${WAQI_BASE_URL}/${encodeURIComponent(station)}/?token=${process.env.WAQI_API_KEY}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`WAQI HTTP error: ${res.status}`);
  const json = await res.json();

  if (json.status !== "ok") {
    throw new Error(`WAQI API error for ${cityName}: ${json.data || "unknown error"}`);
  }

  const d = json.data;
  const iaqi = d.iaqi || {};
  const pollutants = {
    pm25: iaqi.pm25?.v ?? null,
    pm10: iaqi.pm10?.v ?? null,
    no2: iaqi.no2?.v ?? null,
    so2: iaqi.so2?.v ?? null,
    co: iaqi.co?.v ?? null,
    o3: iaqi.o3?.v ?? null,
  };

  const dailyForecast = d.forecast?.daily?.pm25 || [];
  const forecast = dailyForecast.slice(0, 7).map((f) => ({
    day: new Date(`${f.day}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
    date: f.day,
    aqi: Number(f.avg),
    min: Number(f.min),
    max: Number(f.max),
  }));

  return {
    aqi: Number(d.aqi),
    pollutants,
    forecast,
    stationName: d.city?.name,
    coordinates: d.city?.geo ? { lat: Number(d.city.geo[0]), lon: Number(d.city.geo[1]) } : null,
    lastUpdated: d.time?.iso,
  };
}

export async function fetchStationGrid(cityName) {
  const { getBounds } = await import("@/lib/geo");
  const { lat1, lon1, lat2, lon2 } = getBounds(cityName);

  const params = new URLSearchParams({
    latlng: `${lat1},${lon1},${lat2},${lon2}`,
    token: process.env.WAQI_API_KEY || "",
  });

  const res = await fetch(
    `https://api.waqi.info/map/bounds/?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error(`WAQI map HTTP error: ${res.status}`);
  const json = await res.json();
  if (json.status !== "ok") throw new Error(`WAQI map error: ${json.data || "unknown error"}`);

  return (json.data || [])
    .filter((s) => Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lon)))
    .map((s) => ({
      uid: s.uid,
      lat: Number(s.lat),
      lon: Number(s.lon),
      aqi: Number.isFinite(Number(s.aqi)) ? Number(s.aqi) : null,
      station: s.station?.name || "WAQI station",
    }))
    .filter((s) => s.aqi !== null);
}
