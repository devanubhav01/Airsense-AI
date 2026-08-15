import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";
import { fetchLiveAQI } from "@/lib/waqi";

const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { name } = await params;
        const cityName = decodeURIComponent(name);

        let city = await City.findOne({ name: cityName });
        const isStale = !city || Date.now() - new Date(city.lastFetchedAt).getTime() > STALE_AFTER_MS;

        if (isStale) {
            try {
                const live = await fetchLiveAQI(cityName);

                city = await City.findOneAndUpdate(
                    { name: cityName },
                    {
                        name: cityName,
                        aqi: live.aqi,
                        pollutants: live.pollutants,
                        forecast7Day: live.forecast || city?.forecast7Day || [],
                        lastFetchedAt: new Date(),
                    },
                    { upsert: true, new: true }
                );
            } catch (apiErr) {
                console.error("WAQI fetch failed, falling back to cached data:", apiErr.message);
                if (!city) {
                    return NextResponse.json({ success: false, error: "No cached data and live fetch failed" }, { status: 502 });
                }
            }
        }

        return NextResponse.json({ success: true, data: city });
    } catch (err) {
        console.error("GET /api/city/[name] error:", err);
        return NextResponse.json({ success: false, error: "Failed to fetch city data" }, { status: 500 });
    }
}