import { NextResponse } from "next/server";
import { fetchStationGrid } from "@/lib/waqi";
import { getFallbackSnapshot } from "@/lib/fallback-data";

export async function GET(request, { params }) {
  const { name } = await params;
  const cityName = decodeURIComponent(name);

  try {
    const stations = await fetchStationGrid(cityName);

    if (Array.isArray(stations) && stations.length) {
      return NextResponse.json({
        success: true,
        city: cityName,
        stations,
        source: "WAQI live station grid",
        fallback: false,
        fetchedAt: new Date().toISOString(),
      });
    }

    throw new Error("WAQI returned no stations");
  } catch (error) {
    console.warn("GET /api/stations/[name] using local fallback:", error?.message);

    const fallback = getFallbackSnapshot(cityName);

    return NextResponse.json({
      success: true,
      city: cityName,
      stations: fallback.stations,
      source: "AirSense local dummy station grid",
      fallback: true,
      fetchedAt: new Date().toISOString(),
      warning: "Live WAQI station grid unavailable; showing bundled dummy data.",
    });
  }
}
