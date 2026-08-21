import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";
import { fetchWeather } from "@/lib/weather";
import { buildHybridForecast } from "@/lib/forecast";
import { resolveSatelliteImage, getSatelliteImageUrl } from "@/lib/satellite";
import { getFallbackSnapshot } from "@/lib/fallback-data";

// IMPORTANT:
// AQI and station data are intentionally cache-only.
// The dashboard should remain populated with the previous snapshot instead
// of replacing it with a live WAQI value.
const WEATHER_STALE_AFTER_MS = 30 * 60 * 1000;
const SATELLITE_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

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

function hasSatellite(url) {
  return typeof url === "string" && url.length > 0;
}

async function fetchWeatherSafely(cityName) {
  try {
    return await fetchWeather(cityName);
  } catch (error) {
    return { __error: error };
  }
}

async function fetchSatelliteSafely(cityName) {
  try {
    return await resolveSatelliteImage(cityName);
  } catch (error) {
    return { __error: error };
  }
}

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { name } = await params;
    const cityName = decodeURIComponent(name);

    const fallback = getFallbackSnapshot(cityName);
    let city = await City.findOne({ name: cityName });
    const now = new Date();

    /*
     * 1) AQI: CACHE ONLY
     *
     * Never call WAQI from this route. If MongoDB has a previous AQI,
     * preserve it. If MongoDB is empty, use the bundled older snapshot.
     */
    const cachedAQI = Number.isFinite(Number(city?.aqi))
      ? Number(city.aqi)
      : fallback.aqi;

    const cachedPollutants = city?.pollutants || fallback.pollutants;

    /*
     * 2) Stations: CACHE ONLY
     *
     * Preserve MongoDB station grid. If there is no grid yet, use the
     * bundled older station snapshot so the heatmap is never empty.
     */
    const stations = hasStations(city?.stations)
      ? city.stations
      : fallback.stations;

    const stationFetchedAt =
      city?.dataStatus?.stations?.fetchedAt ||
      city?.dataStatus?.aqi?.fetchedAt ||
      fallback.snapshotAt;

    /*
     * 3) Weather: still try Open-Meteo, but fall back to the cached snapshot.
     */
    const weatherResult = await fetchWeatherSafely(cityName);
    const weather =
      !weatherResult.__error && hasWeather(weatherResult)
        ? weatherResult
        : city?.weather || fallback.weather;

    /*
     * 4) Satellite: prefer the stored image, but when it is old/missing,
     * resolve an older NASA GIBS image. The resolver itself has a final
     * historical URL fallback, so this never intentionally returns blank.
     */
    const satelliteIsOld =
      !city?.satelliteImageUrl ||
      ageMs(city?.dataStatus?.satellite?.fetchedAt) > SATELLITE_STALE_AFTER_MS;

    const satelliteResult = satelliteIsOld
      ? await fetchSatelliteSafely(cityName)
      : {
          url: city.satelliteImageUrl,
          date: city.satelliteDate,
          source: city.dataStatus?.satellite?.source || "NASA GIBS · cached",
          status: "cached",
        };

    const satellite =
      !satelliteResult.__error && satelliteResult?.url
        ? satelliteResult
        : {
            url: city?.satelliteImageUrl || null,
            date: city?.satelliteDate || null,
            source: "NASA GIBS · cached",
            status: "cached",
          };

    const forecast = buildHybridForecast({
      currentAQI: cachedAQI,
      waqiForecast: city?.forecast7Day || fallback.forecast7Day,
      weather,
    });

    const aqiFetchedAt =
      city?.dataStatus?.aqi?.fetchedAt ||
      city?.lastFetchedAt ||
      fallback.snapshotAt;

    const satelliteFetchedAt =
      satelliteResult?.__error
        ? city?.dataStatus?.satellite?.fetchedAt || fallback.snapshotAt
        : now;

    const updated = {
      name: cityName,
      aqi: cachedAQI,
      pollutants: cachedPollutants,
      forecast7Day: forecast,
      weather,
      stations,
      satelliteImageUrl: satellite.url,
      satelliteDate: satellite.date,
      forecastSource: "AirSense Hybrid Forecast · cached AQI + Open-Meteo",
      stationName: city?.stationName || fallback.stationName,

      // Do not bump this timestamp just because the API endpoint was opened.
      lastFetchedAt: aqiFetchedAt,

      dataStatus: {
        aqi: sourceStatus(
          "stale",
          "AirSense cached AQI snapshot",
          aqiFetchedAt,
          null,
          { mode: "cache-only" }
        ),

        weather: !weatherResult.__error
          ? sourceStatus("ok", "Open-Meteo", now)
          : sourceStatus(
              "stale",
              "Open-Meteo · cached",
              city?.dataStatus?.weather?.fetchedAt || fallback.snapshotAt,
              weatherResult.__error?.message
            ),

        stations: sourceStatus(
          "stale",
          hasStations(city?.stations)
            ? "WAQI station grid · cached"
            : "AirSense station snapshot · fallback",
          stationFetchedAt,
          null,
          { count: stations.length, mode: "cache-only" }
        ),

        satellite: sourceStatus(
          satellite.status === "fallback" ? "stale" : "stale",
          satellite.source || "NASA GIBS · cached",
          satelliteFetchedAt,
          satelliteResult?.__error?.message,
          {
            date: satellite.date,
            mode: "historical-fallback-enabled",
          }
        ),
      },
    };

    city = await City.findOneAndUpdate(
      { name: cityName },
      { $set: updated },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const dataStatus = city.dataStatus?.toObject
      ? city.dataStatus.toObject()
      : city.dataStatus;

    return NextResponse.json({
      success: true,
      data: city,
      meta: {
        dataSources: [
          "AirSense cached AQI snapshot",
          "AirSense cached station grid",
          "Open-Meteo weather",
          "NASA GIBS MODIS historical/latest-available imagery",
        ],
        forecastMethod: city.forecastSource || "AirSense Hybrid Forecast",
        dataStatus,
        generatedAt: now.toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/city/[name] error:", err);

    // Last-resort response: even MongoDB errors should not produce a blank
    // dashboard. The client still receives a complete older snapshot.
    try {
      const { name } = await params;
      const cityName = decodeURIComponent(name);
      const fallback = getFallbackSnapshot(cityName);

      return NextResponse.json({
        success: true,
        data: {
          ...fallback,
          satelliteImageUrl: getSatelliteImageUrl(cityName),
          satelliteDate: "2026-08-18",
          lastFetchedAt: fallback.snapshotAt,
          dataStatus: {
            aqi: sourceStatus("stale", "AirSense cached AQI snapshot", fallback.snapshotAt),
            stations: sourceStatus("stale", "AirSense station snapshot · fallback", fallback.snapshotAt, null, {
              count: fallback.stations.length,
            }),
            weather: sourceStatus("stale", "AirSense weather snapshot · fallback", fallback.snapshotAt),
            satellite: sourceStatus("stale", "NASA GIBS historical fallback", fallback.snapshotAt, null, {
              date: "2026-08-18",
            }),
          },
        },
        meta: {
          dataSources: ["AirSense cached fallback snapshot"],
          dataStatus: "fallback",
          generatedAt: new Date().toISOString(),
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to load city fallback" },
        { status: 500 }
      );
    }
  }
}
