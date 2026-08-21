import { getCityGeo } from "@/lib/geo";

const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather(cityName) {
  const { lat, lon } = getCityGeo(cityName);
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,cloud_cover",
    daily: "temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max,precipitation_sum",
    forecast_days: "7",
    timezone: "auto",
  });

  const res = await fetch(`${WEATHER_URL}?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Weather API failed: ${res.status}`);
  const json = await res.json();

  return {
    current: {
      temperature: json.current?.temperature_2m ?? null,
      humidity: json.current?.relative_humidity_2m ?? null,
      windSpeed: json.current?.wind_speed_10m ?? null,
      pressure: json.current?.pressure_msl ?? null,
      cloudCover: json.current?.cloud_cover ?? null,
    },
    daily: {
      dates: json.daily?.time || [],
      temperatureMax: json.daily?.temperature_2m_max || [],
      temperatureMin: json.daily?.temperature_2m_min || [],
      humidity: json.daily?.relative_humidity_2m_mean || [],
      windSpeed: json.daily?.wind_speed_10m_max || [],
      precipitation: json.daily?.precipitation_sum || [],
    },
    source: "Open-Meteo",
  };
}
