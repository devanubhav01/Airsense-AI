import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";
import { fetchLiveAQI } from "@/lib/waqi";
import { fetchWeather } from "@/lib/weather";
import { buildHybridForecast } from "@/lib/forecast";
import { CITIES } from "@/lib/data";

export async function GET() {
  try {
    await dbConnect();

    const names = CITIES.map((c) => c.name);
    const rows = await Promise.all(names.map(async (name) => {
      let city = await City.findOne({ name }).lean();
      const stale = !city || Date.now() - new Date(city.lastFetchedAt).getTime() > 60 * 60 * 1000;

      if (stale) {
        try {
          const [live, weather] = await Promise.all([fetchLiveAQI(name), fetchWeather(name)]);
          const forecast = buildHybridForecast({ currentAQI: live.aqi, waqiForecast: live.forecast, weather });
          city = await City.findOneAndUpdate(
            { name },
            {
              name,
              aqi: live.aqi,
              pollutants: live.pollutants,
              forecast7Day: forecast,
              weather,
              stationName: live.stationName,
              lastFetchedAt: new Date(),
              forecastSource: "AirSense Hybrid Forecast · WAQI + Open-Meteo",
            },
            { upsert: true, new: true }
          ).lean();
        } catch (error) {
          if (!city) return { name, aqi: null, status: "Unavailable", error: error.message };
        }
      }

      const forecast = city?.forecast7Day || [];
      const next = forecast[1]?.aqi ?? city?.aqi;
      return {
        name,
        aqi: city?.aqi ?? null,
        tomorrow: next ?? null,
        pm25: city?.pollutants?.pm25 ?? null,
        pm10: city?.pollutants?.pm10 ?? null,
        humidity: city?.weather?.current?.humidity ?? null,
        windSpeed: city?.weather?.current?.windSpeed ?? null,
        trend: next > city?.aqi ? "Rising" : next < city?.aqi ? "Improving" : "Stable",
        updatedAt: city?.lastFetchedAt ?? null,
        status: city?.aqi == null ? "Unavailable" : "Live",
      };
    }));

    const liveRows = rows.filter((r) => Number.isFinite(r.aqi));
    const averageAQI = liveRows.length ? Math.round(liveRows.reduce((s, r) => s + r.aqi, 0) / liveRows.length) : null;
    const severeCities = liveRows.filter((r) => r.aqi >= 200).length;

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary: { trackedCities: rows.length, liveCities: liveRows.length, averageAQI, severeCities },
      rows,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ success: false, error: "Failed to build analytics" }, { status: 500 });
  }
}
