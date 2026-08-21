import { NextResponse } from "next/server";
import { fetchStationGrid } from "@/lib/waqi";

export async function GET(request, { params }) {
  try {
    const { name } = await params;
    const cityName = decodeURIComponent(name);

    const stations = await fetchStationGrid(cityName);

    return NextResponse.json({
      success: true,
      city: cityName,
      stations,
      source: "WAQI live station grid",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/stations/[name] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to load live station grid",
      },
      { status: 503 }
    );
  }
}
