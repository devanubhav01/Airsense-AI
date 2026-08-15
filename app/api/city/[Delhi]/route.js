import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import City from "@/lib/models/City";

const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request, { params }) {
    try {
        await connectDB();
        const cityName = decodeURIComponent(params.name);

        let city = await City.findOne({ name: cityName });

        const isStale = !city || Date.now() - new Date(city.fetchedAt).getTime() > STALE_AFTER_MS;

        if (isStale) {
            // --- STEP 5 HOOK ---
            // Replace this block with a real call to WAQI / OpenWeather Air Pollution API.
            // Example: const live = await fetchLiveAQI(cityName);
            const live = {
                aqi: city?.aqi ?? 150,
                pollutants: city?.pollutants ?? { pm25: 90, pm10: 110, no2: 30, so2: 8, co: 10, o3: 24 },
                forecast: city?.forecast ?? [
                    { day: "Mon", aqi: 140 }, { day: "Tue", aqi: 155 }, { day: "Wed", aqi: 168 },
                    { day: "Thu", aqi: 150 }, { day: "Fri", aqi: 135 }, { day: "Sat", aqi: 120 }, { day: "Sun", aqi: 110 },
                ],
            };

            city = await City.findOneAndUpdate(
                { name: cityName },
                { name: cityName, ...live, fetchedAt: new Date() },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ success: true, data: city });
    } catch (err) {
        console.error("GET /api/city/[name] error:", err);
        return NextResponse.json({ success: false, error: "Failed to fetch city data" }, { status: 500 });
    }
}