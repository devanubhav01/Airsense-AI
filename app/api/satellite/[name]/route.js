import { NextResponse } from "next/server";
import { resolveSatelliteImage } from "@/lib/satellite";

export async function GET(request, { params }) {
  try {
    const { name } = await params;
    const cityName = decodeURIComponent(name);
    const satellite = await resolveSatelliteImage(cityName);

    return NextResponse.json({
      success: true,
      city: cityName,
      ...satellite,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/satellite/[name] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unable to load satellite imagery",
      },
      { status: 503 }
    );
  }
}
