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

import {
    POLLUTANT_LABELS,
    getBand
} from "@/lib/data";

const CITY_NAMES = [
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Kolkata",
    "Chennai",
    "Greater Noida"
];

function useCityData(cityName) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        let cancelled = false;

        setLoading(true);
        setError(null);

        fetch(
            `/api/city/${encodeURIComponent(cityName)}`
        )
            .then((res) => res.json())
            .then((json) => {

                if (cancelled) return;

                if (!json.success) {
                    throw new Error(
                        json.error ||
                        "Failed to load city data"
                    );
                }

                setData(json.data);

            })
            .catch((err) => {

                if (!cancelled) {
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
     * Get currently logged-in user's session.
     * The name, city, age etc. are linked to that
     * particular user's account.
     */
    const {
        data: session
    } = useSession();

    const [city, setCity] = useState("Delhi");

    const [compareCity, setCompareCity] =
        useState("Mumbai");

    const [view, setView] =
        useState("AQI");

    const {
        data: cityData,
        loading,
        error
    } = useCityData(city);

    const {
        data: compareData,
        loading: compareLoading
    } = useCityData(compareCity);

    /*
     * If the logged-in user has a saved city,
     * automatically select that city.
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

    if (loading || !cityData) {

        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">

                <div className="flex items-center gap-2 text-slate-500">

                    <Loader2
                        size={18}
                        className="animate-spin"
                    />

                    Fetching live AQI for {city}...

                </div>

            </div>
        );
    }

    if (error) {

        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5">

                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">

                    Couldn't load AQI data for {city}:{" "}
                    {error}

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
            : [
                {
                    day: "Today",
                    aqi: cityData.aqi
                }
            ];

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
                    ] ?? 0
            })
        );

    return (

        <div className="mx-auto max-w-7xl bg-slate-50 px-5 py-10 lg:px-8">

            {/* Header */}

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <h1
                        className="text-2xl font-semibold text-slate-900"
                        style={{
                            fontFamily:
                                "'Space Grotesk', sans-serif"
                        }}
                    >
                        Hi,{" "}
                        {session?.user?.name ||
                            "there"}{" "}
                        👋 — here's {city}'s air quality today
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

            {/* Main Stats */}

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                {/* Current AQI */}

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

                {/* Tomorrow */}

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

                {/* Forecast */}

                <Card>

                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        7-Day Forecast
                    </div>

                    <div className="mt-4 h-28">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <LineChart
                                data={forecast}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="day"
                                    tick={{
                                        fontSize: 10
                                    }}
                                />

                                <YAxis
                                    tick={{
                                        fontSize: 10
                                    }}
                                />

                                <Tooltip />

                                <Line
                                    type="monotone"
                                    dataKey="aqi"
                                    stroke="#4F46E5"
                                    strokeWidth={2}
                                    dot={{
                                        r: 3
                                    }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </Card>

                {/* AQI Gauge */}

                <Card>

                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Air Quality
                    </div>

                    <div className="mt-3 flex justify-center">

                        <Gauge
                            value={cityData.aqi}
                            max={500}
                        />

                    </div>

                </Card>

            </div>

            {/* Pollutants */}

            <div className="mt-6 grid gap-5 lg:grid-cols-2">

                <Card>

                    <div className="flex items-center justify-between">

                        <h3 className="text-[15px] font-semibold text-slate-900">
                            Pollutant Levels
                        </h3>

                        <select
                            value={view}
                            onChange={(e) =>
                                setView(
                                    e.target.value
                                )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                        >
                            <option value="AQI">
                                AQI
                            </option>
                        </select>

                    </div>

                    <div className="mt-5 h-64">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={pollutantData}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 10
                                    }}
                                />

                                <YAxis
                                    tick={{
                                        fontSize: 10
                                    }}
                                />

                                <Tooltip
                                    contentStyle={{
                                        background: "#fff",
                                        border: "1px solid #E2E8F0",
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

                <Card>

                    <h3 className="text-[15px] font-semibold text-slate-900">
                        Health Recommendations
                    </h3>

                    <div className="mt-4 space-y-3">

                        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                            Monitor AQI before planning outdoor activities.
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                            Consider wearing a mask when pollution levels are high.
                        </div>

                        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                            Keep windows closed during peak pollution periods.
                        </div>

                    </div>

                </Card>

            </div>

            {/* City Comparison + Report */}

            <div className="mt-6 grid gap-5 lg:grid-cols-3">

                <Card className="lg:col-span-2">

                    <h3 className="text-[15px] font-semibold text-slate-900">
                        City Comparison
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-4">

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
                                    .map(
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

                {/* Report */}

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
