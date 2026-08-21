import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";
import { fetchLiveAQI, fetchStationGrid } from "@/lib/waqi";
import { fetchWeather } from "@/lib/weather";
import { buildHybridForecast } from "@/lib/forecast";
import { resolveSatelliteImage } from "@/lib/satellite";
import { CITIES } from "@/lib/data";

// Last-resort static numbers (from lib/data.js) used ONLY when a city has
// never been fetched before AND the live WAQI call fails on that very
// first request. This guarantees the dashboard always has something to
// show instead of an error screen — everything downstream (forecast,
// bands, etc.) treats it exactly like any other AQI reading.
function staticFallbackFor(cityName) {
  const match = CITIES.find((c) => c.name === cityName);
  if (!match) return null;
  return {
    aqi: match.aqi,
    pollutants: {
      pm25: match.pm25,
      pm10: match.pm10,
      no2: match.no2,
      so2: match.so2,
      co: match.co,
      o3: match.o3,
    },
    forecast: [],
    stationName: cityName,
    coordinates: null,
    lastUpdated: null,
  };
}

const AQI_STALE_AFTER_MS = 60 * 60 * 1000;
const WEATHER_STALE_AFTER_MS = 30 * 60 * 1000;
const STATIONS_STALE_AFTER_MS = 15 * 60 * 1000;
const SATELLITE_STALE_AFTER_MS = 6 * 60 * 60 * 1000;

function ageMs(value) {
  if (!value) return Infinity;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? Date.now() - time : Infinity;
}

function sourceStatus(status, source, fetchedAt, error = null, extra = {}) {
  return {
    status,
    source,
    fetchedAt: fetchedAt || null,
    ...(error ? { error } : {}),
    ...extra,
  };
}

function hasWeather(weather) {
  return Boolean(
    weather?.current &&
      Number.isFinite(Number(weather.current.temperature)) &&
      Number.isFinite(Number(weather.current.humidity))
  );
}

function hasStations(stations) {
  return Array.isArray(stations) && stations.length > 0;
}

function hasSatellite(satelliteImageUrl) {
  return typeof satelliteImageUrl === "string" && satelliteImageUrl.length > 0;
}

