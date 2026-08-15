const WAQI_BASE_URL = "https://api.waqi.info/feed";

// India-specific city name mapping — WAQI ke station names kabhi thode
// alag hote hain, isliye common cities ke liye explicit mapping rakhna safe hai.
const CITY_STATION_MAP = {
    Delhi: "delhi",
    Mumbai: "mumbai",
    Bengaluru: "bangalore",
    Kolkata: "kolkata",
    Chennai: "chennai",
};

export async function fetchLiveAQI(cityName) {
    const station = CITY_STATION_MAP[cityName] || cityName.toLowerCase();
    const url = `${WAQI_BASE_URL}/${encodeURIComponent(station)}/?token=${process.env.WAQI_API_KEY}`;

    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    if (json.status !== "ok") {
        throw new Error(`WAQI API error for ${cityName}: ${json.data || "unknown error"}`);
    }

    const d = json.data;
    const iaqi = d.iaqi || {};

    // WAQI gives individual pollutant sub-indices under iaqi.*.v
    const pollutants = {
        pm25: iaqi.pm25?.v ?? null,
        pm10: iaqi.pm10?.v ?? null,
        no2: iaqi.no2?.v ?? null,
        so2: iaqi.so2?.v ?? null,
        co: iaqi.co?.v ?? null,
        o3: iaqi.o3?.v ?? null,
    };

    // WAQI's forecast.daily.pm25 gives day-wise avg/min/max — we map to a simple 7-day AQI trend
    const dailyForecast = d.forecast?.daily?.pm25 || [];
    const forecast = dailyForecast.slice(0, 7).map((f) => ({
        day: new Date(f.day).toLocaleDateString("en-US", { weekday: "short" }),
        aqi: f.avg,
    }));

    return {
        aqi: d.aqi,
        pollutants,
        forecast: forecast.length ? forecast : undefined,
        stationName: d.city?.name,
        lastUpdated: d.time?.iso,
    };
}