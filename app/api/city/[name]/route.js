import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";
import { fetchLiveAQI, fetchStationGrid } from "@/lib/waqi";
import { fetchWeather } from "@/lib/weather";
import { buildHybridForecast } from "@/lib/forecast";
import { resolveSatelliteImage } from "@/lib/satellite";

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

function hasSatellite(satellite) {
  return Boolean(satellite?.url || satellite);
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
        ? fetchLiveAQI(cityName).then((value) => ({ ok: true, value })).catch((error) => ({ ok: false, error }))
        : Promise.resolve({ ok: true, skipped: true, value: null }),
      needsWeather
        ? fetchWeather(cityName).then((value) => ({ ok: true, value })).catch((error) => ({ ok: false, error }))
        : Promise.resolve({ ok: true, skipped: true, value: city?.weather || null }),
      needsStations
        ? fetchStationGrid(cityName).then((value) => ({ ok: true, value })).catch((error) => ({ ok: false, error }))
        : Promise.resolve({ ok: true, skipped: true, value: city?.stations || [] }),
      needsSatellite
        ? resolveSatelliteImage(cityName).then((value) => ({ ok: Boolean(value?.url), value })).catch((error) => ({ ok: false, error }))
        : Promise.resolve({ ok: Boolean(city?.satelliteImageUrl), skipped: true, value: { url: city?.satelliteImageUrl || null, date: city?.dataStatus?.satellite?.date || null } }),
    ]);

    if (!city && !liveResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Unable to load live AQI for ${cityName}: ${liveResult.error?.message || "WAQI unavailable"}`,
        },
        { status: 502 }
      );
    }

    const liveData = liveResult.ok ? liveResult.value : null;
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
      lastFetchedAt: liveData ? now : city?.lastFetchedAt || now,
      dataStatus: {
        aqi: liveData
          ? sourceStatus("ok", "WAQI", now)
          : sourceStatus(city?.aqi != null ? "stale" : "unavailable", "WAQI · cached", city?.dataStatus?.aqi?.fetchedAt || city?.lastFetchedAt, liveResult.error?.message),
        weather: weatherResult.ok && !weatherResult.skipped
          ? sourceStatus("ok", "Open-Meteo", now)
          : sourceStatus(hasWeather(weather) ? "stale" : "unavailable", hasWeather(weather) ? "Open-Meteo · cached" : "Open-Meteo", city?.dataStatus?.weather?.fetchedAt, weatherResult.error?.message),
        stations: stationsResult.ok && !stationsResult.skipped
          ? sourceStatus("ok", "WAQI station map", now, null, { count: stations.length })
          : sourceStatus(hasStations(stations) ? "stale" : "unavailable", hasStations(stations) ? "WAQI station map · cached" : "WAQI station map", city?.dataStatus?.stations?.fetchedAt, stationsResult.error?.message, { count: stations.length }),
        satellite: satellite?.url
          ? sourceStatus("ok", satellite.source || "NASA GIBS", now, null, { date: satellite.date })
          : sourceStatus(city?.satelliteImageUrl ? "stale" : "unavailable", "NASA GIBS · MODIS Terra Aerosol Optical Depth", city?.dataStatus?.satellite?.fetchedAt, satelliteResult.error?.message || "No recent usable image found", { date: city?.satelliteDate || null }),
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