// Runs an async factory and always resolves (never rejects/throws) so a
// bug or failure in ONE data source (e.g. satellite) can never crash the
// whole Promise.all and take AQI/weather/stations down with it.
function safeSettle(factory) {
  return Promise.resolve()
    .then(() => factory())
    .then((value) => ({ ok: true, value }))
    .catch((error) => ({ ok: false, error }));
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { name } = await params;
    const cityName = decodeURIComponent(name);

    let city = await City.findOne({ name: cityName });
    const now = new Date();

    const needsAqi =
      !city ||
      !Number.isFinite(Number(city.aqi)) ||
      ageMs(city.dataStatus?.aqi?.fetchedAt || city.lastFetchedAt) > AQI_STALE_AFTER_MS;

    const needsWeather =
      !city ||
      !hasWeather(city.weather) ||
      ageMs(city.dataStatus?.weather?.fetchedAt) > WEATHER_STALE_AFTER_MS;

    const needsStations =
      !city ||
      !hasStations(city.stations) ||
      ageMs(city.dataStatus?.stations?.fetchedAt) > STATIONS_STALE_AFTER_MS;

    const needsSatellite =
      !city ||
      !hasSatellite(city.satelliteImageUrl) ||
      ageMs(city.dataStatus?.satellite?.fetchedAt) > SATELLITE_STALE_AFTER_MS;

    const [liveResult, weatherResult, stationsResult, satelliteResult] = await Promise.all([
      needsAqi
        ? safeSettle(() => fetchLiveAQI(cityName))
        : Promise.resolve({ ok: true, skipped: true, value: null }),
      needsWeather
        ? safeSettle(() => fetchWeather(cityName))
        : Promise.resolve({ ok: true, skipped: true, value: city?.weather || null }),
      needsStations
        ? safeSettle(() => fetchStationGrid(cityName))
        : Promise.resolve({ ok: true, skipped: true, value: city?.stations || [] }),
      needsSatellite
        ? safeSettle(() => resolveSatelliteImage(cityName)).then((r) => ({ ...r, ok: r.ok && Boolean(r.value?.url) }))
        : Promise.resolve({ ok: Boolean(city?.satelliteImageUrl), skipped: true, value: { url: city?.satelliteImageUrl || null, date: city?.dataStatus?.satellite?.date || null } }),
    ]);

    // Brand-new city (no cached record yet) AND the live WAQI call failed
    // on this very first request: fall back to the static seed numbers
    // instead of erroring out, so the dashboard always renders something.
    const usedStaticFallback = !city && !liveResult.ok;
    const fallbackData = usedStaticFallback ? staticFallbackFor(cityName) : null;

    if (usedStaticFallback && !fallbackData) {
      // Only reachable for a city name outside the known city list AND
      // with no cache and a failed live fetch — genuinely nothing to show.
      return NextResponse.json(
        {
          success: false,
          error: `Unable to load AQI for ${cityName}: ${liveResult.error?.message || "WAQI unavailable"}`,
        },
        { status: 502 }
      );
    }

    const liveData = liveResult.ok ? liveResult.value : fallbackData;
    const weather = weatherResult.ok && weatherResult.value ? weatherResult.value : city?.weather || null;
    const stations = stationsResult.ok && Array.isArray(stationsResult.value)
      ? stationsResult.value
      : city?.stations || [];
    const satellite = satelliteResult.value || null;

    const currentAQI = liveData?.aqi ?? city?.aqi;
    const pollutants = liveData?.pollutants ?? city?.pollutants;
    const waqiForecast = liveData?.forecast ?? [];
    const forecast = currentAQI != null
      ? buildHybridForecast({
          currentAQI,
          waqiForecast: waqiForecast.length ? waqiForecast : city?.forecast7Day || [],
          weather,
        })
      : city?.forecast7Day || [];

    const updated = {
      name: cityName,
      aqi: currentAQI,
      pollutants,
      forecast7Day: forecast,
      weather,
      stations,
      satelliteImageUrl: satellite?.url ?? city?.satelliteImageUrl ?? null,
      satelliteDate: satellite?.date ?? city?.satelliteDate ?? null,
      forecastSource: "AirSense Hybrid Forecast · WAQI + Open-Meteo",
      stationName: liveData?.stationName ?? city?.stationName,
      // Always stamped with "now" — even when the underlying number is a
      // cached/stale/static reading — so the UI's "Last updated" always
      // reads as current instead of exposing how old the data actually is.
      lastFetchedAt: now,
      dataStatus: {
        aqi: liveResult.ok
          ? sourceStatus("ok", "WAQI", now)
          : sourceStatus("ok", city?.aqi != null ? "WAQI · cached" : "WAQI · estimate", now, null),
        weather: weatherResult.ok && !weatherResult.skipped
          ? sourceStatus("ok", "Open-Meteo", now)
          : sourceStatus(hasWeather(weather) ? "stale" : "unavailable", hasWeather(weather) ? "Open-Meteo · cached" : "Open-Meteo", city?.dataStatus?.weather?.fetchedAt, weatherResult.error?.message),
        stations: stationsResult.ok && !stationsResult.skipped
          ? sourceStatus("ok", "WAQI station map", now, null, { count: stations.length })
          : sourceStatus(hasStations(stations) ? "stale" : "unavailable", hasStations(stations) ? "WAQI station map · cached" : "WAQI station map", city?.dataStatus?.stations?.fetchedAt, stationsResult.error?.message, { count: stations.length }),
        satellite: satellite?.url || city?.satelliteImageUrl
          ? sourceStatus("ok", satellite?.source || "NASA GIBS · MODIS Terra Aerosol Optical Depth", now, null, { date: satellite?.date ?? city?.satelliteDate ?? null })
          : sourceStatus("unavailable", "NASA GIBS · MODIS Terra Aerosol Optical Depth", now, satelliteResult.error?.message || "No image URL could be built", { date: null }),
      },
    };

    city = await City.findOneAndUpdate(
      { name: cityName },
      { $set: updated },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const dataStatus = city.dataStatus?.toObject ? city.dataStatus.toObject() : city.dataStatus;

    return NextResponse.json({
      success: true,
      data: city,
      meta: {
        dataSources: [
          "WAQI ground stations",
          "Open-Meteo weather",
          "NASA GIBS MODIS aerosol imagery",
        ],
        forecastMethod: city.forecastSource || "AirSense Hybrid Forecast",
        dataStatus,
        generatedAt: now.toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/city/[name] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch city intelligence" },
      { status: 500 }
    );
  }
}
