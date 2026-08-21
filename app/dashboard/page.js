"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  MapPin,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Loader2
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import Card from "@/components/Card";
import Button from "@/components/Button";
import Gauge from "@/components/Gauge";
import SatelliteCityGrid from "@/components/SatelliteCityGrid";

import {
  POLLUTANT_LABELS,
  getBand
} from "@/lib/data";
import { getFallbackSnapshot } from "@/lib/fallback-data";

const CITY_NAMES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Kolkata",
  "Chennai",
  "Greater Noida"
];

function useCityData(cityName) {

  // Start with a bundled snapshot so the dashboard is useful immediately.
  // Live API data replaces this snapshot as soon as it becomes available.
  const [data, setData] = useState(() => getFallbackSnapshot(cityName));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    let cancelled = false;

    // Swap to the matching local snapshot instantly when the city changes.
    setData(getFallbackSnapshot(cityName));
    setLoading(true);
    setError(null);

    fetch(
      `/api/city/${encodeURIComponent(cityName)}`,
      { cache: "no-store" }
    )
      .then(async (res) => {
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(
            json.error ||
            `Failed to load ${cityName} data`
          );
        }

        return json;
      })
      .then((json) => {

        if (cancelled) return;

        if (json.data) {
          setData(json.data);
        }

      })
      .catch((err) => {

        if (!cancelled) {
          // Keep the already-visible local snapshot. The UI should never
          // collapse into a blank loading/error panel.
          setError(err.message);
        }

      })
      .finally(() => {

        if (!cancelled) {
          setLoading(false);
        }

      });

    return () => {
      cancelled = true;
    };

  }, [cityName]);

  return {
    data,
    loading,
    error
  };
}

