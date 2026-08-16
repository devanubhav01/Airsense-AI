export const AQI_BANDS = [
    { label: "Good", min: 0, max: 50, hex: "#10B981", text: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" },
    { label: "Moderate", min: 51, max: 100, hex: "#F59E0B", text: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" },
    { label: "Poor", min: 101, max: 200, hex: "#F97316", text: "text-orange-600", bg: "bg-orange-50", ring: "ring-orange-200" },
    { label: "Severe", min: 201, max: 300, hex: "#EF4444", text: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" },
    { label: "Hazardous", min: 301, max: 500, hex: "#7F1D1D", text: "text-red-900", bg: "bg-red-100", ring: "ring-red-300" },
];

export function getBand(value) {
    return AQI_BANDS.find((b) => value >= b.min && value <= b.max) || AQI_BANDS[AQI_BANDS.length - 1];
}

export const CITIES = [
    { name: "Delhi", aqi: 312, pm25: 210, pm10: 180, no2: 45, so2: 12, co: 18, o3: 38 },
    { name: "Mumbai", aqi: 98, pm25: 62, pm10: 88, no2: 28, so2: 8, co: 9, o3: 22 },
    { name: "Bengaluru", aqi: 54, pm25: 30, pm10: 46, no2: 18, so2: 5, co: 6, o3: 19 },
    { name: "Kolkata", aqi: 176, pm25: 120, pm10: 140, no2: 34, so2: 10, co: 14, o3: 29 },
    { name: "Chennai", aqi: 71, pm25: 40, pm10: 58, no2: 20, so2: 6, co: 7, o3: 20 },
    { name: "Greater Noida", aqi: 205, pm25: 145, pm10: 160, no2: 38, so2: 11, co: 15, o3: 31 },
];

export const FORECAST_7DAY = [
    { day: "Mon", aqi: 298 }, { day: "Tue", aqi: 312 }, { day: "Wed", aqi: 335 },
    { day: "Thu", aqi: 301 }, { day: "Fri", aqi: 280 }, { day: "Sat", aqi: 245 }, { day: "Sun", aqi: 220 },
];

export const POLLUTANT_LABELS = { pm25: "PM2.5", pm10: "PM10", no2: "NO₂", so2: "SO₂", co: "CO", o3: "O₃" };

export const ALERTS_HISTORY = [
    { date: "12 Aug", type: "Severe Warning", msg: "AQI crossed 300 in Delhi — avoid outdoor activity." },
    { date: "10 Aug", type: "Daily AQI", msg: "Today's AQI is 245, category Poor." },
    { date: "07 Aug", type: "Weekly Summary", msg: "Average AQI this week was 12% higher than last week." },
    { date: "03 Aug", type: "Daily AQI", msg: "Today's AQI is 189, category Poor." },
];

export const REPORTS_HISTORY = [
    { date: "05 Aug 2026", type: "7-Day Forecast Report", status: "Delivered" },
    { date: "22 Jul 2026", type: "Monthly Summary", status: "Delivered" },
    { date: "01 Jul 2026", type: "7-Day Forecast Report", status: "Delivered" },
];

export const STATE_CITY_MAP = {
    Delhi: ["New Delhi", "Dwarka", "Rohini"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Karnataka: ["Bengaluru", "Mysuru", "Hubballi"],
    "West Bengal": ["Kolkata", "Howrah", "Siliguri"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Uttar Pradesh": ["Greater Noida", "Noida", "Lucknow"],
};