"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Landmark,
  ShieldCheck,
  ShieldAlert,
  Building2,
} from "lucide-react";

import Card from "@/components/Card";
import { BASE } from "@/lib/fallback-data";
import { getBand, POLLUTANT_LABELS } from "@/lib/data";

// Everything on this page is derived from AirSense's own cached city
// baseline snapshot (lib/fallback-data.js) — the same static numbers used
// elsewhere in the app. There is no live WAQI/government feed wired into
// this page; it's a static, government-facing summary view.

// Indian NAAQS-style 24-hr reference thresholds, used only to flag whether
// a city's cached snapshot sits above/below the standard for that pollutant.
const STANDARDS = {
  pm25: { limit: 60, unit: "µg/m³" },
  pm10: { limit: 100, unit: "µg/m³" },
  no2: { limit: 80, unit: "µg/m³" },
  so2: { limit: 80, unit: "µg/m³" },
  co: { limit: 4, unit: "mg/m³" },
  o3: { limit: 100, unit: "µg/m³" },
};

const CITY_ROWS = Object.entries(BASE).map(([name, values]) => ({
  name,
  ...values,
  band: getBand(values.aqi),
}));

function compliancePercent(pollutantKey) {
  const compliant = CITY_ROWS.filter(
    (row) => row[pollutantKey] <= STANDARDS[pollutantKey].limit
  ).length;
  return Math.round((compliant / CITY_ROWS.length) * 100);
}

export default function AdminAnalyticsPage() {
  const worstCity = [...CITY_ROWS].sort((a, b) => b.aqi - a.aqi)[0];
  const bestCity = [...CITY_ROWS].sort((a, b) => a.aqi - b.aqi)[0];
  const avgAqi = Math.round(
    CITY_ROWS.reduce((sum, row) => sum + row.aqi, 0) / CITY_ROWS.length
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex items-center gap-2.5">
        <Landmark size={20} className="text-indigo-600" />
        <h1 className="text-2xl font-semibold text-slate-900">Gov Analytics</h1>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        City-wise air quality overview for monitoring and policy reference.
        Figures are drawn from AirSense's cached baseline snapshot, not a
        live regulatory feed.
      </p>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            National Average AQI
          </div>
          <div
            className="mt-2 text-4xl font-semibold text-slate-900"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {avgAqi}
          </div>
          <span className="mt-2 inline-block text-[11px] text-slate-500">
            Across {CITY_ROWS.length} tracked cities
          </span>
        </Card>

        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Most Affected City
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-600">
            {worstCity.name}
          </div>
          <span className="mt-2 inline-block text-[11px] text-slate-500">
            AQI {worstCity.aqi} · {worstCity.band.label}
          </span>
        </Card>

        <Card>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Cleanest City
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">
            {bestCity.name}
          </div>
          <span className="mt-2 inline-block text-[11px] text-slate-500">
            AQI {bestCity.aqi} · {bestCity.band.label}
          </span>
        </Card>
      </div>

      {/* ================= AQI COMPARISON CHART ================= */}
      <Card className="mt-6">
        <h3 className="text-[15px] font-semibold text-slate-900">
          City-wise AQI Comparison
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Cached baseline AQI, colour-coded by severity band.
        </p>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CITY_ROWS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="aqi" radius={[6, 6, 0, 0]}>
                {CITY_ROWS.map((row) => (
                  <Cell key={row.name} fill={row.band.hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ================= COMPLIANCE OVERVIEW ================= */}
      <Card className="mt-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-indigo-600" />
          <h3 className="text-[15px] font-semibold text-slate-900">
            NAAQS Standard Compliance
          </h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Share of tracked cities within the 24-hr national reference limit for each pollutant.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.keys(STANDARDS).map((key) => {
            const pct = compliancePercent(key);
            const ok = pct >= 50;
            return (
              <div
                key={key}
                className={`rounded-xl border p-3 ${ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
              >
                <div className="flex items-center gap-1.5">
                  {ok ? (
                    <ShieldCheck size={14} className="text-emerald-600" />
                  ) : (
                    <ShieldAlert size={14} className="text-red-600" />
                  )}
                  <span className="text-[11px] font-medium text-slate-700">
                    {POLLUTANT_LABELS[key]}
                  </span>
                </div>
                <div className={`mt-1.5 text-xl font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>
                  {pct}%
                </div>
                <span className="text-[10px] text-slate-500">
                  limit {STANDARDS[key].limit} {STANDARDS[key].unit}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ================= CITY-WISE DATA TABLE ================= */}
      <Card className="mt-6 overflow-x-auto">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-indigo-600" />
          <h3 className="text-[15px] font-semibold text-slate-900">
            City-wise Pollutant Breakdown
          </h3>
        </div>

        <table className="mt-4 w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4">City</th>
              <th className="py-2 pr-4">AQI</th>
              <th className="py-2 pr-4">Band</th>
              {Object.keys(STANDARDS).map((key) => (
                <th key={key} className="py-2 pr-4">{POLLUTANT_LABELS[key]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CITY_ROWS.map((row) => (
              <tr key={row.name} className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-medium text-slate-900">{row.name}</td>
                <td className="py-2.5 pr-4" style={{ color: row.band.hex }}>
                  <span className="font-semibold">{row.aqi}</span>
                </td>
                <td className="py-2.5 pr-4">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${row.band.bg} ${row.band.text}`}>
                    {row.band.label}
                  </span>
                </td>
                {Object.keys(STANDARDS).map((key) => {
                  const exceeds = row[key] > STANDARDS[key].limit;
                  return (
                    <td
                      key={key}
                      className={`py-2.5 pr-4 ${exceeds ? "font-medium text-red-600" : "text-slate-600"}`}
                    >
                      {row[key]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-[11px] text-slate-400">
          Red values exceed the 24-hr NAAQS reference limit for that pollutant.
        </p>
      </Card>
    </div>
  );
}