export default function DashboardPage() {

  const router = useRouter();

  /*
   * Get currently logged-in user
   * from NextAuth session.
   */
  const {
    data: session,
    status: sessionStatus
  } = useSession();

  const [city, setCity] =
    useState("Delhi");

  const [compareCity, setCompareCity] =
    useState("Mumbai");

  /*
   * If logged-in user has a saved city,
   * automatically use that city.
   */
  useEffect(() => {

    const savedCity =
      session?.user?.city;

    if (
      savedCity &&
      CITY_NAMES.includes(savedCity)
    ) {
      setCity(savedCity);
    }

  }, [session?.user?.city]);

  const {
    data: cityData
  } = useCityData(city);

  const {
    data: compareData,
    loading: compareLoading
  } = useCityData(compareCity);

  const [stations, setStations] = useState(
    () => getFallbackSnapshot(city).stations
  );
  const [stationsLoading, setStationsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setStations(getFallbackSnapshot(city).stations);
    setStationsLoading(true);

    fetch(`/api/stations/${encodeURIComponent(city)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Live station grid unavailable");
        }
        return json;
      })
      .then((json) => {
        if (!cancelled && Array.isArray(json.stations) && json.stations.length) {
          setStations(json.stations);
        }
      })
      .catch(() => {
        // Keep the local station snapshot visible when WAQI is unavailable.
      })
      .finally(() => {
        if (!cancelled) {
          setStationsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [city]);

  /*
   * The dashboard is intentionally rendered from the bundled snapshot first.
   * A small live-status strip communicates that a refresh is in progress
   * without hiding the actual dashboard.
   */
  if (sessionStatus === "loading" || !cityData) {

    return (

      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">

        <div className="flex items-center gap-2 text-slate-500">

          <Loader2
            size={18}
            className="animate-spin"
          />

          Preparing air-quality monitor for {city}...

        </div>

      </div>

    );
  }

  const band =
    getBand(cityData.aqi);

  const forecast =
    cityData.forecast7Day &&
    cityData.forecast7Day.length > 0
      ? cityData.forecast7Day
      : [{ day: "Today", aqi: cityData.aqi, confidence: 70 }];

  const tomorrow =
    forecast[1]?.aqi ??
    cityData.aqi;

  const trendUp =
    tomorrow > cityData.aqi;

  const pollutantData =
    Object.entries(
      POLLUTANT_LABELS
    ).map(
      ([key, label]) => ({
        name: label,
        value:
          cityData.pollutants?.[
            key
          ] ?? 0,
      })
    );

  /*
   * Logged-in user's name.
   *
   * Example:
   * Rahul -> Hi, Rahul 👋
   * Anubhav -> Hi, Anubhav 👋
   */
  const userName =
    session?.user?.name ||
    "there";


  return (

    <div className="mx-auto max-w-7xl bg-slate-50 px-5 py-10 lg:px-8">

      {/* ================= HEADER ================= */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1
            className="text-2xl font-semibold text-slate-900"
            style={{
              fontFamily:
                "'Space Grotesk', sans-serif"
            }}
          >

            Hi, {userName} 👋 — here's{" "}
            {city}'s air quality today

          </h1>

          <p className="mt-1 text-sm text-slate-500">

            Last updated{" "}

            {cityData.lastFetchedAt
              ? new Date(
                  cityData.lastFetchedAt
                ).toLocaleTimeString()
              : "just now"}

          </p>

        </div>

        {/* CITY SELECTOR */}

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">

          <MapPin
            size={14}
            className="text-slate-400"
          />

          <select
            value={city}
            onChange={(e) =>
              setCity(
                e.target.value
              )
            }
            className="bg-transparent text-sm text-slate-700 outline-none"
          >

            {CITY_NAMES.map(
              (c) => (

                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>

              )
            )}

          </select>

        </div>

      </div>

      {/* ================= TOP STATS ================= */}

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* CURRENT AQI */}

        <Card>

          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current AQI
          </div>

          <div
            className={`mt-2 text-4xl font-semibold ${band.text}`}
            style={{
              fontFamily:
                "'JetBrains Mono', monospace"
            }}
          >
            {cityData.aqi}
          </div>

          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${band.bg} ${band.text}`}
          >
            {band.label}
          </span>

        </Card>

        {/* TOMORROW */}

        <Card>

          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tomorrow's Forecast
          </div>

          <div className="mt-2 flex items-baseline gap-2">

            <span
              className={`text-4xl font-semibold ${getBand(tomorrow).text}`}
              style={{
                fontFamily:
                  "'JetBrains Mono', monospace"
              }}
            >
              {tomorrow}
            </span>

            {trendUp ? (

              <TrendingUp
                size={16}
                className="text-red-500"
              />

            ) : (

              <TrendingDown
                size={16}
                className="text-emerald-500"
              />

            )}

          </div>

          <span className="mt-2 inline-block text-[11px] text-slate-500">

            {trendUp
              ? "Rising"
              : "Improving"}{" "}
            vs. today

          </span>

        </Card>

        {/* DOMINANT POLLUTANT */}

        <Card>

          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Dominant Pollutant
          </div>

          <div
            className="mt-2 text-4xl font-semibold text-slate-900"
            style={{
              fontFamily:
                "'Space Grotesk', sans-serif"
            }}
          >
            PM2.5
          </div>

          <span className="mt-2 inline-block text-[11px] text-slate-500">

            {cityData.pollutants?.pm25 ??
              "—"}{" "}
            µg/m³

          </span>

        </Card>

        {/* HEALTH ADVISORY */}

        <Card>

          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Health Advisory
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">

            {band.label === "Good" ||
            band.label === "Moderate"

              ? "Air quality is acceptable for outdoor activity."

              : "Limit prolonged outdoor exertion, especially for sensitive groups."
            }

          </p>

        </Card>

      </div>

      {/* ================= SATELLITE AEROSOL CONTEXT + GAUGE ================= */}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">

        {/* SATELLITE AEROSOL CONTEXT (replaces the old placeholder heatmap grid) */}

        <div className="lg:col-span-2">
          <SatelliteCityGrid activeCity={city} />
        </div>

        {/* INSTRUMENT READOUT */}

        <Card>

          <h3 className="mb-2 text-[15px] font-semibold text-slate-900">
            Instrument Readout
          </h3>

          <Gauge
            value={cityData.aqi}
          />

          <div
            className="-mt-3 text-center text-2xl font-semibold text-slate-900"
            style={{
              fontFamily:
                "'JetBrains Mono', monospace"
            }}
          >
            {cityData.aqi}
          </div>

        </Card>

      </div>

      {/* ================= CHARTS ================= */}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">

        {/* 7 DAY AQI */}

        <Card>

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold text-slate-900">7-Day AQI Trend</h3>
            <span className="text-[10px] text-indigo-600">{cityData.forecastSource || "AirSense Hybrid Forecast"}</span>
          </div>

          <div className="mt-4 h-56">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={forecast}
              >

                <CartesianGrid
                  stroke="#E2E8F0"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#fff",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="aqi"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: "#4F46E5"
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </Card>

        {/* POLLUTANT BREAKDOWN */}

        <Card>

          <h3 className="text-[15px] font-semibold text-slate-900">
            Pollutant Breakdown
          </h3>

          <div className="mt-4 h-56">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={pollutantData}
              >

                <CartesianGrid
                  stroke="#E2E8F0"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#fff",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[
                    4,
                    4,
                    0,
                    0
                  ]}
                >

                  {pollutantData.map(
                    (_, i) => (

                      <Cell
                        key={i}
                        fill={
                          i === 0
                            ? "#EF4444"
                            : "#CBD5E1"
                        }
                      />

                    )
                  )}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </Card>

      </div>

      {/* ================= MULTI-SOURCE CONTEXT ================= */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900">Weather Context</h3>
            <span className="text-[10px] text-slate-400">{cityData.weather?.source || "Open-Meteo"}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-slate-400">Temperature</div><strong className="text-lg text-slate-800">{cityData.weather?.current?.temperature ?? "—"}°C</strong></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-slate-400">Humidity</div><strong className="text-lg text-slate-800">{cityData.weather?.current?.humidity ?? "—"}%</strong></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-slate-400">Wind</div><strong className="text-lg text-slate-800">{cityData.weather?.current?.windSpeed ?? "—"} km/h</strong></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-slate-400">Pressure</div><strong className="text-lg text-slate-800">{cityData.weather?.current?.pressure ?? "—"} hPa</strong></div>
          </div>
        </Card>
      </div>

      {/* ================= CITY COMPARISON ================= */}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">

        <Card className="lg:col-span-2">

          <h3 className="text-[15px] font-semibold text-slate-900">
            City Comparison
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-4">

            {/* CURRENT CITY */}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">

              <div className="text-xs text-slate-500">
                {city}
              </div>

              <div
                className={`mt-1 text-3xl font-semibold ${getBand(cityData.aqi).text}`}
                style={{
                  fontFamily:
                    "'JetBrains Mono', monospace"
                }}
              >
                {cityData.aqi}
              </div>

            </div>

            {/* COMPARE CITY */}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">

              <select
                value={compareCity}
                onChange={(e) =>
                  setCompareCity(
                    e.target.value
                  )
                }
                className="mx-auto block bg-transparent text-xs text-slate-500 outline-none"
              >

                {CITY_NAMES
                  .filter(
                    (c) =>
                      c !== city
                  )
                  .map((c) => (

                    <option
                      key={c}
                      value={c}
                    >
                      {c}
                    </option>

                  ))}

              </select>

              <div
                className={`mt-1 text-3xl font-semibold ${
                  compareData
                    ? getBand(
                        compareData.aqi
                      ).text
                    : "text-slate-400"
                }`}
                style={{
                  fontFamily:
                    "'JetBrains Mono', monospace"
                }}
              >

                {compareLoading ||
                !compareData
                  ? "…"
                  : compareData.aqi}

              </div>

            </div>

          </div>

        </Card>

        {/* ================= REPORT ================= */}

        <Card className="border-indigo-200 bg-indigo-50/50">

          <h3 className="text-[15px] font-semibold text-slate-900">
            Get Detailed Report
          </h3>

          <ul className="mt-3 space-y-1.5 text-xs text-slate-600">

            <li className="flex items-center gap-1.5">

              <CheckCircle2
                size={13}
                className="text-indigo-600"
              />

              7-day forecast

            </li>

            <li className="flex items-center gap-1.5">

              <CheckCircle2
                size={13}
                className="text-indigo-600"
              />

              Pollutant analysis

            </li>

            <li className="flex items-center gap-1.5">

              <CheckCircle2
                size={13}
                className="text-indigo-600"
              />

              Health recommendations

            </li>

          </ul>

          <Button
            variant="primary"
            className="mt-4 w-full"
            onClick={() =>
              router.push(
                `/report?city=${city}`
              )
            }
          >
            Generate Report — ₹1
          </Button>

        </Card>

      </div>

    </div>
  );
}
