import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";
import { fetchLiveAQI, fetchStationGrid } from "@/lib/waqi";
import { fetchWeather } from "@/lib/weather";
import { buildHybridForecast } from "@/lib/forecast";
import { getSatelliteImageUrl } from "@/lib/satellite";

const STALE_AFTER_MS = 60 * 60 * 1000;

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { name } = await params;
    const cityName = decodeURIComponent(name);

    let city = await City.findOne({ name: cityName });
    const isStale =
      !city ||
      Date.now() - new Date(city.lastFetchedAt).getTime() > STALE_AFTER_MS;

    if (isStale) {
      try {
        const [live, weatherResult, stationsResult] = await Promise.allSettled([
          fetchLiveAQI(cityName),
          fetchWeather(cityName),
          fetchStationGrid(cityName),
        ]);

        if (live.status !== "fulfilled") throw live.reason;

        const liveData = live.value;
        const weather =
          weatherResult.status === "fulfilled"
            ? weatherResult.value
            : city?.weather || null;
        const stations =
          stationsResult.status === "fulfilled"
            ? stationsResult.value
            : city?.stations || [];

        const forecast = buildHybridForecast({
          currentAQI: liveData.aqi,
          waqiForecast: liveData.forecast,
          weather,
        });

        city = await City.findOneAndUpdate(
          { name: cityName },
          {
            name: cityName,
            aqi: liveData.aqi,
            pollutants: liveData.pollutants,
            forecast7Day: forecast,
            weather,
            stations,
            satelliteImageUrl: getSatelliteImageUrl(cityName),
            forecastSource: "AirSense Hybrid Forecast · WAQI + Open-Meteo",
            stationName: liveData.stationName,
            lastFetchedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (apiErr) {
        console.error("City refresh failed, falling back to cached data:", apiErr?.message);
        if (!city) {
          return NextResponse.json(
            { success: false, error: "No cached data and live data fetch failed" },
            { status: 502 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: city,
      meta: {
        dataSources: ["WAQI ground stations", "Open-Meteo weather", "NASA GIBS MODIS aerosol imagery"],
        forecastMethod: city.forecastSource || "AirSense Hybrid Forecast",
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
