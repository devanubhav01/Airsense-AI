"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Gauge from "@/components/Gauge";
import { CITIES, FORECAST_7DAY, POLLUTANT_LABELS, getBand } from "@/lib/data";

export default function DashboardPage() {
    const router = useRouter();
    const [city, setCity] = useState("Delhi");
    const [compareCity, setCompareCity] = useState("Mumbai");
    const [view, setView] = useState("AQI");
    const cityData = CITIES.find((c) => c.name === city);
    const compareData = CITIES.find((c) => c.name === compareCity);
    const band = getBand(cityData.aqi);
    const tomorrow = FORECAST_7DAY[1].aqi;
    const trendUp = tomorrow > cityData.aqi;

    const pollutantData = Object.entries(POLLUTANT_LABELS).map(([key, label]) => ({
        name: label, value: cityData[key],
    }));

    return (
        <div className="mx-auto max-w-7xl bg-slate-50 px-5 py-10 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Hi, Anubhav 👋 — here's {city}'s air quality today
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Last updated 6 minutes ago</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    <MapPin size={14} className="text-slate-400" />
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none">
                        {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Current AQI</div>
                    <div className={`mt-2 text-4xl font-semibold ${band.text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{cityData.aqi}</div>
                    <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${band.bg} ${band.text}`}>{band.label}</span>
                </Card>
                <Card>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Tomorrow's Forecast</div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-4xl font-semibold ${getBand(tomorrow).text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{tomorrow}</span>
                        {trendUp ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-emerald-500" />}
                    </div>
                    <span className="mt-2 inline-block text-[11px] text-slate-500">{trendUp ? "Rising" : "Improving"} vs. today</span>
                </Card>
                <Card>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Dominant Pollutant</div>
                    <div className="mt-2 text-4xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>PM2.5</div>
                    <span className="mt-2 inline-block text-[11px] text-slate-500">{cityData.pm25} µg/m³</span>
                </Card>
                <Card>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Health Advisory</div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {band.label === "Good" || band.label === "Moderate" ? "Air quality is acceptable for outdoor activity." : "Limit prolonged outdoor exertion, especially for sensitive groups."}
                    </p>
                </Card>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-slate-900">Pollution Heatmap</h3>
                        <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5">
                            {["PM2.5", "PM10", "AQI"].map((v) => (
                                <button key={v} onClick={() => setView(v)} className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${view === v ? "bg-indigo-600 text-white" : "text-slate-500"}`}>{v}</button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 grid h-56 grid-cols-6 gap-1.5 overflow-hidden rounded-xl">
                        {Array.from({ length: 24 }).map((_, i) => {
                            const seedVal = (cityData.aqi + i * 37) % 500;
                            const zoneBand = getBand(seedVal);
                            return <div key={i} style={{ backgroundColor: zoneBand.hex, opacity: 0.5 + (i % 3) * 0.15 }} className="rounded-md" />;
                        })}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">Zone-level {view} intensity across {city} · darker = higher concentration</p>
                </Card>

                <Card>
                    <h3 className="mb-2 text-[15px] font-semibold text-slate-900">Instrument Readout</h3>
                    <Gauge value={cityData.aqi} />
                    <div className="-mt-3 text-center text-2xl font-semibold text-slate-900" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{cityData.aqi}</div>
                </Card>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <Card>
                    <h3 className="text-[15px] font-semibold text-slate-900">7-Day AQI Trend</h3>
                    <div className="mt-4 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={FORECAST_7DAY}>
                                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                                <Line type="monotone" dataKey="aqi" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3, fill: "#4F46E5" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h3 className="text-[15px] font-semibold text-slate-900">Pollutant Breakdown</h3>
                    <div className="mt-4 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pollutantData}>
                                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {pollutantData.map((_, i) => <Cell key={i} fill={i === 0 ? "#EF4444" : "#CBD5E1"} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <h3 className="text-[15px] font-semibold text-slate-900">City Comparison</h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                            <div className="text-xs text-slate-500">{city}</div>
                            <div className={`mt-1 text-3xl font-semibold ${getBand(cityData.aqi).text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{cityData.aqi}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                            <select value={compareCity} onChange={(e) => setCompareCity(e.target.value)} className="mx-auto block bg-transparent text-xs text-slate-500 outline-none">
                                {CITIES.filter((c) => c.name !== city).map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                            <div className={`mt-1 text-3xl font-semibold ${getBand(compareData.aqi).text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{compareData.aqi}</div>
                        </div>
                    </div>
                </Card>

                <Card className="border-indigo-200 bg-indigo-50/50">
                    <h3 className="text-[15px] font-semibold text-slate-900">Get Detailed Report</h3>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-600" /> 7-day forecast</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-600" /> Pollutant analysis</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-indigo-600" /> Health recommendations</li>
                    </ul>
                    <Button variant="primary" className="mt-4 w-full" onClick={() => router.push("/report")}>Generate Report — ₹49</Button>
                </Card>
            </div>
        </div>
    );
}